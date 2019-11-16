import mongoose from 'mongoose';
import { Express } from 'jest-express/lib/express';

import JobAnaylzer from '..';
import testData from './test_data';
import JobShortLister from '../../job_shortlister';
import Response from '../../types';
import AllSkills from '../../all_skills';
import { Jobs, Users } from '../../schema';
import * as constants from '../../constants';

jest.mock('../../job_shortlister');

describe('JobAnalyzer', () => {
  let app;
  let user1Id;
  let user2Id;
  let invalidUserId;
  let job1Id;
  let job2Id;
  let invalidJobId;
  let allSkills;
  let shortLister;
  let jobAnaylzer;
  let JOBS_PER_SEND;
  let JOBS_SEARCH_MAX_SIZE;
  let JOBS_SEARCH_PERCENT_SIZE;
  let DAILY_JOB_COUNT_LIMIT;

  beforeAll(async () => {
    // Connect to the in-memory db
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    app = new Express();
    shortLister = new JobShortLister();
    jobAnaylzer = new JobAnaylzer(app, shortLister);

    // Save the value of the constant so we can reset it
    JOBS_PER_SEND = constants.JOBS_PER_SEND;
    JOBS_SEARCH_MAX_SIZE = constants.JOBS_SEARCH_MAX_SIZE;
    JOBS_SEARCH_PERCENT_SIZE = constants.JOBS_SEARCH_PERCENT_SIZE;
    DAILY_JOB_COUNT_LIMIT = constants.DAILY_JOB_COUNT_LIMIT;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    AllSkills.getAll = jest.fn(() => new Promise(resolve => resolve(testData.skills)));
    shortLister.getSeenJobIds = jest.fn(() => Array.from({length: testData.skills.length}, (_, k) => k+1) );
  });

  afterEach(async () => {
    // Delete all users after each test
    await Users.deleteMany({});
    // Make sure to clear all mock state (e.g. number of times called)
    jest.clearAllMocks();
    // Reset the constant
    JOBS_PER_SEND = constants.JOBS_PER_SEND;
    JOBS_SEARCH_MAX_SIZE = constants.JOBS_SEARCH_MAX_SIZE;
    JOBS_SEARCH_PERCENT_SIZE = constants.JOBS_SEARCH_PERCENT_SIZE;
    DAILY_JOB_COUNT_LIMIT = constants.DAILY_JOB_COUNT_LIMIT;
  });

  // Helper function that tests computeJobScores with different skillsStart
  // and skillsEnd values.
  const testComputeJobScoresJobKeywordsStaySame = async (skillsStart, skillsEnd) => {
    const jobsNoKeywords = [];
    const offset = skillsStart || 0;
    const jobsNeedDataRemoved = offset > 0 ? testData.jobs.slice(offset, skillsEnd) : testData.jobs;

    jobsNeedDataRemoved.forEach(job => {
      const jobNoKeywords = job;
      jobNoKeywords.keywords = [];
      jobsNoKeywords.push(jobNoKeywords);
    });

    await Jobs.insertMany([
      {
        ...jobsNoKeywords[0],
      },
      {
        ...jobsNoKeywords[1],
      },
      {
        ...jobsNoKeywords[2],
      },
      {
        ...jobsNoKeywords[3],
      },
    ]);

    await jobAnaylzer.computeJobScores(skillsStart, skillsEnd);
    const jobs = await Jobs.find({}).lean();
    expect(testData.jobs).toEqual(jobs);
  };

  test('No Keywords', async () => {
    const keywords = [];
    const job = testData.jobs[0];
    job.keywords = [];
    await jobAnaylzer.computeJobKeywordCount(job, keywords);
    expect(job.keywords.length).toEqual(0);
  });

  test('Valid Keywords', async () => {
    const job = testData.jobs[0];
    job.keywords = [];
    await jobAnaylzer.computeJobKeywordCount(job, testData.skills);
    expect(job.keywords[0].count).toEqual(2);
    expect(job.keywords[1].count).toEqual(1);
    expect(job.keywords[2].count).toEqual(0);
  });

  test('computeJobScores: undefined skillsEnd', async () => {
    await testComputeJobScoresJobKeywordsStaySame(0);
  });

  test('computeJobScores: undefined skillsStart and skillsEnd', async () => {
  });

  test('computeJobScores: no keywords', async () => {
  });

  test('computeJobScores: multiple keywords', async () => {
    // const jobs = await Jobs.insertMany(testData.jobs);
    // const jobIds = jobs.map(job => job._id.toString());
  });

  test('computeJobScores: ', async () => {
  });

  test('computeJobScores: ', async () => {
  });

  // test('addFriend: Invalid Users', async () => {
  //   await testInvalidUsers('addFriend');
  //   expect(messenger.requestFriend).toHaveBeenCalledTimes(0);
  // });

  // test('addFriend: Self', async () => {
  //   const response = new Response(false, 'Cannot add self as a friend', 400);
  //   const usersBefore = await Users.find({});

  //   expect(await friend.addFriend(user1Id, user1Id)).toEqual(response);
  //   expect(await friend.addFriend(user2Id, user2Id)).toEqual(response);
  //   expect(messenger.requestFriend).toHaveBeenCalledTimes(0);

  //   const usersAfter = await Users.find({});
  //   expect(usersBefore).toEqual(usersAfter);
  // });

  // test('addFriend: Success', async () => {
  //   const response = new Response(true, '', 200);
  //   expect(await friend.addFriend(user1Id, user2Id)).toEqual(response);
  //   expect(messenger.requestFriend).toHaveBeenCalledTimes(1);

  //   const user2 = await Users.findById(user2Id);
  //   const user1 = await Users.findById(user1Id);
  //   expect(user1.pendingFriends.length).toBe(0);
  //   expect(user2.pendingFriends.length).toBe(1);
  //   expect(JSON.stringify(user2.pendingFriends[0])).toEqual(JSON.stringify(user1Id));

  //   expect(user1.friends.length).toBe(0);
  //   expect(user2.friends.length).toBe(0);
  // });

  // test('addFriend: Already Pending', async () => {
  //   await Users.findByIdAndUpdate(user2Id, {
  //     $addToSet: {
  //       pendingFriends: user1Id,
  //     },
  //   });
  //   const response1 = new Response(false, 'Friend has already been added', 400);
  //   const response2 = new Response(false, 'Friend already a pending friend of user', 400);

  //   const usersBefore = await Users.find({});
  //   expect(await friend.addFriend(user1Id, user2Id)).toEqual(response1);
  //   expect(await friend.addFriend(user2Id, user1Id)).toEqual(response2);

  //   const usersAfter = await Users.find({});
  //   expect(usersBefore).toEqual(usersAfter);
  // });

  // test('removeFriend: Empty Ids', async () => {
  //   await testEmptyIds('removeFriend');
  // });

  // test('removeFriend: Invalid Users', async () => {
  //   await testInvalidUsers('removeFriend');
  // });

  // test('removeFriend: Not Friends', async () => {
  //   const response = new Response(false, 'Not a friend', 400);
  //   const usersBefore = await Users.find({});

  //   expect(await friend.removeFriend(user1Id, user1Id)).toEqual(response);
  //   expect(await friend.removeFriend(user2Id, user2Id)).toEqual(response);

  //   const usersAfter = await Users.find({});
  //   expect(usersBefore).toEqual(usersAfter);
  // });

  // test('removeFriend: Success', async () => {
  //   await Users.findByIdAndUpdate(user2Id, {
  //     $addToSet: {
  //       friends: user1Id,
  //     },
  //   });
  //   await Users.findByIdAndUpdate(user1Id, {
  //     $addToSet: {
  //       friends: user2Id,
  //     },
  //   });
  //   const response = new Response(true, '', 200);
  //   expect(await friend.removeFriend(user1Id, user2Id)).toEqual(response);

  //   const user1 = await Users.findById(user1Id);
  //   const user2 = await Users.findById(user2Id);
  //   expect(user1.friends.length).toBe(0);
  //   expect(user2.friends.length).toBe(0);
  // });

  // test('confirmFriend: Empty Ids', async () => {
  //   await testEmptyIds('confirmFriend');
  // });

  // test('confirmFriend: Invalid Users', async () => {
  //   await testInvalidUsers('confirmFriend');
  // });

  // test('confirmFriend: Not Pending Friend', async () => {
  //   const response = new Response(false, 'Not a pending friend', 400);
  //   const usersBefore = await Users.find({});

  //   expect(await friend.confirmFriend(user1Id, user1Id)).toEqual(response);
  //   expect(await friend.confirmFriend(user2Id, user2Id)).toEqual(response);

  //   const usersAfter = await Users.find({});
  //   expect(usersBefore).toEqual(usersAfter);
  // });

  // test('confirmFriend: Success', async () => {
  //   await Users.findByIdAndUpdate(user1Id, {
  //     $addToSet: {
  //       pendingFriends: user2Id,
  //     },
  //   });
  //   const response = new Response(true, '', 200);
  //   expect(await friend.confirmFriend(user1Id, user2Id)).toEqual(response);

  //   const user1 = await Users.findById(user1Id);
  //   const user2 = await Users.findById(user2Id);
  //   expect(user1.friends.length).toBe(1);
  //   expect(user2.friends.length).toBe(1);
  //   expect(user1.pendingFriends.length).toBe(0);
  //   expect(JSON.stringify(user1.friends[0])).toEqual(JSON.stringify(user2Id));
  //   expect(JSON.stringify(user2.friends[0])).toEqual(JSON.stringify(user1Id));
  // });

  // test('removePendingFriend: Empty Ids', async () => {
  //   await testEmptyIds('removePendingFriend');
  // });

  // test('removePendingFriend: Invalid Users', async () => {
  //   await testInvalidUsers('removePendingFriend');
  // });

  // test('removePendingFriend: Not Pending Friend', async () => {
  //   const response = new Response(false, 'Not a pending friend', 400);
  //   const usersBefore = await Users.find({});

  //   expect(await friend.removePendingFriend(user1Id, user1Id)).toEqual(response);
  //   expect(await friend.removePendingFriend(user2Id, user2Id)).toEqual(response);

  //   const usersAfter = await Users.find({});
  //   expect(usersBefore).toEqual(usersAfter);
  // });

  // test('removePendingFriend: Success', async () => {
  //   await Users.findByIdAndUpdate(user1Id, {
  //     $addToSet: {
  //       pendingFriends: user2Id,
  //     },
  //   });
  //   const response = new Response(true, '', 200);
  //   expect(await friend.removePendingFriend(user1Id, user2Id)).toEqual(response);

  //   const user1 = await Users.findById(user1Id);
  //   const user2 = await Users.findById(user2Id);
  //   expect(user1.pendingFriends.length).toBe(0);
  //   expect(user2.pendingFriends.length).toBe(0);
  // });

  // test('getFriends: Empty Id', async () => {
  //   await testEmptyId('getFriends');
  // });

  // test('getFriends: Invalid User', async () => {
  //   await testInvalidUser('getFriends');
  // });

  // test('getFriends: No Friends', async () => {
  //   const response = new Response([], '', 200);

  //   expect(await friend.getFriends(user1Id)).toEqual(response);
  // });

  // test('getFriends: Has Friends', async () => {
  //   await Users.findByIdAndUpdate(user2Id, {
  //     $addToSet: {
  //       friends: user1Id,
  //     },
  //   });
  //   await Users.findByIdAndUpdate(user1Id, {
  //     $addToSet: {
  //       friends: user2Id,
  //     },
  //   });

  //   const response1 = new Response([{
  //     _id: user2Id,
  //     userName: 'user2',
  //   }], '', 200);
  //   const response2 = new Response([{
  //     _id: user1Id,
  //     userName: 'user1',
  //   }], '', 200);

  //   expect(await friend.getFriends(user1Id)).toEqual(response1);
  //   expect(await friend.getFriends(user2Id)).toEqual(response2);
  // });

  // test('getPendingFriends: Empty Id', async () => {
  //   await testEmptyId('getPendingFriends');
  // });

  // test('getPendingFriends: Invalid User', async () => {
  //   await testInvalidUser('getPendingFriends');
  // });

  // test('getPendingFriends: No Pending Friends', async () => {
  //   const response = new Response([], '', 200);

  //   expect(await friend.getPendingFriends(user1Id)).toEqual(response);
  // });

  // test('getPendingFriends: Has Pending Friends', async () => {
  //   await Users.findByIdAndUpdate(user1Id, {
  //     $addToSet: {
  //       pendingFriends: user2Id,
  //     },
  //   });

  //   const response = new Response([{
  //     _id: user2Id,
  //     userName: 'user2',
  //   }], '', 200);

  //   expect(await friend.getPendingFriends(user1Id)).toEqual(response);
  // });
});
