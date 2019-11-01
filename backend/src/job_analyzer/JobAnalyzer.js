import Logger from 'js-logger';
import { forEachAsync } from 'foreachasync';

import User from '../user';
import Response from '../types';
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
   * Computes the tf_idf scores for the new jobs.
   *
   * @returns {Response}
   */
  async computeJobScores() {
    this.logger.info('Starting to compute job scores...');

    const jobs = await Jobs.find({});
    const skills = await User._getAllSkills();

    await forEachAsync(skills, async (skill, skillIdx) => {
      const keyword = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const docCount = jobs.reduce((sum, posting) => sum
        + Number(posting.keywords[skillIdx].count > 0), 0);

      const jobsLen = jobs.length;
      // calculate tf_idf each doc and save it
      await forEachAsync(jobs, async (job, i) => {
        const keywordOccurrences = job.keywords[skillIdx].count; // TODO: what if new keyword?
        const wordCount = job.description.split(' ').length;
        const tf = keywordOccurrences / wordCount;
        const idf = docCount !== 0 ? Math.log(jobsLen / docCount) : 0;
        const tfidf = tf * idf;

        // add name and tf_idf score to each job's keywords the first time
        // replace tf_idf score for a keyword for each job
        const keywordIdx = job.keywords.findIndex(elem => elem.name === keyword);
        if (keywordIdx === -1) {
          job.keywords.push({
            name: keyword,
            tfidf,
          });
        } else {
          jobs[i].keywords[keywordIdx].tfidf = tfidf;
        }

        await job.save();
      });
    });

    this.logger.info('Computed job scores!');
  }

  /**
   * Gets the most relevant jobs to the user.
   *
   * @param {int} userId user's mongoose id
   * @returns {Response}
   */
  async getRelevantJobs(userId) {
    this.logger.info('Getting most relevant jobs.');

    const swipedJobs = [];
    const mostRelevantJobs = [];
    const jobScoreCache = new Map();
    let user;

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
