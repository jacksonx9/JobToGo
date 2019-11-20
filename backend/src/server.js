import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import Logger from 'js-logger';
import morgan from 'morgan';
import admin from 'firebase-admin';
import socketio from 'socket.io';
import redis from 'redis';
import bluebird from 'bluebird';

import User from './user';
import Friend from './friend';
import ResumeParser from './resume_parser';
import JobSearcher from './job_searcher';
import JobShortLister from './job_shortlister';
import JobAnalyzer from './job_analyzer';
import Messenger from './messenger';
import AllSkills from './all_skills';
import {
  IS_TEST_SERVER, DEBUG, LOG_LEVEL, PORT, MONGO_URL, FIREBASE_URL, REDIS_IP,
} from './constants';
import generateFriends from './nonfunc/FriendLimit';
import firebaseCredentials from '../credentials/firebase';

bluebird.promisifyAll(redis);

class Server {
  constructor() {
    // Setup logger
    Logger.useDefaults({
      formatter: (messages, context) => {
        messages.unshift(`${context.level.name} [${context.name}]`);
      },
      defaultLevel: LOG_LEVEL,
    });
    this.logger = Logger.get('Main');

    // Instantiate express server and setup middleware
    this.app = express();
    this.app.use(bodyParser.json());
    if (DEBUG) {
      this.app.use(morgan(':method :url :status - :response-time ms'));
    }
    this.server = null;
    this.socket = null;
    this.redisClient = null;

    // Setup firebase
    admin.initializeApp({
      credential: admin.credential.cert(firebaseCredentials),
      databaseURL: FIREBASE_URL,
    });
  }

  setupDB() {
    // Connect to mongodb
    mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }).then(() => this.logger.info('MongoDB connected.'));

    // Connect to redis
    this.redisClient = redis.createClient({
      host: REDIS_IP,
    });
    this.redisClient.on('error', () => {
      throw new Error('Failed to connect to redis');
    });
    this.redisClient.flushall();
  }

  start() {
    return new Promise((resolve) => {
      this.setupDB();

      // Setup modules
      AllSkills.setup().then(async () => {
        const shortlister = new JobShortLister(this.app);
        const messenger = new Messenger(this.app, shortlister);
        const jobAnalyzer = new JobAnalyzer(this.app, shortlister);
        const allSkills = new AllSkills(jobAnalyzer);
        const user = new User(this.app, allSkills);
        const searcher = new JobSearcher(jobAnalyzer);
        new ResumeParser(this.app, user);

        // await searcher.updateJobStore();

        // Start the server
        this.server = this.app.listen(PORT, async () => {
          if (IS_TEST_SERVER) {
            await generateFriends();
          }
          this.logger.info(`Server running on port ${PORT}`);
        });

        this.socket = socketio(this.server);
        this.socket.on('connection', (clientSocket) => {
          clientSocket.on('userId', async (userId) => {
            await this.redisClient.setAsync(userId, clientSocket.id);
            await this.redisClient.setAsync(clientSocket.id, userId);
          });
          clientSocket.on('disconnect', async () => {
            const userId = await this.redisClient.getAsync(clientSocket.id);
            await this.redisClient.del(userId);
            await this.redisClient.del(clientSocket.id);
          });

          new Friend(this.app, clientSocket, messenger);
        });
        resolve();
      });
    });
  }

  shutdown() {
    return new Promise((resolve, reject) => {
      mongoose.disconnect().then(() => {
        this.logger.info('MongoDB disconnected.');
        this.socket.close();
        this.server.close((err) => {
          if (err) {
            reject(err);
          } else {
            this.logger.info('Server shut down.');
            resolve();
          }
        });
      });
    });
  }
}

export default Server;
