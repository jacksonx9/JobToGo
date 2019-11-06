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
      index: {
        unique: true,
      },
    },
    password: {
      type: String,
    },
    idToken: Object,
    firebaseToken: String,
  },
  userInfo: {
    location: String,
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'unspecified'],
      default: 'unspecified',
    },
  },
  keywords: [
    {
      name: String,
      score: Number,
      jobCount: Number,
      timeStamp: Date,
    },
  ],
  friends: [String],
  pendingFriends: [String],
  likedJobs: [String],
  seenJobs: [String],
  dailyJobCount: {
    type: Number,
    default: 0,
  },
  resumePath: String,
},
{ versionKey: false });

const Users = mongoose.model('Users', userSchema);

export default Users;
