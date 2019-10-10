import express from 'express';
import { MongoClient } from 'mongodb';
import JobSearcher from './job_search';
import ResumeParser from 'resume-parser';
import fs from 'fs';
import retext from 'retext';
import pos from 'retext-pos';
import keywords from 'retext-keywords';
import toString from 'nlcst-to-string';
import pdf from 'pdf-parse';

const PORT = 8080;
const MONGO_URL = 'mongodb://171.0.0.3:27017';

const app = express();
const mongoClient = MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

mongoClient.connect(async (e) => {
  if (e) {
    throw Error('Database connection failed!');
  }
  let dataBuffer = fs.readFileSync('Resume.pdf');

  pdf(dataBuffer).then(function(data) {
    const k = new Set();
    fs.writeFileSync('Resume-parsed.txt', data.text);

    retext()
      .use(pos) // Make sure to use `retext-pos` before `retext-keywords`.
      .use(keywords)
      .process(data.text, done);

    function done(err, file) {
      if (err) {
        console.log(err);
        throw err;
      }
      file.data.keywords.forEach(function(keyword) {
        k.add(toString(keyword.matches[0].node));
      });
    }
    console.log(k);
  });

  const jobSearcher = new JobSearcher();

  // const db = mongoClient.db('test');
  // await db.createCollection('test', {
  //   validator: {
  //     $jsonSchema: {
  //       bsonType: Object,
  //       properties: {
  //         message: {
  //           bsonType: String,
  //         },
  //         status: {
  //           enum: ['a', 'b']
  //         }
  //       }
  //     }
  //   }
  // }).catch(e => console.log(e));
  // const testCollection = db.collection('test');

  // await testCollection.insertMany([
  //   {
  //     message: 'lol',
  //     status: 'a',
  //   },
  //   {
  //     message: 'asdf df',
  //     status: 'b'
  //   }
  // ]).catch(e => console.log(e));

  // await testCollection.createIndex({ message: 'text' }).catch(e => console.log(e));
  // console.log(await testCollection.countDocuments({ status: 'a' }).catch(e => console.log(e)));
  // console.log(await testCollection.distinct('message').catch(e => console.log(e)));

  // const message = await testCollection.find({
  //   $text: {
  //     $search: 'df',
  //   }
  // }).project({ _id: 0 }).toArray();
  // console.log(message);

  app.get('/jobs/:query', async (req, res) => {
    res.json(await jobSearcher.getJobs(req.params.query));
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
