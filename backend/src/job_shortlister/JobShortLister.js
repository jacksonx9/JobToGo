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
      const response = await this.getLikedJobs(req.params.userId);
      res.status(response.status).send(response);
    });

    app.delete('/jobs', async (req, res) => {
      const { userId, jobId } = req.body;
      const response = await this.removeJob(userId, jobId, false);
      res.status(response.status).send(response);
    });

    app.delete('/jobs/all', async (req, res) => {
      const response = await this.clearLikedJobs(req.body.userId);
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

        this.logger.info('Reset daily job count for all users!');
      } catch (e) {
        this.logger.error(e);
      }
    });
  }

  async getSeenJobIds(userId) {
    // Throws if userId is invalid
    const user = await Users.findById(userId, 'seenJobs').lean().orFail();
    return user.seenJobs;
  }

  async getLikedJobs(userId) {
    let jobIds;

    if (!userId) {
      return new Response(null, 'Invalid userId', 400);
    }

    try {
      const user = await Users.findById(userId, 'likedJobs').orFail();
      jobIds = user.likedJobs;
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

  async unseenJob(userId, jobId) {
    const res = this.removeJob(userId, jobId, true);

    if (res.status !== 200) {
      return res;
    }

    try {
      const job = await Jobs.findById(jobId).orFail();
      const user = await Users.findById(userId).orFail();

      // Increment and decrement the user's keywords' score
      job.keywords.forEach((jobKeywordData) => {
        const userKeywordIdx = user.keywords.findIndex(userKeywordData => (
          jobKeywordData.name === userKeywordData.name
        ));

        if (userKeywordIdx !== -1) {
          user.keywords[userKeywordIdx].score -= jobKeywordData.count;
          user.keywords[userKeywordIdx].jobCount -= 1;
        }
      });

      user.dailyJobCount -= 1;

      await user.save();

      return new Response(true, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userId or jobId', 400);
    }
  }

  async removeJob(userId, jobId, removeFromSeen) {
    if (!userId || !jobId) {
      return new Response(false, 'Invalid userId or jobId', 400);
    }

    try {
      const user = await Users.findById(userId).orFail();
      await Jobs.findById(jobId).orFail();

      if (!user.seenJobs.includes(jobId)) {
        return new Response(false, 'Not a liked job', 400);
      }

      if (user.likedJobs.includes(jobId)) {
        await Users.findByIdAndUpdate(userId, {
          $pull: {
            likedJobs: jobId,
          },
        }).orFail();
      }

      if (removeFromSeen) {
        await Users.findByIdAndUpdate(userId, {
          $pull: {
            seenJobs: jobId,
          },
        }).orFail();
      }

      return new Response(true, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userId or jobId', 400);
    }
  }

  async clearLikedJobs(userId) {
    if (!userId) {
      return new Response(false, 'Invalid userId', 400);
    }

    try {
      await Users.findByIdAndUpdate(userId, {
        likedJobs: [],
      }).orFail();

      return new Response(true, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userId', 400);
    }
  }

  async addLikedJobs(userId, jobId) {
    return this._addLikedDislikedJobs(userId, jobId, 'likedJobs');
  }

  async addDislikedJobs(userId, jobId) {
    return this._addLikedDislikedJobs(userId, jobId, 'dislikedJobs');
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
        seenJobs: jobId,
      });

      if (userSeenJob !== null) {
        return new Response(false, 'Job already selected once', 400);
      }

      if (type === 'likedJobs') {
        await Users.findByIdAndUpdate(userId, {
          $addToSet: {
            likedJobs: jobId,
            seenJobs: jobId,
          },
        }).orFail();
      } else {
        await Users.findByIdAndUpdate(userId, {
          $addToSet: {
            seenJobs: jobId,
          },
        }).orFail();
      }

      const user = await Users.findById(userId).orFail();

      // Increment and decrement the user's keywords' score
      job.keywords.forEach((jobKeywordData) => {
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
      });

      user.dailyJobCount += 1;

      await user.save();

      return new Response(true, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userId or jobId', 400);
    }
  }
}

export default JobShortLister;
