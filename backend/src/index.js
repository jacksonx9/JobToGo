import express from 'express';
import { MongoClient } from 'mongodb';

const PORT = 8080;
const MONGO_URL = 'mongodb://171.0.0.3:27017';

const app = express();
const mongoClient = MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

mongoClient.connect(async err => {
  if (err) {
    throw "Database connection failed!";
  }

  const db = mongoClient.db("test");
  const collection = db.collection("test");
  const collectionData = await collection.find({}).toArray();

  // If collection is empty, insert Hello World message
  if (collectionData.length === 0) {
    await collection.insertOne({ message: "Hello World!" }).catch(err => console.log(err));
  }
  
  // On / access, return Hello World message from db
  app.get('/', async (req, res) => {
    const collectionData = await collection.find({}).toArray();
    res.send(collectionData[0].message);
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
