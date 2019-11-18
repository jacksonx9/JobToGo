import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import Logger from 'js-logger';
import morgan from 'morgan';
import admin from 'firebase-admin';

import User from './user';
import Friend from './friend';
import ResumeParser from './resume_parser';
import JobSearcher from './job_searcher';
import JobShortLister from './job_shortlister';
import JobAnalyzer from './job_analyzer';
import Messenger from './messenger';
import AllSkills from './all_skills';
import {
  DEBUG, LOG_LEVEL, PORT, MONGO_URL, FIREBASE_URL,
} from './constants';
import firebaseCredentials from '../credentials/firebase';

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

    // Setup firebase
    admin.initializeApp({
      credential: admin.credential.cert(firebaseCredentials),
      databaseURL: FIREBASE_URL,
    });
  }

  start() {
    return new Promise((resolve) => {
      // Connect to mongodb
      // If this fails, just crash the server
      mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }).then(() => this.logger.info('MongoDB connected.'));

      // Setup modules
      AllSkills.setup().then(async () => {
        const shortlister = new JobShortLister(this.app);
        const messenger = new Messenger(this.app, shortlister);
        const jobAnalyzer = new JobAnalyzer(this.app, shortlister);
        const allSkills = new AllSkills(jobAnalyzer);
        const user = new User(this.app, allSkills);
        const searcher = new JobSearcher(jobAnalyzer);
        new Friend(this.app, messenger);
        new ResumeParser(this.app, user);

        await searcher.updateJobStore();

        // Start the server
        this.server = this.app.listen(PORT, () => {
          this.logger.info(`Server running on port ${PORT}`);
          resolve();
        });
      });
    });
  }

  shutdown() {
    return new Promise((resolve, reject) => {
      mongoose.disconnect().then(() => {
        this.logger.info('MongoDB disconnected.');
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
