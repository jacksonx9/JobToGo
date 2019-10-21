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
  friends: {
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
  pendingFriends: {
    type: [ // IMPORTANT YOU added initalization in test. did it break anything?
      {
        friendId: { // TODO: remove nested structure? Do we need default: undefined??
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