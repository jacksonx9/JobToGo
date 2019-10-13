import indeed from 'indeed-scraper';
import axios from 'axios';
import cheerio from 'cheerio';

import mongoClient from '..';

class JobSearcher {
  constructor(database) {
    this.db = database;
  }

  async getJobs(query) {
    const results = await indeed.query({
      query,
      maxAge: '7',
      sort: 'relevance',
      limit: 10,
    });

    for (let result of results) {
      const jobPage = await axios.get(result.url).catch(e => console.log(e));
      const $ = cheerio.load(jobPage.data);
      result.description = $('#jobDescriptionText').text();
    }

    return results;
  }

  // TODO: if under 100 jobs, add non-existant jobs
  async updateJobs(query) {
    const jobsCollection = this.db.collection('jobs');
    const jobs = await this.getJobs(query);

    await jobsCollection.insertMany(jobs).catch(e => console.log(e));
  }


  // TODO: remove outdated jobs, db.collections.deleteMany()
};

export default JobSearcher;
