import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  credentials: {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  userInfo: {
    location: String,
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship'],
      default: 'unspecified',
    },
    skillsExperiences: [ String ],
  },
  keywords: [
    {
      score: Number,
      jobCount: Number,
      timeStamp: Date,
    }
  ],
  friends: [
    {
      friendId: mongoose.ObjectId,
    }
  ],
  jobShortList: [
    {
      jobId: mongoose.ObjectId,
    }
  ],
  resumePath: String
},
{ versionKey: false }
);

const Users = mongoose.model('Users', userSchema);

export default Users;