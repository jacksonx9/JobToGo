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
      }
    },
    password: {
      type: String,
    },
    token: {
      type: Object,
    }
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
  friends: { // IMPORTANT: Do not initalize this on create
    type: [
      {
        friendId: {
          type: mongoose.ObjectId,
          default: '',
          index: {
            unique: true,
            sparse: true
          }
        }
      }
    ],
    default: undefined
  },
  pendingFriends: { // IMPORTANT: Do not initalize this on create
    type: [
      {
        friendId: { // TODO: duplicates
          type: mongoose.ObjectId,
          default: '',
          index: {
            unique: true,
            sparse: true
          }
        }
      }
    ],
    default: undefined
  },
  likedJobs: [ String ],
  dislikedJobs: [ String ],
  resumePath: String
},
{ versionKey: false }
);

const Users = mongoose.model('Users', userSchema);

export default Users;