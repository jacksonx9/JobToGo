import { OAuth2Client } from 'google-auth-library';
import Logger from 'js-logger';

import { Users } from '../schema';
import credentials from '../../credentials/google';

class User {
  constructor(app) {
    this.logger = Logger.get(this.constructor.name);

    this.googleAuth = new OAuth2Client(credentials.clientId);

    app.post('/users/googleLogin/', async (req, res) => {
      const { idToken, firebaseToken } = req.body;
      const result = await this.loginGoogle(idToken, firebaseToken);
      res.status(result.status).send(result);
    });

    app.post('/users/login/', async (req, res) => {
      const { email, password } = req.body;
      const result = await this.login(email, password);
      res.status(result.status).send(result);
    });

    app.post('/users/', async (req, res) => {
      const result = await User.createUser(req.body.userData);
      res.status(result.status).send(result);
    });

    app.get('/users/:userName', async (req, res) => {
      const result = await this.getUser(req.params.userName);
      res.status(result.status).send(result);
    });

    // param: user that contains the user's id and a json object userInfo
    app.put('/users/userInfo/:userId', async (req, res) => {
      const result = await this.updateUserInfo(req.params.userId, req.body.userInfo);
      res.status(result.status).send(result);
    });

    app.get('/users/skills/:userId', async (req, res) => {
      const result = await this.getSkills(req.params.userId);
      res.status(result.status).send(result);
    });
  }

  // IMPORTANT: DO NOT initialize friends and pendingFriends
  // return: userId if succeeds and null otherwise
  static async createUser(userData) {
    if (!userData) {
      return {
        result: null,
        errorMessage: 'Invalid userData',
        status: 400,
      };
    }

    try {
      const user = await Users.create(userData);
      return {
        result: user._id,
        errorMessage: '',
        status: 200,
      };
    } catch (e) {
      return {
        result: null,
        errorMessage: 'Malformed userData or user already exists',
        status: 400,
      };
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
      return {
        result: null,
        errorMessage: 'Invalid email or password',
        status: 400,
      };
    }

    try {
      const user = await Users.findOne({
        'credentials.email': email,
        'credentials.password': password,
      }).orFail();
      return {
        result: user._id,
        errorMessage: '',
        status: 200,
      };
    } catch (e) {
      return {
        result: null,
        errorMessage: 'Invalid email or password',
        status: 400,
      };
    }
  }

  // return: userId if succeeds and null otherwise
  async loginGoogle(idToken, firebaseToken) {
    if (!idToken || !firebaseToken) {
      return {
        result: null,
        errorMessage: 'Invalid idToken or firebaseToken',
        status: 400,
      };
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
      return {
        result: null,
        errorMessage: 'Invalid idToken or firebaseToken',
        status: 400,
      };
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

    return {
      result: user._id,
      errorMessage: '',
      status: 200,
    };
  }

  // Can pass in only fields that need to be updated
  // Returns true if success and false otherwise
  async updateUserInfo(userId, userInfo) {
    if (!userId || !userInfo) {
      return {
        result: false,
        errorMessage: 'Invalid userId or userInfo',
        status: 400,
      };
    }

    try {
      const user = await Users.findById(userId).orFail();
      Object.assign(user.userInfo, userInfo);
      await user.save();

      return {
        result: true,
        errorMessage: '',
        status: 200,
      };
    } catch (e) {
      return {
        result: false,
        errorMessage: 'Invalid userId or userInfo',
        status: 400,
      };
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
      return {
        result: userData,
        errorMessage: '',
        status: 200,
      };
    } catch (e) {
      return {
        result: null,
        errorMessage: 'User not found',
        status: 404,
      };
    }
  }

  /* gets and returns a set containing the collective skills of all the users */
  static async getAllSkills() {
    const keywords = [];
    const users = await Users.find({});

    users.forEach((user) => {
      keywords.push(...user.userInfo.skillsExperiences);
    });

    return keywords;
  }

  // Array[strings]
  async getSkills(userId) {
    if (!userId) {
      return {
        result: null,
        errorMessage: 'Invalid userId',
        status: 400,
      };
    }

    try {
      const user = await Users.findById(userId).orFail();
      return {
        result: user.userInfo.skillsExperiences,
        errorMessage: '',
        status: 200,
      };
    } catch (e) {
      return {
        result: null,
        errorMessage: 'Invalid userId',
        status: 400,
      };
    }
  }
}

export default User;
