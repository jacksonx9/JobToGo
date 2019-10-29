import Logger from 'js-logger';
import { forEachAsync } from 'foreachasync';

import User from '../user';
import { Jobs, Users } from '../schema';
import { JOBS_PER_SEND } from '../constants';


class JobAnalyzer {
  constructor(app, shortlister) {
    this.logger = Logger.get(this.constructor.name);
    this.shortlister = shortlister;

    app.get('/jobs/find/:userId', async (req, res) => {
      const result = await this.getRelevantJobs(req.params.userId);
      res.status(result.status).send(result);
    });
  }

  async computeJobScores() {
    this.logger.info('Starting to compute job scores...');

    const jobs = await Jobs.find({});
    const skills = await User._getAllSkills();

    await forEachAsync(skills, async (skill) => {
      let docCount = 0;
      const wordCount = [];
      const keywordCount = [];
      const keyword = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const re = new RegExp(keyword, 'g');

      jobs.forEach((posting) => {
        const count = (posting.description.toString().match(re) || []).length;
        wordCount.push(posting.description.split(' ').length);
        keywordCount.push(count);
        if (count > 0) {
          docCount += 1;
        }
      });

      let postingIdx = 0;
      const jobsLen = jobs.length;
      // calculate tf_idf each doc and save it
      await forEachAsync(jobs, async (job, i) => {
        const tf = keywordCount[postingIdx] / wordCount[postingIdx];
        const idf = docCount !== 0 ? Math.log(jobsLen / docCount) : 0;
        const tfidf = tf * idf;

        // add name and tf_idf score to each job's keywords the first time
        // replace tf_idf score for a keyword for each job
        const keywordIdx = job.keywords.findIndex((elem) => elem.name === keyword);
        if (keywordIdx === -1) {
          job.keywords.push({
            name: keyword,
            tfidf,
          });
        } else {
          jobs[i].keywords[keywordIdx].tfidf = tfidf;
        }

        await job.save();
        postingIdx += 1;
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
      return {
        result: null,
        message: 'Invalid userId',
        status: 400,
      };
    }

    try {
      user = await Users.findById(userId).orFail();
    } catch (e) {
      return {
        result: null,
        message: 'Invalid userId',
        status: 400,
      };
    }

    if (user === null) {
      return {
        result: null,
        message: 'Invalid userId',
        status: 400,
      };
    }

    const userKeywords = user.userInfo.skillsExperiences;

    // Get jobs the user has already seen
    swipedJobs.push(...await this.shortlister.getLikedJobs(userId));
    swipedJobs.push(...await this.shortlister.getDislikedJobs(userId));

    // If the user has not uploaded a resume
    if (userKeywords.length === 0) {
      mostRelevantJobs.push(
        ...await Jobs.find({ _id: { $nin: swipedJobs } }).limit(JOBS_PER_SEND).lean(),
      );
      // Users don't need keywords
      mostRelevantJobs.forEach((_, i) => delete mostRelevantJobs[i].keywords);

      return {
        result: mostRelevantJobs,
        message: '',
        status: 200,
      };
    }

    const unseenJobs = await Jobs.find({ _id: { $nin: swipedJobs } }).lean();

    // Compute overall tf_idf score of a job
    const jobScore = (job) => {
      let sum = 0;

      if (jobScoreCache.has(job.id)) {
        sum = jobScoreCache.get(job.id);
      } else {
        job.keywords.forEach((keyword) => {
          if (userKeywords.includes(keyword.name)) {
            sum += keyword.tfidf;
          }
        });
        jobScoreCache.set(job.id, sum);
      }

      return sum;
    };

    // Get jobs with overall highest tfidf scores
    mostRelevantJobs.push(...unseenJobs
      .sort((jobA, jobB) => {
        const jobAScore = jobScore(jobA);
        const jobBScore = jobScore(jobB);

        if (jobAScore > jobBScore) {
          return 1;
        }
        if (jobBScore < jobAScore) {
          return -1;
        }

        return 0;
      }).slice(0, JOBS_PER_SEND));

    // Users don't need keywords
    mostRelevantJobs.forEach((_, i) => delete mostRelevantJobs[i].keywords);

    return {
      result: mostRelevantJobs,
      message: '',
      status: 200,
    };
  }
}

export default JobAnalyzer;
