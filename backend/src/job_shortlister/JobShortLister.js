import Logger from 'js-logger';
import { forEachAsync } from 'foreachasync';
import assert from 'assert';

import { Users, Jobs } from '../schema';

class JobShortLister {
  constructor(app) {
    this.logger = Logger.get(this.constructor.name);

    app.post('/jobs/like', async (req, res) => {
      const { userId, jobId } = req.body;
      const result = await this.addLikedJobs(userId, jobId);
      res.status(result.status).send(result);
    });

    app.post('/jobs/dislike', async (req, res) => {
      const { userId, jobId } = req.body;
      const result = await this.addDislikedJobs(userId, jobId);
      res.status(result.status).send(result);
    });

    app.get('/jobs/like/:userId', async (req, res) => {
      const result = await this.getLikedJobsData(req.params.userId);
      res.status(result.status).send(result);
    });
  }

  async addLikedJobs(userId, jobId) {
    return this._addLikedDislikedJobs(userId, jobId, 'likedJobs');
  }

  async addDislikedJobs(userId, jobId) {
    return this._addLikedDislikedJobs(userId, jobId, 'dislikedJobs');
  }

  async getLikedJobs(userId) {
    return this._getLikedDislikedJobs(userId, 'likedJobs');
  }

  async getDislikedJobs(userId) {
    return this._getLikedDislikedJobs(userId, 'dislikedJobs');
  }

  async getLikedJobsData(userId) {
    let jobIds;

    if (!userId) {
      return {
        result: null,
        errorMessage: 'Invalid userId',
        status: 400,
      };
    }

    try {
      jobIds = await this.getLikedJobs(userId);
    } catch (e) {
      return {
        result: null,
        errorMessage: 'Invalid userId',
        status: 400,
      };
    }

    const jobsData = [];

    await forEachAsync(jobIds, async (id) => {
      // If id is not a valid ObjectId, this will throw
      // But at that point we might as well crash since means our db is malformed
      const jobData = await Jobs.findById(id);

      if (jobData) {
        // Users don't need keywords
        const keywordlessJobData = jobData.toObject();
        delete keywordlessJobData.keywords;
        jobsData.push(keywordlessJobData);
      } else {
        this.logger.warn(
          `Job ${id} was present in ${userId}'s likedJobs, but no longer exists`,
        );
      }
    });

    return {
      result: jobsData,
      errorMessage: '',
      status: 200,
    };
  }

  async _addLikedDislikedJobs(userId, jobId, type) {
    assert(type === 'likedJobs' || type === 'dislikedJobs');

    if (!userId || !jobId) {
      return {
        result: false,
        errorMessage: 'Invalid userId or jobId',
        status: 400,
      };
    }

    try {
      // Make sure job is valid
      await Jobs.findById(jobId).orFail();

      // Check if already swiped
      const user = await Users.findOne({
        _id: userId,
        $or: [
          { likedJobs: jobId },
          { dislikedJobs: jobId },
        ],
      });

      if (user !== null) {
        return {
          result: false,
          errorMessage: 'Job already selected once',
          status: 400,
        };
      }

      await Users.findByIdAndUpdate(userId, { $addToSet: { [type]: jobId } }).orFail();

      return {
        result: true,
        errorMessage: '',
        status: 200,
      };
    } catch (e) {
      return {
        result: false,
        errorMessage: 'Invalid userId or jobId',
        status: 400,
      };
    }
  }

  async _getLikedDislikedJobs(userId, type) {
    assert(type === 'likedJobs' || type === 'dislikedJobs');

    // Throws if userId is invalid
    const doc = await Users.findById(userId, type).orFail();
    return doc[type];
  }
}

export default JobShortLister;
