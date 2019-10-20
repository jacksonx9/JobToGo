import express from 'express';
import mongoose from 'mongoose';

import JobSearcher from './job_searcher';
import User from './user';
import { TestAPIs } from '../tests';


const PORT = 8080;
const MONGO_URL = 'mongodb://171.0.0.3:27017/JobToGo';

const app = express();

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(e => console.log(e));

new JobSearcher(app);
new User(app);
new TestAPIs(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
