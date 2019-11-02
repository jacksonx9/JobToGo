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
   * @param {Number} skillsStart Index of first skill to use
   * @param {Number} skillsEnd One past the index of the last skill to use
   */
  async computeJobScores(skillsStart, skillsEnd) {
    this.logger.info('Starting to compute job scores...');

    const jobs = await Jobs.find({});
    const offset = skillsStart || 0;
    const allSkills = await AllSkills.getAll();
    const keywords = offset > 0 ? allSkills.slice(offset, skillsEnd) : allSkills;

    await forEachAsync(keywords, async (_, keywordIdxBase) => {
      const keywordIdx = keywordIdxBase + offset;
      // Count the number of jobs with the given skill
      const docCount = jobs.reduce((sum, job) => sum
        + Number(job.keywords[keywordIdx].count > 0), 0);

      // calculate tf_idf each doc and save it
      await forEachAsync(jobs, async (job, jobIdx) => {
        const keywordOccurrences = job.keywords[keywordIdx].count;
        const wordCount = job.description.split(' ').length;
        const tf = keywordOccurrences / wordCount;
        const idf = docCount !== 0 ? Math.log(jobs.length / docCount) : 0;

        // replace tf_idf score for a keyword for each job
        jobs[jobIdx].keywords[keywordIdx].tfidf = tf * idf;

        await job.save();
      });
    });

    this.logger.info('Computed job scores!');
  }

  async getRelevantJobs(userId) {
    this.logger.info('Getting most relevant jobs.');

    const swipedJobs = [];
    const mostRelevantJobs = [];
    const jobScoreCache = new Map();
    let user;

    if (!userId) {
      return new Response(null, 'Invalid userId', 400);
    }

    try {
      user = await Users.findById(userId).orFail();
    } catch (e) {
      return new Response(null, 'Invalid userId', 400);
    }

    // Get jobs the user has already seen
    swipedJobs.push(...await this.shortlister.getLikedJobs(userId));
    swipedJobs.push(...await this.shortlister.getDislikedJobs(userId));

    // If the user has not uploaded a resume
    if (user.keywords.length === 0) {
      mostRelevantJobs.push(
        ...await Jobs.find({ _id: { $nin: swipedJobs } }).limit(JOBS_PER_SEND).lean(),
      );
      // Users don't need keywords
      mostRelevantJobs.forEach((_, i) => delete mostRelevantJobs[i].keywords);

      return new Response(mostRelevantJobs, '', 200);
    }

    const unseenJobs = await Jobs.find({ _id: { $nin: swipedJobs } }).lean();

    // Compute overall tf_idf score of a job
    const jobScore = (job) => {
      let score = 0;

      if (jobScoreCache.has(job._id)) {
        score = jobScoreCache.get(job._id);
      } else {
        job.keywords.forEach((jobKeywordData) => {
          const userKeywordIdx = user.keywords.findIndex(userKeywordData => (
            jobKeywordData.name === userKeywordData.name
          ));

          if (userKeywordIdx !== -1) {
            const { tfidf } = jobKeywordData;
            const userValueKeyword = user.keywords[userKeywordIdx].score;
            const userSeenKeywordTimes = user.keywords[userKeywordIdx].jobCount;
            const keywordWeight = userValueKeyword / userSeenKeywordTimes;
            score += tfidf * keywordWeight;
          }
        });
        jobScoreCache.set(job._id, score);
      }

      return score;
    };

    // Get jobs with overall highest tfidf scores
    mostRelevantJobs.push(...unseenJobs
      .sort((jobA, jobB) => jobScore(jobA) - jobScore(jobB))
      .slice(0, JOBS_PER_SEND));

    // Users don't need keywords
    mostRelevantJobs.forEach((_, i) => delete mostRelevantJobs[i].keywords);

    return new Response(mostRelevantJobs, '', 200);
  }
}

export default JobAnalyzer;
