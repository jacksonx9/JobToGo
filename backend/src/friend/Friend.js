import Logger from 'js-logger';
import assert from 'assert';

import Response from '../types';
import { Users } from '../schema';

class Friend {
  constructor(app, messenger) {
    this.logger = Logger.get(this.constructor.name);

    this.messenger = messenger;

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

      await Users.findByIdAndUpdate(friendId, {
        $addToSet: {
          pendingFriends: userId,
        },
      }).orFail();

      // Send push notification
      const messageconst response = await this.messenger.requestFriend(userId, friendId);
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
      // Verify userId and friendId are valid
      await Users.findById(userId).orFail();
      await Users.findById(friendId).orFail();

      // Verify that users are friends
      const friend = await Users.findOne({
        _id: friendId,
        friends: userId,
      });

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
