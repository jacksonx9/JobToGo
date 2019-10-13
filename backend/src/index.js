import express from 'express';
import { MongoClient } from 'mongodb';

import JobSearcher from './job_searcher';
import JobAnalyzer from './job_analyzer';
import User from './user';


const PORT = 8080;
const MONGO_URL = 'mongodb://171.0.0.3:27017';

const app = express();
const mongoClient = MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

mongoClient.connect(async (e) => {
  if (e) {
    throw Error('Database connection failed!');
  }
   
  const jobsDB = mongoClient.db('jobs');
  const usersDB = mongoClient.db('user');

  await jobsDB.createCollection('jobs', {
    validator: {
      $jsonSchema: {
        bsonType: Object,
        properties: {
          title: {
            bsonType: String
          },
          companyName: {
            bsonType: String
          },
          location: {
            bsonType: String
          },
          url: {
            bsonType: String
          },
          postDate: {
            bsonType: String
          },
          salary: {
            bsonType: String
          },
          description: {
            bsonType: String
          }
        }
      }
    }
  }).catch(e => console.log(e));

  await usersDB.createCollection('user', {
    validator: {
      $jsonSchema: {
        bsonType: Object,
        properties: {
          credentials: {
            bsonType: Object,
            properties: {              
              userName: { bsonType: String },
              email: { bsonType: String },
              password: { bsonType: String }
            }            
          },
          userInfo: {
            bsonType: Object,
            properties: {              
              location: { bsonType: String },
              jobType: { enum: [ 'full-time', 'part-time', 'internship' ], default : 'unspecified' },
              skillsExperiences: { bsonType: Array }
            }            
          },
          keywords: {
            bsonType: Array,
            properties: {    
              keywordStatistic: {
                bsonType: Object,
                properties: {
                  score: { bsonType: 'int' },
                  jobCount: { bsonType: 'int' },
                  timeStamp: { bsonType: 'timestamp' }
                }
              }          
            }            
          },
          friends: {
            bsonType: Array,
            properties: {
              friendId: { bsonType: 'int' }
            }
          },
          jobShortList: {
            bsonType: Array,
            properties: {
              jobId: { bsonType: 'int' }
            }
          },
          resumePath: {
            bsonType: String,
          }
        }
      }
    }
  }).catch(e => console.log(e));

  const jobSearcher = new JobSearcher(jobsDB);
  const jobAnalyzer = new JobAnalyzer(jobsDB);
  const user = new User(usersDB);


  app.get('users/testCreateUser', async (req, res) => {
    await user.createUser({ 
      credentials: { 
        userName: "name", 
        email: "mail", 
        password: "word" 
      },
      userInfo: {             
        location: "Vancouver, BC",
        jobType: "full-time",
        skillsExperiences: [ "javascript", "C", "java" ]
      },            
      keywords: [{
        score: 1,
        jobCount: 2,
        timeStamp: Date.now()
      },
      {
        score: 0,
        jobCount: 21,
        timeStamp: Date.now()          
      }],
      keywordStatistic: {
          score: 10,
          jobCount: 30,
          timeStamp: Date.now()
      },
      friends: [1, 2, 3, 4, 5],
      jobShortList: [9, 8, 7],
      resumePath: "./resume.pdf"
    });

    res.json("Done");
  });

  //purely for testing adding to database
  app.get('/jobs/testAddJobs', async (req, res) => {
    await jobSearcher.updateJobs("javascript");
    await jobSearcher.updateJobs("C");

    res.json("Done");
  });

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
