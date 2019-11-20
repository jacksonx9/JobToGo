import indeed from 'indeed-scraper';
import axios from 'axios';
import cheerio from 'cheerio';
import Logger from 'js-logger';
import scheduler from 'node-schedule';
import BottleNeck from 'bottleneck';

import AllSkills from '../all_skills';
import { Jobs, Users } from '../schema';
import { MIN_JOBS_IN_DB, RATE_LIMIT_CONFIG } from '../constants';
import jobConfig from './config';

class JobSearcher {
  constructor(jobAnalyzer) {
    this.logger = Logger.get(this.constructor.name);

    this.jobAnalyzer = jobAnalyzer;
    this.limiter = new BottleNeck(RATE_LIMIT_CONFIG);

    this.setupDailyUpdateJobStore();
  }

  setupDailyUpdateJobStore() {
    // Update job store at 0s, 0min, 0h UTC (midnight)
    scheduler.scheduleJob('0 0 0 * * *', async () => {
      await this.updateJobStore();
    });
  }

  async updateJobStore() {
    // First remove any outdated jobs
    // await this.removeOutdatedJobs();

    const count = await Jobs.countDocuments({});

    if (count >= MIN_JOBS_IN_DB) {
      return;
    }

    this.logger.info(`Less than ${MIN_JOBS_IN_DB} jobs, searching...`);

    // If we need more jobs, search and update the job store
    await this.searchAndUpdateJobs(jobConfig.keywords);
    // TODO: Change this to compute on only newly added jobs
    // Recompute job scores on all jobs
    await this.jobAnalyzer.computeJobScores();
  }

  async searchAndUpdateJobs(keyphrases) {
    const keywords = await AllSkills.getAll();

    await Promise.all(keyphrases.map(async (keyphrase) => {
      try {
        const queriedJobs = await indeed.query({
          query: keyphrase,
          ...jobConfig.indeedQuery,
        });

        const jobs = [];

        await Promise.all(queriedJobs.map(this.limiter.wrap(async (queriedJob) => {
          try {
            const job = queriedJob;
            // Add description, unique url to each result by scraping the webpage
            const jobPage = await axios.get(queriedJob.url);
            const $ = cheerio.load(jobPage.data);
            job.description = $(jobConfig.indeedJobDescTag).text();
            job.url = $(jobConfig.indeedJobUrlTag).attr('content');

            const jobExists = await Jobs.findOne({ url: job.url });
            // Check if job does not exist in the database already
            if (!jobExists) {
              job.keywords = [];
              // Compute count of each keyword in the job
              this.jobAnalyzer.computeJobKeywordCount(job, keywords);
              if (job.keywords.some(keyword => keyword.count > 0)) {
                jobs.push(job);
              }
            }
          } catch (e) {
            // If we fail to get the job page, just ignore the job
            this.logger.error(e);
          }
        })));

        this.logger.info(`Found ${jobs.length} jobs for keyword ${keyphrase}`);
        await this.addToJobStore(jobs);
      } catch (e) {
        this.logger.error(e);
      }
    }));
  }

  async addToJobStore(jobs) {
    await Jobs.insertMany(jobs, {
      ordered: false,
    }).catch((e) => {
      // Ignore duplicate entry error
      if (e.code !== 11000) {
        this.logger.error(e.errmsg);
      }
    });
  }

  async removeOutdatedJobs() {
    this.logger.info('Removing outdated jobs...');

    const jobs = await Jobs.find({});

    if (jobs.length === 0) {
      this.logger.info('No jobs to be removed!');
      return;
    }

    const outdatedJobIds = [];
    await Promise.all(jobs.map(this.limiter.wrap(async (job) => {
      try {
        const jobPage = await axios.get(job.url);
        const $ = cheerio.load(jobPage.data);
        // Look for HTML tags that determine a job has expired
        const expired = jobConfig.indeedExpiredTags.some(tag => $(tag).length > 0);
        if (expired) {
          outdatedJobIds.push(job._id);
        }
      } catch (e) {
        // If the job url is not found, we assume the job has been taken down
        if (e.response.status === 404) {
          outdatedJobIds.push(job._id);
        }
        // Or else log the error and keep the job
        this.logger.error(e.response.statusText);
      }
    })));

    try {
      // TODO: Change this so that jobs do not silently disappear
      // Remove jobs from all users
      await Users.updateMany({}, {
        $pullAll: {
          likedJobs: outdatedJobIds,
          seenJobs: outdatedJobIds,
        },
      });
      // Delete jobs from job store
      const deleteResult = await Jobs.deleteMany({
        _id: outdatedJobIds,
      });
      this.logger.info(`Removed ${deleteResult.deletedCount} outdated jobs!`);
    } catch (e) {
      this.logger.error(e);
    }
  }
}

export default JobSearcher;
