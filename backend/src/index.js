import express from 'express';
import { MongoClient } from 'mongodb';
import JobSearcher from './job_searcher';
import JobAnalyzer from './job_analyzer';


const PORT = 8080;
const MONGO_URL = 'mongodb://171.0.0.3:27017';

const app = express();
const mongoClient = MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

mongoClient.connect(async (e) => {
  if (e) {
    throw Error('Database connection failed!');
  }
   
  const db = mongoClient.db('jobs');
  await db.createCollection('jobs', {
    validator: {
      $jsonSchema: {
        bsonType: Object,
        properties: {
          title: {
            bsonType: String,
          },
          companyName: {
            bsonType: String,
          },
          location: {
            bsonType: String,
          },
          url: {
            bsonType: String,
          },
          postDate: {
            bsonType: String,
          },
          salary: {
            bsonType: String,
          },
          description: {
            bsonType: String,
          }
        }
      }
    }
  }).catch(e => console.log(e));

  const jobSearcher = new JobSearcher();
  const jobAnalyzer = new JobAnalyzer(db);

  // const jobsCollection = db.collection('jobs');
  // const jobArray = await jobSearcher.getJobs("javascript");
  // await jobsCollection.insertMany(jobArray).catch(e => console.log(e));



  //purely for testing query database; querying for javascript and C jobs
  app.get('/jobs/testGetDBJobs', async (req, res) => {
    res.json(await jobAnalyzer.getDBJobs(["javascript", "C"]));
  });

  app.get('/jobs/:query', async (req, res) => {
    res.json(await jobSearcher.getJobs(req.params.query));
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
