import { Jobs } from '../schema';

class JobAnalyzer {
  constructor(app, user, shortlister) {
    this.shortlister = shortlister;
    this.user = user;

    app.get('/jobs/findJobs/:userId', async (req, res) => {
      try {
        const userId = req.params.userId;
        const jobsRes = await this.findJobs(userId);
        res.status(jobsRes.status).send(jobsRes.jobs);
      } catch(e) {
        console.log(e);
        res.status(500).send(false);
      }
    })
  }

  async findJobs(userId) {
    let jobs = [];
    let jobsUrls = new Set();
    const swipedJobs = [];
    
    try {
      const keywords = await this.user.getSkills(userId);
      swipedJobs.push(...await this.shortlister.getLikedJobs(userId));
      swipedJobs.push(...await this.shortlister.getDislikedJobs(userId));

      if (keywords.length === 0) {
        // TODO: Change arbitrary value
        jobs.push(...await Jobs.find({
          _id: { $nin: swipedJobs }
        }).limit(20));
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
          title: { $regex: re },
          _id: { $nin: swipedJobs }
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
