import indeed from 'indeed-scraper';
import axios from 'axios';
import cheerio from 'cheerio';
import Logger from 'js-logger';

import AllSkills from '../all_skills';
import { Jobs } from '../schema';
import { MIN_JOBS_IN_DB } from '../constants';

class JobSearcher {
  constructor(jobAnalyzer) {
    this.logger = Logger.get(this.constructor.name);

    this.jobAnalyzer = jobAnalyzer;

    // TODO: Change this to run periodically instead of on startup
    this.updateJobStore().then(() => {
      jobAnalyzer.computeJobScores()
        .then({});
    }).catch(e => this.logger.error(e));
  }

  async updateJobStore() {
    const count = await Jobs.countDocuments({});

    // TODO: Change this arbitrary condition
    if (count > MIN_JOBS_IN_DB) {
      return;
    }

    this.logger.info(`Less than ${MIN_JOBS_IN_DB} jobs, searching...`);

    // TODO: Change this to not only software
    const jobs = await this.searchJobs([
      'software', 'software intern', 'c++', 'java',
      'javascript', 'python', 'android', 'react',
      'node.js', 'nodejs', 'mongo', 'ios', 'gpu', 'verilog',
      'linux', 'opengl', 'machine learning', 'neural networks',
      'pytorch', 'tensorflow',
    ]);

    this.logger.info(`Search complete! Found ${jobs.length} jobs.`);

    await this.addToJobStore(jobs);
  }

  async searchJobs(keyphrases) {
    const jobList = [];
    const keywords = await AllSkills.getAll();

    await Promise.all(keyphrases.map(async (keyphrase) => {
      // TODO: change these hardcoded params
      try {
        const jobs = await indeed.query({
          query: keyphrase,
          maxAge: '30',
          sort: 'relevance',
          limit: 30,
        });

        await Promise.all(jobs.map(async (job, jobIdx) => {
          // Add description, unique url to each result by scraping the webpage
          const jobPage = await axios.get(job.url);
          const $ = cheerio.load(jobPage.data);
          jobs[jobIdx].description = $('#jobDescriptionText').text();
          jobs[jobIdx].url = $('#indeed-share-url').attr('content');

          const jobExists = await Jobs.findOne({ url: jobs[jobIdx].url });
          // Check if job exists in the database already
          if (jobExists !== null) {
            return;
          }

          jobs[jobIdx].keywords = [];
          // Compute count of each keyword in the job
          this.jobAnalyzer.computeJobKeywordCount(jobs[jobIdx], keywords);
        }));

        jobList.push(...jobs);
      } catch (e) {
        this.logger.error(e);
      }
    }));

    return jobList;
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
}

export default JobSearcher;
