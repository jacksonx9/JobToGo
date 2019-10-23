import mongoose from 'mongoose';

const arrayUniquePlugin = require('mongoose-unique-array');


const userSchema = new mongoose.Schema({
  credentials: {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: {
        unique: true,
      }
    },
    password: {
      type: String,
    },
    idToken: Object,
    firebaseToken: String
  },
  userInfo: {
    location: String,
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'unspecified'],
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
  friends: [ String ],
  pendingFriends: [ String ],
  likedJobs: [ String ],
  dislikedJobs: [ String ],
  resumePath: String
},
{ versionKey: false }
);

userSchema.plugin(arrayUniquePlugin);
const Users = mongoose.model('Users', userSchema);

export default Users;