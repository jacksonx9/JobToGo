import { Jobs } from '../schema';

class JobAnalyzer {
  constructor(app, user) {
    app.get('/jobs/findJobs/:userId', async (req, res) => {
      try {
        const userId = req.params.userId;
        const skills = await user.getSkills(userId);
        const jobsRes = await this.findJobs(skills);
        res.status(jobsRes.status).send(jobsRes.jobs);
      } catch(e) {
        console.log(e);
        res.status(500).send(false);
      }
    });
  }

  async findJobs(keywords) {
    let jobs = [];
    let jobsUrls = new Set();

    try {
      if (keywords.length === 0) {
        // TODO: Change arbitrary value
        jobs.push(...await Jobs.find({}).limit(20));
        return {
          jobs,
          status: 200,
        };
      }

      for (const keyword of keywords) {
        // TODO: Change arbitrary value
        if (jobs.length == 20) {
          break;
        }

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
