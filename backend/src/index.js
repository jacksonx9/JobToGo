import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import JobSearcher from './job_searcher';
import User from './user';


const PORT = 8080;
const MONGO_URL = 'mongodb://171.0.0.3:27017/JobToGo';

const app = express();
app.use(bodyParser.json())

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(e => console.log(e));

new JobSearcher(app);
new User(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
