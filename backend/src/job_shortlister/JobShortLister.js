import Logger from 'js-logger';
import { forEachAsync } from 'foreachasync';
import assert from 'assert';

import { Users, Jobs } from '../schema';

class JobShortLister {
  constructor(app) {
    this.logger = Logger.get(this.constructor.name);

    app.post('/jobs/addLikedJobs/', async (req, res) => {
      const { userId, jobId } = req.body;
      const addRes = await this.addLikedJobs(userId, jobId);
      res.status(addRes ? 200 : 400).send(addRes);
    });

    app.post('/jobs/addDislikedJobs/', async (req, res) => {
      const { userId, jobId } = req.body;
      const addRes = await this.addDislikedJobs(userId, jobId);
      res.status(addRes ? 200 : 400).send(addRes);
    });

    app.get('/jobs/getLikedJobs/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const jobsData = await JobShortLister.getLikedJobsData(userId);
        res.status(200).send(jobsData);
      } catch (e) {
        this.logger.error(e);
        res.status(400).send(null);
      }
    });
  }

  async addLikedJobs(userId, jobId) {
    try {
      const res = await Users.updateOne(
        { _id: userId },
        { $addToSet: { likedJobs: jobId } },
      );
      return res.nModified === 1;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  async addDislikedJobs(userId, jobId) {
    try {
      const res = await Users.updateOne(
        { _id: userId },
        { $addToSet: { dislikedJobs: jobId } },
      );
      return res.nModified === 1;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  static async getLikedJobs(userId) {
    const doc = await Users.findById(userId);
    if (doc === null) {
      throw new Error('Invalid userId');
    }
    assert(typeof doc.likedJobs !== 'undefined');

    return doc.likedJobs;
  }

  static async getLikedJobsData(userId) {
    const jobIds = await JobShortLister.getLikedJobs(userId);
    const jobsData = [];

    await forEachAsync(jobIds, async (id) => {
      const jobData = await Jobs.findById(id);
      if (jobData) {
        jobsData.push(jobData);
      }
    });

    return jobsData;
  }

  static async getDislikedJobs(userId) {
    const doc = await Users.findById(userId);
    if (doc === null) {
      throw new Error('Invalid userId');
    }
    assert(typeof doc.dislikedJobs !== 'undefined');

    return doc.dislikedJobs;
  }
}

export default JobShortLister;
