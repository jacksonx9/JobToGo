import express from 'express';
import { MongoClient } from 'mongodb';

const PORT = 8080;
const MONGO_URL = 'mongodb://171.0.0.3:27017';

const app = express();
const mongoClient = MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

mongoClient.connect(err => {
  if (err) {
    throw "Database connection failed!";
  }
  
  app.get('/', (req, res) => {
    res.send("Hello World!");
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
