import { OAuth2Client } from 'google-auth-library';
import Logger from 'js-logger';

import Response from '../types';
import { Users } from '../schema';
import credentials from '../../credentials/google';

class User {
  constructor(app, redisClient, socket, allSkills) {
    this.logger = Logger.get(this.constructor.name);

    this.googleAuth = new OAuth2Client(credentials.clientId);

    this.allSkills = allSkills;
    this.redisClient = redisClient;
    this.socket = socket;

    app.post('/users/googleLogin', async (req, res) => {
      const { idToken, firebaseToken } = req.body;
      const response = await this.loginGoogle(idToken, firebaseToken);
      res.status(response.status).send(response);
    });

    app.put('/users/userName/:userId', async (req, res) => {
      const response = await this.editUserName(req.params.userId, req.body.userName);
      res.status(response.status).send(response);
    });

    app.put('/users/password/:userId', async (req, res) => {
      const response = await this.editPassword(req.params.userId, req.body.password);
      res.status(response.status).send(response);
    });

    app.post('/users/login', async (req, res) => {
      const { userName, password } = req.body;
      const response = await this.login(userName, password);
      res.status(response.status).send(response);
    });

    app.post('/users', async (req, res) => {
      const response = await this.createUser(req.body.userData);
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

    this.socket.on('connection', (clientSocket) => {
      clientSocket.on('users-search', async (subUserName) => {
        const userId = await this.redisClient.getAsync(clientSocket.id);
        clientSocket.emit('users', await User.searchUser(userId, subUserName));
      });

      // Register userId
      clientSocket.on('userId', async (userId) => {
        clientSocket.emit('userId', await this.handleUserId(userId, clientSocket.id));
      });
    });
  }

  async handleUserId(userId, socketId) {
    try {
      await Users.findById(userId).orFail();
      // Set mappings for both userId and socketId so we can retrieve both ways
      await this.redisClient.setAsync(userId, socketId);
      await this.redisClient.setAsync(socketId, userId);
      return new Response(true, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userId', 400);
    }
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
  async createUser(userData) {
    if (!userData || !userData.credentials || !userData.credentials.email
      || !userData.credentials.userName) {
      return new Response(null, 'Invalid format, email, or userName', 400);
    }

    // TODO: validation of password strength

    const existingUser = await Users.findOne({
      $or: [
        { 'credentials.email': userData.credentials.email },
        { 'credentials.userName': userData.credentials.userName },
      ],
    });

    if (existingUser !== null) {
      if (existingUser.credentials.email === userData.credentials.email) {
        return new Response('email', 'Email is already used', 400);
      }
      if (existingUser.credentials.userName === userData.credentials.userName) {
        return new Response('userName', 'Username is already used', 400);
      }
      return new Response(null, 'Malformed userData or user already exists', 400);
    }

    try {
      const user = await Users.create(userData);
      return new Response(user._id, '', 200);
    } catch (e) {
      return new Response(null, 'Malformed userData or user already exists', 400);
    }
  }

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

      return new Response(userInfo, '', 400);
    }

    return new Response(user._id, '', 200);
  }

  async editPassword(userId, password) {
    return this._updateCredentials(userId, 'password', password);
  }

  async editUserName(userId, userName) {
    return this._updateCredentials(userId, 'userName', userName);
  }

  async _updateCredentials(userId, credName, credValue) {
    if (!userId || !credName || !credValue) {
      return new Response(false, 'Invalid userId or userData', 400);
    }

    try {
      const user = await Users.findById(userId).orFail();
      user.credentials[credName] = credValue;
      await user.save();
      return new Response(true, '', 200);
    } catch (e) {
      return new Response(false, 'Invalid userData', 400);
    }
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
      }).orFail();
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
