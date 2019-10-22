import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import JobSearcher from './job_searcher';
import User from './user';
import ResumeParser from './resume_parser';
import JobAnalyzer from './job_analyzer';
<<<<<<< HEAD
import JobShortLister from './job_shortlister';
import Messenger from './messenger';
=======
import JobSorter from './job_sorter';
>>>>>>> 5e7f9ca... tf_idf rough draft


const PORT = 8080;
const MONGO_URL = 'mongodb://171.0.0.3:27017/JobToGo';
export const JOBS_PER_SEND = 20;
export const MIN_JOBS_IN_DB = 50;

const app = express();
app.use(bodyParser.json())

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).catch(e => console.log(e));

const user = new User(app);
const jobSorter = new JobSorter(app, user);
const jobSearcher = new JobSearcher()
jobSearcher.updateJobStore().then(function() {
  console.log('starting to compute job scores');
  jobSorter.computeJobScores().then(function() {
    console.log('computed job scores');
  });
});
new ResumeParser(app, user);
const shortlister = new JobShortLister(app);
new JobAnalyzer(app, user, shortlister);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
