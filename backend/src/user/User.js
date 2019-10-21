import { Users } from '../schema';
import { OAuth2Client } from 'google-auth-library';
import credentials from '../../credentials/google';
import { ObjectId } from 'mongoose';

class User {
  constructor(app) {
    app.post('/users/googleLogin/', async (req, res) => {
      const loginRes = await this.loginGoogle(req.body.idToken);
      res.status(loginRes.status).send(loginRes.id);
    });

    this.googleAuth = new OAuth2Client(credentials.clientID);

    app.post('/users/create', async (req, res) => {
      const result = await user.createUser(testUser);
      res.status(result.status).send(result.id);
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
      const result = await this.addFriend(new ObjectId(req.body.user1Id), new ObjectId(req.body.user2Id));
      console.log(result);
      res.status(result.status).send(result.success);
    });

    // wrap in new ObjectId()
    // update function names

    app.post('/users/removeFriend', async (req, res) => {
      const result = await this.removeFriend(ObjectId(req.body.user1Id), ObjectId(req.body.user2Id));
      res.status(result.status).send(result.success);
    });

    app.post('/users/confirmFriend', async (req, res) => {
      const result = await this.confirmFriend(ObjectId(req.body.user1Id), ObjectId(req.body.user2Id));
      res.status(result.status).send(result.success);
    });

    app.post('/users/getFriends', async (req, res) => {
      const result = await this.getFriends(ObjectId(req.body.userId));
      res.status(result.status).send(result.friends);
    });

    app.post('/users/getSkills', async (req, res) => {
      const result = await this.getSkills(ObjectId(req.body.userId));
      res.status(result.status).send(result.skills);
    });
  }

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

    return userIdObj == null ? -1 : userIdObj._id;
  }

   // return: userId if succeeds and null otherwise
  async loginGoogle(idToken) {
    try {
      const ticket = await this.googleAuth.verifyIdToken({
        idToken,
        audience: credentials.clientID,
      });
      const email = ticket.payload.email;

      const user = await this._getUser(email);

      if (user === null) {
        const newUserId = await this.createUser({
          credentials: {
            userName: email,
            email,
            token: ticket.payload,
          }
        });
        return {
          id: newUserId,
          status: 200,
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
    //TODO: check both friends exits
    const res = Users.updateOne({ _id: new friendID },
      { $push: { pendingFriends: userID }}).catch(e => console.log(e));

    return {
      status: res.nModified === 1 ? 200 : 400,
      success: true
    }
  }

  // Returns true if success and false otherwise
  async removeFriend(userID, friendID) {
    const res1 = Users.updateOne( { _id: userID },
      { $pullAll: {friends: [friendID] }}).catch(e => console.log(e));
    const res2 = Users.updateOne( { _id: friendID },
      { $pullAll: {friends: [userID] }}).catch(e => console.log(e));

    return {
      status: res1.nModified === 1 && res2.nModified === 1 ? 200 : 400,
      success: true
    };
  }

  // userId belongs to the user confirming the friend request.
  // Returns true if success and false otherwise.
  async confirmFriend(userID, friendID) {
    const oldFriendUserObj = await Users.findOneAndUpdate(
      { _id: userID, pendingFriends: friendID },
      { $pullAll: {pendingFriends: [friendID] }, $push: { friends: [friendID] }})
      .catch(e => console.log(e));

    // Checks the friendId existed in the user's pendingFriend array
    if (!oldFriendUserObj.pendingFriends.includes(userID))
      return {
        status: 404,
        success: false
      };

    // Add user's id to friend's friend array
    const res = Users.updateOne({ _id: friendID },
      { $push: { friends: [userID] }}).catch(e => console.log(e));

    return {
      status: res.nModified === 1 ? 200 : 400,
      success: true
    };
  }

  // Array[userId]
  async getFriends(userID) {
    const friends = await Users.find(
      { _id : userID }, 'friends'
    ).catch(e => console.log(e));

    return {
      status: friends.length == 1 ? 200 : 400,
      friends: friends.length == 1 ? friends[0] : null
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

  // get UserId
  async _getUser(userEmail) {
    const user = await Users.find(
        { 'credentials.email': userEmail }, '_id'
    ).catch(e => console.log(e));

    return user.length > 0 ? user[0] : null;
  }
};

export default User;
