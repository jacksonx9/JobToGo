import express from 'express';
import mongoose from 'mongoose';

import JobSearcher from './job_searcher';

const PORT = 8080;
const MONGO_URL = 'mongodb://171.0.0.3:27017/JobToGo';

const app = express();

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(e => console.log(e));

new JobSearcher();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
