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
    const offset = skillsStart || 0; // if skillsStart = null, offset = 0
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
   * @param {*} userId
   */
  async getRelevantJobs(userId) {
    this.logger.info('Getting most relevant jobs.');

    let user;

    try {
      user = await Users.findById(userId).orFail();
    } catch (e) {
      return new Response(null, 'Invalid userId', 400);
    }

    const seenJobs = await this._getSeenJobs(userId);

    // If the user has not uploaded a resume, return random jobs
    if (user.keywords.length === 0) {
      return await this._getJobsForUserWithNoKeywords(seenJobs);
    }

    const unseenJobs = await Jobs.find({ _id: { $nin: seenJobs } }).lean();

    // Users don't need access to jobs' keywords
    const mostRelevantJobs = this._getMostRelevantJobs(user.keywords, unseenJobs);
    mostRelevantJobs.forEach((_, i) => delete mostRelevantJobs[i].keywords);

    Logger.timeEnd('testing');

    return new Response(mostRelevantJobs, '', 200);
  }

  async _getSeenJobs(userId) {
    const seenJobs = [];
    seenJobs.push(...await this.shortlister.getLikedJobs(userId));
    seenJobs.push(...await this.shortlister.getDislikedJobs(userId));
    return seenJobs;
  }

  async _getJobsForUserWithNoKeywords(seenJobs) {
    const randomJobs = [];

    randomJobs.push(
      ...await Jobs.find({ _id: { $nin: seenJobs } }).limit(JOBS_PER_SEND).lean(),
    );
    // Users don't need access to jobs' keywords
    randomJobs.forEach((_, i) => delete randomJobs[i].keywords);

    return new Response(randomJobs, '', 200);
  }

  /**
   * Get the most relevant jobs in jobs in average case of O(n) time complexity
   * using quick sort like implementation
   *
   * @param {*} userKeywords user's keywords
   * @param {*} jobs all jobs the user has not seen yet
   */
  _getMostRelevantJobs(userKeywords, jobs) {
    // If there are less unseenJobs than JOBS_PER_SEND
    if (jobs.length <= JOBS_PER_SEND) {
      // TODO: notify server to query for more jobs
      return jobs;
    }

    const jobScoreCache = new Map();

    const getKthSmallestElements = (left, right, k) => {
      const partition = () => {
        const jobScore = (job) => {
          let score = 0;

          if (jobScoreCache.has(job._id)) {
            score = jobScoreCache.get(job._id);
          } else {
            job.keywords.forEach((jobKeywordData) => {
              const userKeywordIdx = userKeywords.findIndex(userKeywordData => (
                jobKeywordData.name === userKeywordData.name
              ));

              // If the user and job share a similar keyword, add the job's tf_idf
              // multiplied with the user's weighting of the keyword to the job's score
              if (userKeywordIdx !== -1) {
                const { tfidf } = jobKeywordData;
                const userValueKeyword = userKeywords[userKeywordIdx].score;
                const userSeenKeywordTimes = userKeywords[userKeywordIdx].jobCount;
                const keywordWeight = userValueKeyword / userSeenKeywordTimes;
                score += tfidf * keywordWeight;
              }
            });
            jobScoreCache.set(job._id, score);
          }

          return score;
        };

        const m = Math.floor((right + left) / 2); // middle pointer
        let i = left; // left pointer
        let j = right; // right pointer
        const pivot_score = jobScore(jobs[m]);

        // Normal quick sort comparison and swapping
        while (i <= j) {
          while (jobScore(jobs[i]) < pivot_score) {
            i += 1;
          }
          while (jobScore(jobs[j]) > pivot_score) {
            j -= 1;
          }
          if (i <= j) {
            // eslint-disable-next-line no-param-reassign
            [jobs[i], jobs[j]] = [jobs[j], jobs[i]];
            i += 1;
            j -= 1;
          }
        }
        return i;
      }

      // Partition the array around last element and get position of pivot element in sorted array
      // eslint-disable-next-line no-use-before-define
      const pos = partition();

      // If position is same as k
      if (pos - left === k - 1) {
        return jobs.slice(0, JOBS_PER_SEND);
      }
      // If position is more, recur for left subarray
      if (pos - left > k - 1) {
        return getKthSmallestElements(userKeywords, jobs, left, pos - 1, k);
      }
      // Else recur for right subarray
      return getKthSmallestElements(userKeywords, jobs, pos + 1, right, k - pos + left - 1);
    }

    return getKthSmallestElements(0, jobs.length - 1, JOBS_PER_SEND);
  }
}

export default JobAnalyzer;
