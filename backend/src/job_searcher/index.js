import indeed from 'indeed-scraper';
import axios from 'axios';
import cheerio from 'cheerio';
import { Jobs } from '../schema';

class JobSearcher {
  constructor(app) {
    app.get('/jobs/:query', async (req, res) => {
      res.json(await this.getJobs(req.params.query));
    });
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
    const jobs = await this.getJobs(query);
    await Jobs.insertMany(jobs).catch(e => console.log(e));
  }


  // TODO: remove outdated jobs, db.collections.deleteMany()
};

export default JobSearcher;
