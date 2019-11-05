import Logger from 'js-logger';
import { forEachAsync } from 'foreachasync';
import scheduler from 'node-schedule';
import assert from 'assert';

import Response from '../types';
import { Users, Jobs } from '../schema';

class JobShortLister {
  constructor(app) {
    this.logger = Logger.get(this.constructor.name);

    app.post('/jobs/like', async (req, res) => {
      const { userId, jobId } = req.body;
      const response = await this.addLikedJobs(userId, jobId);
      res.status(response.status).send(response);
    });

    app.post('/jobs/dislike', async (req, res) => {
      const { userId, jobId } = req.body;
      const response = await this.addDislikedJobs(userId, jobId);
      res.status(response.status).send(response);
    });

    app.get('/jobs/like/:userId', async (req, res) => {
      const response = await this.getLikedJobsData(req.params.userId);
      res.status(response.status).send(response);
    });

    this.setupResetDailyJobCount();
  }

  setupResetDailyJobCount() {
    // Reset daily job count for all users at 0s, 0min, 0h UTC (midnight)
    scheduler.scheduleJob('0 0 0 * * *', async () => {
      this.logger.info('Resetting daily job count for all users...');

      try {
        await Users.updateMany({}, {
          dailyJobCount: 0,
        });

        this.logger.info('Reset!');
      } catch (e) {
        this.logger.error(e);
      }
    });
  }

  async getSeenJobIds(userId) {
    const seenJobs = [];
    seenJobs.push(...await this.getLikedJobs(userId));
    seenJobs.push(...await this.getDislikedJobs(userId));
    return seenJobs;
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
      return new Response(null, 'Invalid userId', 400);
    }

    try {
      jobIds = await this.getLikedJobs(userId);
    } catch (e) {
      return new Response(null, 'Invalid userId', 400);
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

    return new Response(jobsData, '', 200);
  }

  async _addLikedDislikedJobs(userId, jobId, type) {
    assert(type === 'likedJobs' || type === 'dislikedJobs');

    if (!userId || !jobId) {
      return new Response(false, 'Invalid userId or jobId', 400);
    }

    try {
      // Make sure job is valid
      const job = await Jobs.findById(jobId).orFail();

      // Check if already swiped
      const userSeenJob = await Users.findOne({
        _id: userId,
        $or: [
          { likedJobs: jobId },
          { dislikedJobs: jobId },
        ],
      });

      if (userSeenJob !== null) {
        return new Response(false, 'Job already selected once', 400);
      }

      const user = await Users.findByIdAndUpdate(userId, { $addToSet: { [type]: jobId } }).orFail();

      // Increment and decrement the user's keywords' score
      job.keywords.forEach((jobKeywordData) => {
        try {
          const userKeywordIdx = user.keywords.findIndex(userKeywordData => (
            jobKeywordData.name === userKeywordData.name
          ));

          if (userKeywordIdx !== -1) {
            if (type === 'likedJobs') {
              user.keywords[userKeywordIdx].score += jobKeywordData.count;
            } else {
              user.keywords[userKeywordIdx].score -= jobKeywordData.count;
            }
            user.keywords[userKeywordIdx].jobCount += 1;
          }
        } catch (e) {
          this.logger.error(e);
        }
      });

      user.dailyJobCount += 1;

      await user.save();

      return new Response(true, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userId or jobId', 400);
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
