/* eslint-disable no-param-reassign */
import assert from 'assert';
import Logger from 'js-logger';
import { forEachAsync } from 'foreachasync';

import Response from '../types';
import AllSkills from '../all_skills';
import { Jobs, Users } from '../schema';
import { JOBS_PER_SEND } from '../constants';


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
   * @param {Array<String>} keywords
   * @param {Job} job
   */
  computeJobKeywordCount(job, keywords) {
    // Add the number of occurance of all keywords of the result
    const description = job.description.toLowerCase();
    keywords.forEach((keyword) => {
      // TODO: matches "java" with "javascript" from description
      // NOTE: if you map with spaces around it, problems such as "java," arise
      const re = new RegExp(keyword, 'g');
      job.keywords.push({
        name: keyword,
        count: (description.match(re) || []).length,
      });
    });
  }

  /**
   * Computes tf-idf scores for all jobs using all user skills
   * Optionally specify a range of skills to use
   *
   * @param {Number} skillsStart Index of first skill to use (nullable)
   * @param {Number} skillsEnd One past the index of the last skill to use (nullable)
   */
  async computeJobScores(skillsStart, skillsEnd) {
    this.logger.info('Starting to compute job scores...');

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
        const wordCount = job.description.split(' ').length;
        const tf = keywordOccurrences / wordCount;
        const idf = docCount !== 0 ? Math.log(jobs.length / docCount) : 0;
        const tfidf = tf * idf;

        // replace tf_idf score for a keyword for each job
        assert(tfidf >= 0 && tfidf <= 1);
        jobs[jobIdx].keywords[allKeywordIdx].tfidf = tfidf;

        await job.save();
      });
    });

    this.logger.info('Computed job scores!');
  }

  /**
   * Gets the JOBS_PER_SEND most relevant jobs to the user
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

    const seenJobs = await this.shortlister.getSeenJobs(userId);

    // If the user has not uploaded a resume, return random jobs
    if (user.keywords.length === 0) {
      return this._getJobsForUserWithNoKeywords(seenJobs);
    }

    const unseenJobs = await Jobs.find({ _id: { $nin: seenJobs } }).lean();
    const mostRelevantJobs = this._getMostRelevantJobs(user.keywords, unseenJobs);

    this._deleteJobKeywords(mostRelevantJobs);
    return new Response(mostRelevantJobs, '', 200);
  }

  async _getJobsForUserWithNoKeywords(seenJobs) {
    const randomJobs = [];

    randomJobs.push(
      ...await Jobs.find({ _id: { $nin: seenJobs } }).limit(JOBS_PER_SEND).lean(),
    );

    this._deleteJobKeywords(randomJobs);
    return new Response(randomJobs, '', 200);
  }

  /**
   * Users don't need access to jobs' keywords
   */
  _deleteJobKeywords(jobs) {
    jobs.forEach((_, i) => delete jobs[i].keywords);
  }

  /**
   * Get the most relevant jobs in jobs with average time complexity of O(n)
   * using quick sort like implementation
   *
   * @param {Array<String>} userKeywords user's keywords
   * @param {Array<Jobs>} jobs all jobs the user has not seen yet
   */
  _getMostRelevantJobs(userKeywords, jobs) {
    // If there are less unseenJobs than JOBS_PER_SEND
    if (jobs.length <= JOBS_PER_SEND) {
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
        return jobs.slice(0, JOBS_PER_SEND);
      }
      // If pivot is more, recur for left subarray
      if (pivot - left > k - 1) {
        return getKSmallestElements(left, pivot - 1, k);
      }
      // Else recur for right subarray
      return getKSmallestElements(pivot + 1, right, k - pivot + left - 1);
    };

    return getKSmallestElements(0, jobs.length - 1, JOBS_PER_SEND);
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
            ? userValueKeyword / userSeenKeywordTimes : 0;
          score += tfidf * keywordWeight;
        }
      });
      jobScoreCache.set(job._id, score);
    }

    return score;
  }
}

export default JobAnalyzer;
