import { Users } from '../schema';
import { OAuth2Client } from 'google-auth-library';
import credentials from '../../credentials/google';

class User {
  constructor(app) {
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

    app.post('/users/googleLogin/', async (req, res) => {
      const loginRes = await this.loginGoogle(req.body.idToken);
      res.status(loginRes.status).send(loginRes.id);
    });

    this.googleAuth = new OAuth2Client(credentials.clientID);
  }

  // return: userId if succeeds and null otherwise
  async createUser(query) {
    const user = await Users.create(query).catch(e => console.log(e));
    return typeof user === 'undefined' ? null : user._id;
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
        const newUser = await this.createUser({
          credentials: {
            userName: email,
            email,
            token: ticket.payload,
          }
        });
        return {
          id: newUser.id,
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

  // Returns true if success and false otherwise
  async addFriend(userID, friendID) {
    const res = Users.updateOne(
      { _id: userID },
      { $push: { friends: friendID }}).catch(e => console.log(e));

    return res.nModified == 1 ? true : false;
  }

  // Returns true if success and false otherwise
  async removeFriend(userID, friendID) {

  }

  // Returns true if success and false otherwise
  async confirmFriend(userID, friendID) {

  }

  // Array[Users]
  async getFriends(userID) {

  }

  // Array[strings]
  async getSkills(userId) {
    try {
      const doc = await Users.findById(userId);
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
