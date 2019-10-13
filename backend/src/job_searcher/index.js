import indeed from 'indeed-scraper';
import axios from 'axios';
import cheerio from 'cheerio';

class JobSearcher {
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

  // if under 100 jobs, add non-existant jobs


  // remove outdated jobs, db.collections.deleteMany()
};

export default JobSearcher;
