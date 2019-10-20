import { Jobs } from '../schema';

class JobAnalyzer {
  // TODO: change to passing in User and getting user's keywords
  async findJobs(keywords) {
    let jobs = [];
    let jobsUrls = new Set();

    for (const keyword of keywords) {
      const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const re = new RegExp(escapedKeyword, 'i');

      const jobsMatchingKeyword = await Jobs.find(
        {
          description: { $regex: re },
          title: { $regex: re }
        },
        {
          _id: 0,
          __v: 0,
        }
      );

      jobsMatchingKeyword.forEach(job => {
        if (jobsUrls.has(job.url)) {
          return;
        }
        jobs.push(job);
        jobsUrls.add(job.url);
      });
    }

    return jobs;
  }
};

export default JobAnalyzer;
