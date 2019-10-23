import { Users, Jobs } from '../schema';

class JobShortLister {
  constructor(app) {
    app.post('/jobs/addLikedJobs/', async (req, res) => {
      const userId = req.body.userId;
      const jobId = req.body.jobId;
      const addRes = await this.addLikedJobs(userId, jobId);
      res.status(addRes ? 200 : 400).send(addRes);
    });

    app.post('/jobs/addDislikedJobs/', async (req, res) => {
      const userId = req.body.userId;
      const jobId = req.body.jobId;
      const addRes = await this.addDislikedJobs(userId, jobId);
      res.status(addRes ? 200 : 400).send(addRes);
    });

    app.get('/jobs/getLikedJobs/:userId', async (req, res) => {
      try {
        const userId = req.params.userId;
        const jobsData = await this.getLikedJobsData(userId);
        res.status(200).send(jobsData);
      } catch(e) {
        console.log(e);
        res.status(400).send(null);
      }
    });
  }

  async addLikedJobs(userId, jobId) {
    try {
      const res = await Users.updateOne(
        { _id: userId },
        { $addToSet: { likedJobs: jobId }}
      );
      return res.nModified === 1;
    } catch(e) {
      console.log(e);
      return false;
    }
  }

  async addDislikedJobs(userId, jobId) {
    try {
      const res = await Users.updateOne(
        { _id: userId },
        { $addToSet: { dislikedJobs: jobId }}
      );
      return res.nModified === 1;
    } catch(e) {
      console.log(e);
      return false;
    }
  }

  async getLikedJobs(userId) {
    const doc = await Users.findById(userId);
    if (doc === null) {
      throw 'Invalid userId';
    }
    if (typeof doc.likedJobs === 'undefined') {
      throw 'Users doc is malformed';
    }

    return doc.likedJobs;
  }

  async getLikedJobsData(userId) {
    const jobIds = await this.getLikedJobs(userId);
    const jobsData = [];

    for (const id of jobIds) {
      const jobData = await Jobs.findById(id);
      if (jobData) {
        jobsData.push(jobData);
      }
    }

    return jobsData;
  }

  async getDislikedJobs(userId) {
    const doc = await Users.findById(userId);
    if (doc === null) {
      throw 'Invalid userId';
    }
    if (typeof doc.dislikedJobs === 'undefined') {
      throw 'Users doc is malformed';
    }

    return doc.dislikedJobs;
  }
};

export default JobShortLister;