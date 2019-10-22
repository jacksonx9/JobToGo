import { Users } from '../schema';
import { OAuth2Client } from 'google-auth-library';
import credentials from '../../credentials/google';

class User {
  constructor(app, messenger) {
    this.googleAuth = new OAuth2Client(credentials.clientID);
    this.messenger = messenger;

    app.post('/users/googleLogin/', async (req, res) => {
      const idToken = req.body.idToken;
      const firebaseToken = req.body.firebaseToken;
      const loginRes = await this.loginGoogle(idToken, firebaseToken);
      res.status(loginRes.status).send(loginRes.id);
    });

    app.post('/users/create', async (req, res) => {
      const result = await this.createUser(req.body.userData);
      res.status(result.status).send(result.id);
    });

    app.get('/users/:userName', async (req, res) => {
      const userRes = await this.getUser(req.params.userName);
      res.status(userRes.status).send(userRes.user);
    });

    // param: user that contains the user's id and a json object userInfo
    app.get('/users/update/:user', async (req, res) => {
      await this.updateUserInfo(req.params.user.id, req.params.user.info);
    });

    // param: userEmailPassword that contain the user's email and password
    // return: userId if succeeds and -1 otherwise
    app.get('/users/update/:userEmailPassword', async (req, res) => {
      res.send(await this.login(req.params.userEmailPassword.userEmail,
                                req.params.userEmailPassword.userPassword));
    });

    app.post('/users/addFriend', async (req, res) => {
      const result = await this.addFriend(req.body.userId, req.body.friendId);
      res.status(result.status).send(result.success);
    });

    app.delete('/users/removeFriend', async (req, res) => {
      const result = await this.removeFriend(req.body.userId, req.body.friendId);
      res.status(result.status).send(result.success);
    });

    app.post('/users/confirmFriend', async (req, res) => {
      const result = await this.confirmFriend(req.body.userId, req.body.friendId);
      res.status(result.status).send(result.success);
    });

    app.get('/users/getFriends/:userId', async (req, res) => {
      const result = await this.getFriends(req.params.userId);
      res.status(result.status).send(result.friends);
    });

    app.get('/users/getSkills/:userId', async (req, res) => {
      const result = await this.getSkills(req.params.userId);
      res.status(result.status).send(result.skills);
    });
  }

  // IMPORTANT: DO NOT initialize friends and pendingFriends
  // return: userId if succeeds and null otherwise
  async createUser(query) {
    const user = await Users.create(query).catch(e => console.log(e));
    return {
      id: typeof user === 'undefined' ? null : user._id,
      status: typeof user === 'undefined' ? 404 : 200
    };
  }

  // check for existing user in database (via email)
  async _userExists(userEmail) {
    const user = await Users.find(
        { 'credentials.email': userEmail },
        { _id: 0 }
    ).catch(e => console.log(e));
    return !user.length;
  }

  // Returns userId if succeeds, -1 otherwise
  async login(userEmail, userPassword) {
    const userIdObj = await Users.findOne(
      { 'credentials.email': userEmail, 'credentials.password': userPassword },
      '_id').catch(e => console.log(e));

    return userIdObj === null ? -1 : userIdObj._id;
  }

   // return: userId if succeeds and null otherwise
  async loginGoogle(idToken, firebaseToken) {
    try {
      const ticket = await this.googleAuth.verifyIdToken({
        idToken,
        audience: credentials.clientID,
      });
      const email = ticket.payload.email;

      const user = await this._getUser(email);

      if (user === null) {
        const newUserRes = await this.createUser({
          credentials: {
            userName: email,
            email,
            idToken: ticket.payload,
            firebaseToken: firebaseToken,
          }
        });
        return {
          id: newUserRes.id,
          status: newUserRes.status,
        };
      }

      return {
        id: user.id,
        status: 200,
      };
    } catch (e) {
      console.log(e);
      return {
        id: null,
        status: 400,
      };
    }
  }

