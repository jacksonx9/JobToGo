import indeed from 'indeed-scraper';
import axios from 'axios';
import cheerio from 'cheerio';
import { Jobs } from '../schema';

import { MIN_JOBS_IN_DB } from '..';

class JobSearcher {
  async updateJobStore() {
    const count = await Jobs.countDocuments({});

    // TODO: Change this arbitrary condition
    if (count > MIN_JOBS_IN_DB) {
      return;
    }

    console.log('Less than 100 jobs, searching...');

    // TODO: Change this to not only software
    const jobs = await this.searchJobs(['software']);

    console.log(`Search complete! Found ${jobs.length} jobs.`);

    await this.addToJobStore(jobs).catch(e => console.log(e));
  }

  async searchJobs(keyphrases) {
    let jobs = [];

    for (const keyphrase of keyphrases) {
      // TODO: change these hardcoded params
      const results = await indeed.query({
        query: keyphrase,
        maxAge: '30',
        sort: 'relevance',
        limit: 100,
      }).catch(e => console.log(e));

      // Add description to each result by scraping the webpage
      for (let result of results) {
        const jobPage = await axios.get(result.url).catch(e => console.log(e));
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
        console.log(e.errmsg);
      }
    });
  }

  async removeOutdatedJobs() {

  }
};

export default JobSearcher;
