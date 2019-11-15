import Logger from 'js-logger';
import assert from 'assert';

import Response from '../types';
import { Users, Jobs } from '../schema';

class Friend {
  constructor(app, messenger) {
    this.logger = Logger.get(this.constructor.name);

    this.messenger = messenger;

    app.post('/friends/sendJob', async (req, res) => {
      const response = await this.sendJob(req.body.userId, req.body.friendId, req.body.jobId);
      res.status(response.status).send(response);
    });

    app.post('/friends/confirmJob', async (req, res) => {
      const response = await this.confirmJob(req.body.userId, req.body.jobId);
      res.status(response.status).send(response);
    });

    app.post('/friends/rejectJob', async (req, res) => {
      const response = await this.rejectJob(req.body.userId, req.body.jobId);
      res.status(response.status).send(response);
    });

    app.get('/friends/recommendedJobs/:userId', async (req, res) => {
      const response = await this.getRecommendedJobs(req.params.userId);
      res.status(response.status).send(response);
    });

    app.post('/friends', async (req, res) => {
      const response = await this.addFriend(req.body.userId, req.body.friendId);
      res.status(response.status).send(response);
    });

    app.delete('/friends', async (req, res) => {
      const response = await this.removeFriend(req.body.userId, req.body.friendId);
      res.status(response.status).send(response);
    });

    app.post('/friends/confirm', async (req, res) => {
      const response = await this.confirmFriend(req.body.userId, req.body.friendId);
      res.status(response.status).send(response);
    });

    app.get('/friends/:userId', async (req, res) => {
      const response = await this.getFriends(req.params.userId);
      res.status(response.status).send(response);
    });

    app.get('/friends/pending/:userId', async (req, res) => {
      const response = await this.getPendingFriends(req.params.userId);
      res.status(response.status).send(response);
    });

    app.delete('/friends/pending', async (req, res) => {
      const response = await this.removePendingFriend(req.body.userId, req.body.friendId);
      res.status(response.status).send(response);
    });
  }

