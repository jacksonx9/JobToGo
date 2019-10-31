import indeed from 'indeed-scraper';
import axios from 'axios';
import cheerio from 'cheerio';
import Logger from 'js-logger';

import User from '../user';
import { Jobs } from '../schema';
import { MIN_JOBS_IN_DB } from '../constants';

class JobSearcher {
  constructor(jobAnalyzer) {
    this.logger = Logger.get(this.constructor.name);

    // TODO: Change this to run periodically instead of on startup
    this.updateJobStore().then(() => {
      jobAnalyzer.computeJobScores()
        .then({})
        .catch((e) => this.logger.error(e));
    }).catch((e) => this.logger.error(e));
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
    const jobs = [];
    const keywords = await User._getAllSkills();

    await Promise.all(keyphrases.map(async (keyphrase) => {
      // TODO: change these hardcoded params
      try {
        const results = await indeed.query({
          query: keyphrase,
          maxAge: '30',
          sort: 'relevance',
          limit: 30,
        });

        // Add description, unique url to each result by scraping the webpage
        await Promise.all(results.map(async (result, i) => {
          const jobPage = await axios.get(result.url);
          const $ = cheerio.load(jobPage.data);
          results[i].description = $('#jobDescriptionText').text();
          results[i].url = $('#indeed-share-url').attr('content');

          // Add the number of occurance of all keywords of the result
          results[i].keywords = [];
          keywords.forEach((keyword) => {
            // TODO: matches "java" with "javascript" from description
            // NOTE: if you map with spaces around it, problems such as "java," arise
            const re = new RegExp(keyword, 'g');
            results[i].keywords.push({
              name: keyword,
              count: (results[i].description
                .toLowerCase()
                .match(re) || []).length,
            });
          });
        }));

        jobs.push(...results);
      } catch (e) {
        this.logger.error(e);
      }
    }));

    return jobs;
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
