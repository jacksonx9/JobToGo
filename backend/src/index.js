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
import firebaseCredentials from '../credentials/firebase';


const PORT = 8080;
const MONGO_URL = 'mongodb://171.0.0.3:27017/JobToGo';
const FIREBASE_URL = 'https://jobtogo-103fd.firebaseio.com';

// Setup logger
Logger.useDefaults({
  formatter: (messages, context) => {
    messages.unshift(`${context.level.name} [${context.name}]`);
  },
});
const logger = Logger.get('Main');

// Instantiate express server and setup middleware
const app = express();
app.use(bodyParser.json());
app.use(morgan(':method :url :status - :response-time ms'));

// Connect to mongodb
// If this fails, just crash the server
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// Setup firebase
admin.initializeApp({
  credential: admin.credential.cert(firebaseCredentials),
  databaseURL: FIREBASE_URL,
});

// Setup modules
const shortlister = new JobShortLister(app);
const messenger = new Messenger(app, shortlister);
const user = new User(app);
const jobAnalyzer = new JobAnalyzer(app, shortlister);
new Friend(app, messenger);
new JobSearcher(jobAnalyzer);
new ResumeParser(app, user);

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
