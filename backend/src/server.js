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
    this.redisClient.on('connect', () => {
      this.logger.info('Redis connected.');
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
        const searcher = new JobSearcher(jobAnalyzer);

        await searcher.updateJobStore();

        // Start the server
        this.server = this.app.listen(PORT, async () => {
          if (IS_TEST_SERVER) {
            await generateFriends();
          }
          this.logger.info(`Server running on port ${PORT}`);
        });

        this.socket = socketio(this.server);
        this.socket.on('connection', (clientSocket) => {
          this.logger.info(`${clientSocket.id} connected.`);

          clientSocket.use((packet, next) => {
            // Log socket endpoints
            this.logger.info(`SOCKET ${packet[0]} ${packet.slice(1)}`);
            next();
          });
          clientSocket.on('disconnect', async () => {
            // Delete userId, socketId mappings
            const userId = await this.redisClient.getAsync(clientSocket.id);
            if (userId) {
              await this.redisClient.delAsync(userId);
            }
            await this.redisClient.delAsync(clientSocket.id);
            this.logger.info(`${clientSocket.id} disconnected.`);
          });
        });

        const user = new User(this.app, this.redisClient, this.socket, allSkills);
        new ResumeParser(this.app, user);
        new Friend(this.app, this.redisClient, this.socket, messenger);
        resolve();
      });
    });
  }

  shutdown() {
    return new Promise((resolve, reject) => {
      if (this.redisClient.quit()) {
        this.logger.info('Redis disconnected.');
      } else {
        this.logger.error('Redis failed to disconnect.');
      }
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
