/* eslint-disable no-param-reassign */
import assert from 'assert';
import Logger from 'js-logger';
import { forEachAsync } from 'foreachasync';
import { Types } from 'mongoose';

import Response from '../types';
import AllSkills from '../all_skills';
import { Jobs, Users } from '../schema';
import {
  JOBS_PER_SEND,
  JOBS_SEARCH_MAX_SIZE,
  JOBS_SEARCH_PERCENT_SIZE,
  DAILY_JOB_COUNT_LIMIT,
} from '../constants';


class JobAnalyzer {
  constructor(app, shortlister) {
    this.logger = Logger.get(this.constructor.name);
    this.shortlister = shortlister;

    app.get('/jobs/find/:userId', async (req, res) => {
      const response = await this.getRelevantJobs(req.params.userId);
      res.status(response.status).send(response);
    });
  }

  /**
   * Computes the number of times the given keywords appear in the given job
   * and modifies in the job in-place
   *
   * @param {Array<String>} keywords
   * @param {Job} job
   */
  computeJobKeywordCount(job, keywords) {
    const description = job.description.replace(/^[a-z ]/gi, ' ');
    // Add the number of occurance of all keywords in the description
    keywords.forEach((keyword) => {
      const re = new RegExp(` ${keyword} `, 'gi');
      job.keywords.push({
        name: keyword,
        count: (description.match(re) || []).length,
      });
    });
  }

  /**
   * Computes tf-idf scores for all jobs using user skills
   * Optionally specify a range of skills to use.
   * Default all skills
   *
   * @param {Number} skillsStart Index of first skill to update (inclusively and nullable)
   * @param {Number} skillsEnd Index of the last skill to update (noninclusive and nullable)
   */
  async computeJobScores(skillsStart, skillsEnd) {
    this.logger.info('Starting to compute job scores...');
    assert(skillsStart === undefined || skillsStart >= 0);
    assert(skillsEnd === undefined || skillsEnd >= 0);

    const jobs = await Jobs.find({});
    const offset = skillsStart || 0;
    const allSkills = await AllSkills.getAll();
    const newKeywords = offset > 0 ? allSkills.slice(offset, skillsEnd) : allSkills;

    await forEachAsync(newKeywords, async (_, newKeywordIdxBase) => {
      const allKeywordIdx = newKeywordIdxBase + offset;
      // Count the number of jobs with the given skill
      const docCount = jobs.reduce((sum, job) => sum
        + Number(job.keywords[allKeywordIdx].count > 0), 0);

      // calculate tf_idf each doc and save it
      await forEachAsync(jobs, async (job, jobIdx) => {
        const keywordOccurrences = job.keywords[allKeywordIdx].count;
        const totalKeywords = job.keywords.reduce((sum, keyword) => sum + keyword.count, 0);
        const tf = totalKeywords !== 0 ? keywordOccurrences / totalKeywords : 0;
        const idf = docCount !== 0 ? Math.log(jobs.length / docCount) : 0;
        const tfidf = tf * idf;

        assert(tfidf >= 0);
        // replace tf_idf score for a keyword for each job
        jobs[jobIdx].keywords[allKeywordIdx].tfidf = tfidf;

        await job.save();
      });
    });

    this.logger.info('Computed job scores!');
  }

  /**
   * Gets the most relevant jobs to the user
   *
   * @param {String} userId
   */
  async getRelevantJobs(userId) {
    this.logger.info('Getting most relevant jobs.');

    let user;

    try {
      user = await Users.findById(userId).orFail();
    } catch (e) {
      return new Response(null, 'Invalid userId', 400);
    }

    // Determine number of jobs to send based on daily limit
    let numJobsToSend = JOBS_PER_SEND;

    if (numJobsToSend + user.dailyJobCount > DAILY_JOB_COUNT_LIMIT) {
      numJobsToSend = DAILY_JOB_COUNT_LIMIT - user.dailyJobCount;
    }

    if (numJobsToSend <= 0) {
      return new Response(null, 'Exceeded maximum number of daily jobs', 403);
    }

    const seenJobIds = await this.shortlister.getSeenJobIds(userId);

    // If the user has not uploaded a resume, return random jobs
    if (user.keywords.length === 0) {
      return this._getJobsForUserWithNoKeywords(seenJobIds, numJobsToSend);
    }

    const unseenJobs = await this._getUnseenJobs(seenJobIds);
    const mostRelevantJobs = this._getMostRelevantJobs(user.keywords, unseenJobs, numJobsToSend);

    this._deleteJobKeywords(mostRelevantJobs);
    return new Response(mostRelevantJobs, '', 200);
  }

