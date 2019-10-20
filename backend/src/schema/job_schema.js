import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: String,
  url: {
    type: String,
    index: {
      unique: true,
    }
  },
  postDate: String,
  salary: String,
});

const Jobs = mongoose.model('Jobs', jobSchema);

export default Jobs;