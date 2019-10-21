import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import JobSearcher from './job_searcher';
import User from './user';
import ResumeParser from './resume_parser';


const PORT = 8080;
const MONGO_URL = 'mongodb://171.0.0.3:27017/JobToGo';

const app = express();
app.use(bodyParser.json())

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).catch(e => console.log(e));

new JobSearcher(app);
const user = new User(app);
new ResumeParser(app, user);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