  // Can pass in only fields that need to be updated
  // Returns true if success and false otherwise
  async updateUserInfo(userId, info) {
    try {
      const doc = await Users.findById(userId);
      Object.assign(doc.userInfo, info);
      await doc.save();

      return true;
    } catch(e) {
      console.log(e);
      return false;
    }
  }

  // Adds the user making the friend request to the friend's pendingFriend array
  // Returns true if success and false otherwise
  async addFriend(userID, friendID) {
    if (typeof await Users.findById(userID) !== 'undefined' &&
        typeof await Users.findById(friendID) !== 'undefined') {
      await Users.updateOne({ _id: friendID },
        { $addToSet: { 'pendingFriends': userID }})
        .exec()
        .catch(e => {
          console.log(e);
          return {
            status: 500,
            success: false
          };
        });

      const messageRes = await this.messenger.requestFriend(userId, friendId);

      return {
        status: messageRes ? 200 : 500,
        success: messageRes
      };
    }

    return {
      status: 404,
      success: true
    };
  }

  // Returns true if success and false otherwise
  async removeFriend(userID, friendID) {
    if (typeof await Users.findById(userID) !== 'undefined' &&
        typeof await Users.findById(friendID) !== 'undefined' &&
        await Users.findOne({ _id: userID, friends: friendID }) !== null &&
        await Users.findOne({ _id: friendID, friends: userID }) !== null
        ) {
      await Users.updateOne( { _id: userID },
        { $pull: { friends: friendID }})
        .catch(e => {
          console.log(e);
          return {
            status: 500,
            success: false
          };
        });
      await Users.updateOne( { _id: friendID },
        { $pull: { friends: userID }})
        .catch(e => {
          console.log(e);
          return {
            status: 500,
            success: false
          };
        });

      return {
        status: 200,
        success: true
      };
    }

    return {
      status: 404,
      success: false
    };
  }

  // userId belongs to the user confirming the friend request.
  // Returns true if success and false otherwise.
  async confirmFriend(userID, friendID) {
    if (typeof await Users.findById(userID) !== 'undefined' &&
        typeof await Users.findById(friendID) !== 'undefined' &&
        await Users.findOne({ _id: userID, pendingFriends: friendID }) !== null
        ) {
      await Users.findOneAndUpdate(
        { _id: userID, pendingFriends: friendID },
        { $pull: { pendingFriends: friendID }, $addToSet: { friends: friendID }})
        .catch(e => {
          console.log(e);
          return {
            status: 500,
            success: false
          };
        });

      await Users.updateOne({ _id: friendID },
        { $addToSet: { friends: userID }})
        .catch(e => {
          console.log(e);
          return {
            status: 500,
            success: false
          };
        });

      return {
        status: 200,
        success: true
      };
    }

    return {
      status: 404,
      success: false
    }
  }

  // Array[userId]
  async getFriends(userID) {
    const friends = await Users.find({ _id : userID }, 'friends')
      .catch(e => {
        console.log(e);
        return {
          status: 404,
          success: false
        };
      });

    return {
      status: friends.length === 1 ? 200 : 400,
      friends: friends.length === 1 ? friends[0] : null
    };
  }

  // Array[strings]
  async getSkills(userId) {
    try {
      const doc = await Users.findById(userId);
      if (typeof doc.userInfo === 'undefined' ||
          typeof doc.userInfo.skillsExperiences === 'undefined') {
        throw "UserInfo document is malformed";
      }
      return doc.userInfo.skillsExperiences;
    } catch(e) {
      console.log(e);
      return [];
    }
  }

  async getUser(userName) {
    const user = await Users.find(
        { 'credentials.userName': userName }
    ).catch(e => console.log(e));

    if (user.length === 0) {
      return {
        status: 404,
        user: null,
      };
    }

    return {
      status: 200,
      user: user[0],
    };
  }

  async _getUser(userEmail) {
    const user = await Users.find(
        { 'credentials.email': userEmail }, '_id'
    ).catch(e => console.log(e));

    return user.length > 0 ? user[0] : null;
  }
};

export default User;