  async _getJobsForUserWithNoKeywords(seenJobIds, numJobsToSend) {
    const randomJobs = [];

    randomJobs.push(
      ...await Jobs.find({ _id: { $nin: seenJobIds } }).limit(numJobsToSend).lean(),
    );

    this._deleteJobKeywords(randomJobs);
    return new Response(randomJobs, '', 200);
  }

  /**
   * Users don't need access to jobs' keywords
   *
   * @param {Array<Job>} jobs all jobs to be sent to user
   */
  _deleteJobKeywords(jobs) {
    jobs.forEach((_, i) => delete jobs[i].keywords);
  }

  /**
   * If there are too many unseen jobs, it will take a long time to compute the most relevant jobs,
   * which would cause the user to wait for the next array of jobs. Therefore, if number of jobs
   * stored in the database reaches a value that hinders performance, we will search a smaller
   * subset of all the jobs randomly
   *
   * @param {Array<String>} seenJobIds job ids that the user has seen already
   */
  async _getUnseenJobs(seenJobIds) {
    if (await Jobs.countDocuments({}) > JOBS_SEARCH_MAX_SIZE) {
      const jobids = seenJobIds.map(el => Types.ObjectId(el));
      return Jobs.aggregate([
        { $match: { _id: { $nin: [jobids] } } },
        { $sample: { size: JOBS_SEARCH_MAX_SIZE * JOBS_SEARCH_PERCENT_SIZE } },
      ]);
    }

    return Jobs.find({ _id: { $nin: seenJobIds } }).lean();
  }

  /**
   * Get the most relevant jobs in jobs with average time complexity of O(n)
   * using quick sort like implementation
   *
   * @param {Array<String>} userKeywords user's keywords
   * @param {Array<Job>} jobs all jobs the user has not seen yet
   */
  _getMostRelevantJobs(userKeywords, jobs, numJobsToSend) {
    // If there are less unseenJobs than numJobsToSend
    if (jobs.length <= numJobsToSend) {
      // TODO: notify server to query for more jobs
      return jobs;
    }

    const jobScoreCache = new Map();
    const userKeywordsMap = new Map();

    userKeywords.forEach((keywordData) => {
      userKeywordsMap.set(keywordData.name, keywordData);
    });

    const getKSmallestElements = (left, right, k) => {
      const partition = () => {
        const pivotScore = this._jobScore(userKeywordsMap, jobScoreCache, jobs[right]);
        let l = left; // left pointer

        let idx = l;
        while (idx < right) {
          // Sort subarray from greatest to smallest
          if (this._jobScore(userKeywordsMap, jobScoreCache, jobs[idx]) >= pivotScore) {
            [jobs[l], jobs[idx]] = [jobs[idx], jobs[l]];
            l += 1;
          }
          idx += 1;
        }

        [jobs[l], jobs[right]] = [jobs[right], jobs[l]];
        return l;
      };

      assert(k > 0 && k <= right - left + 1);

      // Partition the array around last element and get position of pivot element in sorted array
      const pivot = partition();

      // If pivot is same as k
      if (pivot - left === k - 1) {
        return jobs.slice(0, numJobsToSend);
      }

      // If pivot is more, recur for left subarray
      if (pivot - left > k - 1) {
        return getKSmallestElements(left, pivot - 1, k);
      }
      // Else recur for right subarray
      return getKSmallestElements(pivot + 1, right, k - pivot + left - 1);
    };

    return getKSmallestElements(0, jobs.length - 1, numJobsToSend);
  }

  _jobScore(userKeywordsMap, jobScoreCache, job) {
    let score = 0;

    if (jobScoreCache.has(job._id)) {
      score = jobScoreCache.get(job._id);
    } else {
      job.keywords.forEach((jobKeywordData) => {
        // If the user and job share a similar keyword, add the job's tf_idf
        // multiplied with the user's weighting of the keyword to the job's score
        if (userKeywordsMap.has(jobKeywordData.name)) {
          const userKeywordData = userKeywordsMap.get(jobKeywordData.name);
          const { tfidf } = jobKeywordData;
          const userValueKeyword = userKeywordData.score;
          const userSeenKeywordTimes = userKeywordData.jobCount;
          const keywordWeight = userSeenKeywordTimes > 0
            ? userValueKeyword / userSeenKeywordTimes : 1;
          score += tfidf * keywordWeight;
        }
      });
      jobScoreCache.set(job._id, score);
    }

    return score;
  }
}

export default JobAnalyzer;
