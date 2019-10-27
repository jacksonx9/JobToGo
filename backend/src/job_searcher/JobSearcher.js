import indeed from 'indeed-scraper';
import axios from 'axios';
import cheerio from 'cheerio';
import Logger from 'js-logger';

import { Jobs } from '../schema';

import { MIN_JOBS_IN_DB } from '../constants';

class JobSearcher {
  constructor(jobAnalyzer) {
    this.logger = Logger.get(this.constructor.name);

    this.updateJobStore().then(() => {
      jobAnalyzer.computeJobScores()
      .then({})
      .catch(e => this.logger.error(e));
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
      'software', 'software intern', 'c++', 'java', 'javascript', 'python', 'android', 'react',
      'node.js'
    ]);

    this.logger.info(`Search complete! Found ${jobs.length} jobs.`);

    await this.addToJobStore(jobs).catch(e => this.logger.error(e));
  }

  async searchJobs(keyphrases) {
    let jobs = [];

    for (const keyphrase of keyphrases) {
      // TODO: change these hardcoded params
      const results = await indeed.query({
        query: keyphrase,
        maxAge: '30',
        sort: 'relevance',
        limit: 30,
      }).catch(e => this.logger.error(e));

      // Add description to each result by scraping the webpage
      for (let result of results) {
        const jobPage = await axios.get(result.url).catch(e => this.logger.error(e));
        const $ = cheerio.load(jobPage.data);
        result.description = $('#jobDescriptionText').text();
        result.url = $('#indeed-share-url').attr('content');
      }

      const filteredResults = results.filter(res =>
        typeof res.description === 'string' && res.description.length > 0);

      jobs.push(...filteredResults);
    }

    return jobs;
  }

  async addToJobStore(jobs) {
    await Jobs.insertMany(jobs, {
      ordered: false,
    }).catch(e => {
      // Ignore duplicate entry error
      if (e.code !== 11000) {
        this.logger.error(e.errmsg);
      }
    });
  }

  async removeOutdatedJobs() {

  }
};

export default JobSearcher;
