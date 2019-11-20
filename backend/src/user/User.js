import { OAuth2Client } from 'google-auth-library';
import Logger from 'js-logger';

import Response from '../types';
import { Users } from '../schema';
import credentials from '../../credentials/google';

class User {
  constructor(app, allSkills) {
    this.logger = Logger.get(this.constructor.name);

    this.googleAuth = new OAuth2Client(credentials.clientId);

    this.allSkills = allSkills;

    app.post('/users/googleLogin', async (req, res) => {
      const { idToken, firebaseToken } = req.body;
      const response = await this.loginGoogle(idToken, firebaseToken);
      res.status(response.status).send(response);
    });

    app.post('/users/login', async (req, res) => {
      const { userName, password } = req.body;
      const response = await this.login(userName, password);
      res.status(response.status).send(response);
    });

    app.post('/users', async (req, res) => {
      const response = await User.createUser(req.body.userData);
      res.status(response.status).send(response);
    });

    app.post('/users/edit/userName', async (req, res) => {
      const response = await User.editUserName(req.body.userId, req.body.userName);
      res.status(response.status).send(response);
    });

    app.post('/users/edit/password', async (req, res) => {
      const response = await User.editPassword(req.body.userId, req.body.password);
      res.status(response.status).send(response);
    });

    app.get('/users/:userName', async (req, res) => {
      const response = await this.getUser(req.params.userName);
      res.status(response.status).send(response);
    });

    // param: user that contains the user's id and a json object userInfo
    app.put('/users/userInfo/:userId', async (req, res) => {
      const response = await this.updateUserInfo(req.params.userId, req.body.userInfo);
      res.status(response.status).send(response);
    });

    app.get('/users/skills/:userId', async (req, res) => {
      const response = await this.getSkills(req.params.userId);
      res.status(response.status).send(response);
    });
  }

  // IMPORTANT: DO NOT initialize friends and pendingFriends
  // return: userId if succeeds and null otherwise
  static async createUser(userData) {
    if (!userData) {
      return new Response(null, 'Invalid userData', 400);
    }

    if (!userData.credentials.email) {
      return new Response(userData.credentials.email, 'Invalid email', 400);
    }

    if (!userData.credentials.userName) {
      return new Response(userData.credentials.userName, 'Invalid username', 400);
    }

    // TODO: validation of password strength

    const existingUser = await Users.findOne({
      $or: [
        { 'credentials.email': userData.credentials.email },
        { 'credentials.userName': userData.credentials.userName },
      ],
    });

    if (existingUser !== null) {
      return new Response(null, 'Either username or email is already used', 400);
    }

    try {
      const user = await Users.create(userData);
      return new Response(user._id, '', 200);
    } catch (e) {
      return new Response(null, 'Malformed userData or user already exists', 400);
    }
  }

  async editPassword(userId, password) {
    return this._updateCredentials(userId, 'password', password);
  }

  async editUserName(userId, userName) {
    return this._updateCredentials(userId, 'userName', userName);
  }

  async _updateCredentials(userId, credName, credValue) {
    if (!userId || !credName || !credValue) {
      return new Response(null, 'Invalid userId or userData', 400);
    }

    try {
      const user = await Users.findById(userId).orFail();
      Object.assign(user.credentials[credName], credValue);
      return new Response(null, '', 200);
    } catch (e) {
      return new Response(null, 'Invalid userData', 400);
    }
  }

  // Returns userId if succeeds, -1 otherwise
  async login(userName, password) {
    if (!userName || !password) {
      return new Response(null, 'Invalid userName or password', 400);
    }

    try {
      const user = await Users.findOne({
        'credentials.userName': userName,
        'credentials.password': password,
      }).orFail();
      return new Response(user._id, '', 200);
    } catch (e) {
      return new Response(null, 'Invalid userName or password', 400);
    }
  }

  // return: userId if succeeds and null otherwise
  async loginGoogle(idToken, firebaseToken) {
    if (!idToken || !firebaseToken) {
      return new Response(null, 'Invalid idToken or firebaseToken', 400);
    }

    let ticket;
    try {
      // TODO: Verify firebase token

      // Verify google token
      ticket = await this.googleAuth.verifyIdToken({
        idToken,
        audience: credentials.clientId,
      });

      this.logger.info('Logging in with google: ');
      this.logger.info('Google ticket: ', ticket);
      this.logger.info('Firebase token: ', firebaseToken);
    } catch (e) {
      return new Response(null, 'Invalid idToken or firebaseToken', 400);
    }

    const { email } = ticket.payload;
    const user = await this._getUser(email);

    // user does not exist
    if (user === null) {
      const userInfo = {
        credentials: {
          email,
          idToken: ticket.payload,
          firebaseToken,
        },
      };
      return new Response(userInfo, '', 200);
    }

    return new Response(user._id, '', 200);
  }

  // Can pass in only fields that need to be updated
  // Returns true if success and false otherwise
  async updateUserInfo(userId, userInfo) {
    if (!userId || !userInfo) {
      return new Response(false, 'Invalid userId or userInfo', 400);
    }

    try {
      const user = await Users.findById(userId).orFail();
      Object.assign(user.userInfo, userInfo);
      await user.save();

      return new Response(true, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userId or userInfo', 400);
    }
  }

  // get UserId
  async _getUser(userEmail) {
    const user = await Users.findOne({ 'credentials.email': userEmail }).lean();
    return user;
  }

  async getUser(userName) {
    try {
      const user = await Users.findOne({
        'credentials.userName': userName,
      });
      const userData = {
        _id: user._id,
        userName,
        email: user.credentials.email,
      };

      return new Response(userData, '', 200);
    } catch (e) {
      return new Response(null, 'User not found', 404);
    }
  }

  async updateSkills(userId, skills) {
    if (!userId || !skills) {
      return new Response(false, 'Invalid userId or skills', 400);
    }

    try {
      const user = await Users.findById(userId).orFail();
      const { keywords } = user;
      const oldSkills = new Set(keywords.map(keyword => keyword.name));

      skills.forEach((skill) => {
        if (!oldSkills.has(skill)) {
          keywords.push({
            name: skill,
            score: 0,
            jobCount: 0,
            timestamp: Date.now(),
          });
        }
      });

      await user.save();

      // Update global set of skills
      await this.allSkills.update(skills);

      return new Response(true, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userId or skills', 400);
    }
  }

  // Array[strings]
  async getSkills(userId) {
    if (!userId) {
      return new Response(null, 'Invalid userId', 400);
    }

    try {
      const user = await Users.findById(userId).orFail();
      const skills = user.keywords.map(keyword => keyword.name);

      return new Response(skills, '', 200);
    } catch (e) {
      return new Response(null, 'Invalid userId', 400);
    }
  }
}

export default User;
