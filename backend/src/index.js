import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import Logger from 'js-logger';

import JobSearcher from './job_searcher';
import User from './user';
import ResumeParser from './resume_parser';
import JobShortLister from './job_shortlister';
import Messenger from './messenger';
import JobAnalyzer from './job_analyzer';


const PORT = 8080;
const MONGO_URL = 'mongodb://171.0.0.3:27017/JobToGo';
export const JOBS_PER_SEND = 20;
export const MIN_JOBS_IN_DB = 200;

Logger.useDefaults();
const logger = Logger.get('Main');

const app = express();
app.use(bodyParser.json())

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).catch(e => logger.error(e));

const shortlister = new JobShortLister(app);
const messenger = new Messenger(app, shortlister);
const user = new User(app, messenger);
const jobAnalyzer = new JobAnalyzer(app, user, shortlister);
new JobSearcher(jobAnalyzer);
new ResumeParser(app, user);


app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
