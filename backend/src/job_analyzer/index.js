import { Jobs } from '../schema';

class JobAnalyzer {
  constructor(app, user) {
    app.get('/jobs/findJobs', async (req, res) => {
      const userId = req.body.userId;
      const skills = await user.getSkills(userId);
      const jobsRes = await this.findJobs(skills);
      res.status(jobsRes.status).send(jobsRes.jobs);
    })
  }

  async findJobs(keywords) {
    let jobs = [];
    let jobsUrls = new Set();

    try {
      for (const keyword of keywords) {
        const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const re = new RegExp(escapedKeyword, 'i');
  
        const jobsMatchingKeyword = await Jobs.find({
          description: { $regex: re },
          title: { $regex: re }
        });
  
        jobsMatchingKeyword.forEach(job => {
          if (jobsUrls.has(job.url)) {
            return;
          }
          jobs.push(job);
          jobsUrls.add(job.url);
        });
      }

      return {
        jobs,
        status: 200,
      };
    } catch(e) {
      console.log(e);
      return {
        jobs: null,
        status: 400,
      };
    }
  }
};

export default JobAnalyzer;
