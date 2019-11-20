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
      const { email, password } = req.body;
      const response = await this.login(email, password);
      res.status(response.status).send(response);
    });

    app.get('/users/search/', async (req, res) => {
      const response = await User.searchUser(req.query.userId, req.query.subUserName);
      res.status(response.status).send(response);
    });

    app.post('/users', async (req, res) => {
      const response = await User.createUser(req.body.userData);
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

  // returns list of users that start with subUserName
  static async searchUser(userId, subUserName) {
    if (!userId) {
      return new Response(null, 'Invalid userId', 400);
    }

    const potentialUsers = await Users.find(
      {
        'credentials.userName':
        {
          $regex: `^${subUserName}`,
          $options: 'i',
        },
      },
      '_id credentials.userName friends',
    ).lean();

    const users = potentialUsers.map(user => ({
      _id: user._id,
      userName: user.credentials.userName,
      isFriend: user.friends.includes(userId),
    }));

    return new Response(users, '', 200);
  }

  // IMPORTANT: DO NOT initialize friends and pendingFriends
  // return: userId if succeeds and null otherwise
  static async createUser(userData) {
    if (!userData) {
      return new Response(null, 'Invalid userId', 400);
    }

    try {
      const user = await Users.create(userData);
      return new Response(user._id, '', 200);
    } catch (e) {
      return new Response(null, 'Malformed userData or user already exists', 400);
    }
  }

  // check for existing user in database (via email)
  async _userExists(userEmail) {
    try {
      await Users.findOne({
        'credentials.email': userEmail,
      }).orFail();
      return true;
    } catch (e) {
      return false;
    }
  }

  // Returns userId if succeeds, -1 otherwise
  async login(email, password) {
    if (!email || !password) {
      return new Response(null, 'Invalid email or password', 400);
    }

    try {
      const user = await Users.findOne({
        'credentials.email': email,
        'credentials.password': password,
      }).orFail();
      return new Response(user._id, '', 200);
    } catch (e) {
      return new Response(null, 'Invalid email or password', 400);
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

    // If user does not exist, create
    if (user === null) {
      const userResult = await User.createUser({
        credentials: {
          userName: email,
          email,
          idToken: ticket.payload,
          firebaseToken,
        },
      });
      return userResult;
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
    const user = await Users.findOne({ 'credentials.email': userEmail });
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