  // Sends job from user to friend and alert using push notification
  async sendJob(userId, friendId, jobId) {
    if (!userId || !friendId || !jobId) {
      return new Response(false, 'Invalid userId, friendId, or jobId', 400);
    }

    // TODO: check if user has already seen or rejected the job
    try {
      // Verify userId is valid
      await Users.findById(userId).orFail();
      // Verify jobId is valid
      const job = await Jobs.findById(jobId).lean().orFail();

      // Verify user is not adding itself
      if (userId === friendId) {
        return new Response(false, 'Cannot add self as a friend', 400);
      }

      const friend = await this._verifyAreFriends(userId, friendId);
      if (friend === null) {
        return new Response(false, 'Not a friend', 400);
      }

      friend.seenJobs.push(jobId);
      friend.friendSuggestedJobs.push(jobId);
      await friend.save();

      // Send push notification
      const messageResponse = await this.messenger.sendFriendJob(userId, friendId, jobId);
      return new Response(messageResponse, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userId, friendId, or jobId', 400);
    }
  }

  // User confirms job sent from a friend
  async confirmJob(userId, jobId) {
    return this._removeJobFromSeen(userId, jobId, true);
  }

  // User reject job sent from a friend
  async rejectJob(userId, jobId) {
    return this._removeJobFromSeen(userId, jobId, false);
  }

  async _removeJobFromSeen(userId, jobId, addToLikedJobs) {
    if (!userId || !jobId) {
      return new Response(false, 'Invalid userId or jobId', 400);
    }

    try {
      // Verify userId is valid
      const user = await Users.findById(userId).orFail();
      // Verify jobId is valid
      await Jobs.findById(jobId).orFail();

      // Verify jobId is was sent by friend
      const idx = user.friendSuggestedJobs.indexOf(jobId);

      if (idx !== -1) {
        const job = user.friendSuggestedJobs.splice(idx, 1);

        if (addToLikedJobs) {
          user.likedJobs.push(...job);
        }
        await user.save();

        return new Response(true, '', 200);
      }

      return new Response(false, 'User did not get job from friend', 400);
    } catch (e) {
      return new Response(false, 'Invalid userId or jobId', 400);
    }
  }

  // Get jobs recommended by friends
  async getRecommendedJobs(userId) {
    if (!userId) {
      return new Response(null, 'Invalid userId', 400);
    }

    try {
      const user = await Users.findById(userId).lean().orFail();
      const jobIds = user.friendSuggestedJobs;
      const jobs = await Jobs.find({
        _id: { $in: jobIds },
      });

      return new Response(jobs, '', 200);
    } catch (e) {
      return new Response(null, 'Invalid userId', 400);
    }
  }

  // Adds the user making the friend request to the friend's pendingFriend array
  // Returns true if success and false otherwise
  async addFriend(userId, friendId) {
    if (!userId || !friendId) {
      return new Response(false, 'Invalid userId or friendId', 400);
    }

    try {
      // Verify userId is valid
      await Users.findById(userId).orFail();

      // Verify user is not adding itself
      if (userId === friendId) {
        return new Response(false, 'Cannot add self as a friend', 400);
      }

      const friend = await Users.findOne({
        _id: friendId,
        $or: [
          { pendingFriends: userId },
          { friends: userId },
        ],
      });

      // Verify friend has not already been added
      if (friend !== null) {
        return new Response(false, 'Friend has already been added', 400);
      }

      const user = await Users.findOne({
        _id: userId,
        pendingFriends: friendId,
      });

      // Verify friend has not already tried to add user
      if (user !== null) {
        return new Response(false, 'Friend already a pending friend of user', 400);
      }

      await Users.findByIdAndUpdate(friendId, {
        $addToSet: {
          pendingFriends: userId,
        },
      }).orFail();

      // Send push notification
      const messageResponse = await this.messenger.requestFriend(userId, friendId);
      return messageResponse;
    } catch (e) {
      return new Response(false, 'Invalid userId or friendId', 400);
    }
  }

  // Returns true if success and false otherwise
  async removeFriend(userId, friendId) {
    if (!userId || !friendId) {
      return new Response(false, 'Invalid userId or friendId', 400);
    }

    try {
      // TODO: do findOneAndUpdate and match userId, friendId, and update friends in one function
      // Verify userId and friendId are valid
      await Users.findById(userId).orFail();
      await Users.findById(friendId).orFail();

      const friend = await this._verifyAreFriends(userId, friendId);
      if (friend === null) {
        return new Response(false, 'Not a friend', 400);
      }

      // Remove friends from each other
      await Users.findByIdAndUpdate(friendId, {
        $pull: {
          friends: userId,
        },
      }).orFail();
      await Users.findByIdAndUpdate(userId, {
        $pull: {
          friends: friendId,
        },
      }).orFail();

      return new Response(true, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userId or friendId', 400);
    }
  }

  // Returns null if not friends and friend UserObj if succeeded
  _verifyAreFriends(userId, friendId) {
    return Users.findOne({
      _id: friendId,
      friends: userId,
    });
  }

  // userId belongs to the user confirming the friend request.
  // Returns true if success and false otherwise.
  async confirmFriend(userId, friendId) {
    if (!userId || !friendId) {
      return new Response(false, 'Invalid userId or friendId', 400);
    }

    try {
      // Verify userId and friendId are valid
      await Users.findById(userId).orFail();
      await Users.findById(friendId).orFail();

      // Verify friend is pending
      const friend = await Users.findOne({
        _id: userId,
        pendingFriends: friendId,
      });

      if (friend === null) {
        return new Response(false, 'Not a pending friend', 400);
      }

      // Add each other as friends and remove friend from pending friends list
      await Users.findByIdAndUpdate(userId, {
        $pull: {
          pendingFriends: friendId,
        },
        $addToSet: {
          friends: friendId,
        },
      }).orFail();
      await Users.findByIdAndUpdate(friendId, {
        $addToSet: {
          friends: userId,
        },
      }).orFail();

      return new Response(true, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userId or friendId', 400);
    }
  }

  async removePendingFriend(userId, friendId) {
    if (!userId || !friendId) {
      return new Response(false, 'Invalid userId or friendId', 400);
    }

    try {
      // Verify userId and friendId are valid
      await Users.findById(userId).orFail();
      await Users.findById(friendId).orFail();

      // Verify friend is pending
      const friend = await Users.findOne({
        _id: userId,
        pendingFriends: friendId,
      });

      if (friend === null) {
        return new Response(false, 'Not a pending friend', 400);
      }

      // remove friend from pending friends list
      await Users.findByIdAndUpdate(userId, {
        $pull: {
          pendingFriends: friendId,
        },
      }).orFail();

      return new Response(true, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userId or friendId', 400);
    }
  }

  async getFriends(userId) {
    return this._getFriendsPendingFriends(userId, 'friends');
  }

  async getPendingFriends(userId) {
    return this._getFriendsPendingFriends(userId, 'pendingFriends');
  }

  async _getFriendsPendingFriends(userId, type) {
    assert(type === 'pendingFriends' || type === 'friends');

    if (!userId) {
      return new Response(null, 'Invalid userId', 400);
    }

    try {
      // Get friends
      const user = await Users.findById(userId, type).orFail();
      // Get friendIds
      const friendIds = user[type];
      // Search friend data based on ids
      const friendsData = await Users.find({ _id: { $in: friendIds } }, 'credentials.userName');

      // Expose only id and userName to user
      const friendsNameId = friendsData.map(friend => ({
        _id: friend._id,
        userName: friend.credentials.userName,
      }));

      return new Response(friendsNameId, '', 200);
    } catch (e) {
      return new Response(null, 'Invalid userId', 400);
    }
  }
}

export default Friend;
