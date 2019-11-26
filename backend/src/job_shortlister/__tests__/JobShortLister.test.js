import mongoose from 'mongoose';
import { Express } from 'jest-express/lib/express';
import scheduler from 'node-schedule';

import JobShortLister from '..';
import Response from '../../types';
import { Users, Jobs } from '../../schema';
import testData from './test_data';

jest.mock('../../messenger');
jest.mock('node-schedule');

describe('JobShortLister', () => {
  let jobShortLister;
  let app;
  let userId;
  let invalidUserId;
  let jobId;
  let invalidJobId;

  beforeAll(async () => {
    // Connect to the in-memory db
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    scheduler.scheduleJob = jest.fn((rule, callback) => {
      callback();
    });

    app = new Express();
    jobShortLister = new JobShortLister(app);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // We create all users, jobs before each test case instead of test suite so that
    // the tests can be run in any order
    const user = await Users.create({
      credentials: {
        ...testData.users[0].credentials,
      },
    });
    const invalidUser = await Users.create({
      credentials: {
        ...testData.users[1].credentials,
      },
    });
    const jobs = await Jobs.insertMany(testData.jobs);
    userId = user._id;
    invalidUserId = invalidUser._id;
    jobId = jobs[0]._id;
    invalidJobId = jobs[jobs.length - 1]._id;
    // Delete the user, job to invalidate the id
    await Users.findByIdAndDelete(invalidUserId);
    await Jobs.findByIdAndDelete(invalidJobId);

    // Add keywords to users and jobs
    await Users.findByIdAndUpdate(userId, {
      $push: {
        keywords: testData.users[0].keywordData,
      },
    });
    await Jobs.findByIdAndUpdate(jobId, {
      $push: {
        keywords: testData.jobKeywordData,
      },
    });
  });

  afterEach(async () => {
    // Delete all users, jobs after each test
    await Users.deleteMany({});
    await Jobs.deleteMany({});
    // Make sure to clear all mock state (e.g. number of times called)
    jest.clearAllMocks();
  });

  // Helper function that tests functions with a user id as the input
  // Tests that an empty id will be rejected
  const testEmptyId = async (func, result) => {
    const response = new Response(result, 'Invalid userId', 400);
    const usersBefore = await Users.find({}).lean();

    expect(await jobShortLister[func](undefined)).toEqual(response);

    const usersAfter = await Users.find({}).lean();
    expect(usersBefore).toEqual(usersAfter);
  };

  // Helper function that tests functions with user id and job id as the input
  // Tests that one or more empty ids will be rejected
  const testEmptyIds = async (func) => {
    const response = new Response(false, 'Invalid userId or jobId', 400);
    const usersBefore = await Users.find({}).lean();

    expect(await jobShortLister[func](undefined, undefined, false)).toEqual(response);
    expect(await jobShortLister[func](userId, undefined, false)).toEqual(response);
    expect(await jobShortLister[func](undefined, jobId, false)).toEqual(response);
    expect(await jobShortLister[func](undefined, undefined, true)).toEqual(response);
    expect(await jobShortLister[func](userId, undefined, true)).toEqual(response);
    expect(await jobShortLister[func](undefined, jobId, true)).toEqual(response);

    const usersAfter = await Users.find({}).lean();
    expect(usersBefore).toEqual(usersAfter);
  };

  // Helper function that tests functions with a user id as the input
  // Tests that an invalid id will be rejected
  const testInvalidUserJob = async (func, result) => {
    const response = new Response(result, 'Invalid userId', 400);
    const usersBefore = await Users.find({}).lean();

    expect(await jobShortLister[func](invalidUserId)).toEqual(response);
    expect(await jobShortLister[func](123)).toEqual(response);
    expect(await jobShortLister[func]('test')).toEqual(response);
    expect(await jobShortLister[func]({})).toEqual(response);

    const usersAfter = await Users.find({}).lean();
    expect(usersBefore).toEqual(usersAfter);
  };

  // Helper function that tests functions with user id and job id as the input
  // Tests that one or more invalid ids will be rejected
  const testInvalidUserJobs = async (func) => {
    const response = new Response(false, 'Invalid userId or jobId', 400);
    const usersBefore = await Users.find({}).lean();

    expect(await jobShortLister[func](userId, invalidJobId, false)).toEqual(response);
    expect(await jobShortLister[func](invalidUserId, jobId, false)).toEqual(response);
    expect(await jobShortLister[func](123, jobId, false)).toEqual(response);
    expect(await jobShortLister[func]('test', jobId, false)).toEqual(response);
    expect(await jobShortLister[func]({}, jobId, false)).toEqual(response);
    expect(await jobShortLister[func](userId, 123, false)).toEqual(response);
    expect(await jobShortLister[func](userId, 'test', false)).toEqual(response);
    expect(await jobShortLister[func](userId, {}, false)).toEqual(response);

    const usersAfter = await Users.find({}).lean();
    expect(usersBefore).toEqual(usersAfter);
  };

  test('setupDailyUpdateJobStore', async () => {
    expect(scheduler.scheduleJob).toBeCalledTimes(1);
    expect(scheduler.scheduleJob.mock.calls[0][0]).toBe('0 0 0 * * *');
  });

  test('getSeenJobIds: Empty Id', () => {
    expect(jobShortLister.getSeenJobIds(undefined)).rejects.toThrow(mongoose.Error);
  });

  test('getSeenJobIds: Invalid Id', () => {
    expect(jobShortLister.getSeenJobIds(invalidUserId)).rejects.toThrow(mongoose.Error);
  });

  test('getSeenJobIds: Success', async () => {
    const jobs = await Jobs.find({});
    const jobIds = jobs.map(job => job._id.toString());
    await Users.findByIdAndUpdate(userId, { seenJobs: jobIds });

    expect(await jobShortLister.getSeenJobIds(userId)).toEqual(jobIds);
  });

  test('unseenJob: Empty Ids', async () => {
    await testEmptyIds('unseenJob');
  });

  test('unseenJob: Invalid Ids', async () => {
    await testInvalidUserJobs('unseenJob');
  });

  test('unseenJob: Job that has not been seen', async () => {
    const expectRes = new Response(false, 'Not a seen job', 400);
    const actualRes = await jobShortLister.unseenJob(userId, jobId);
    expect(actualRes).toEqual(expectRes);
  });

  test('unseenJob: Liked Job', async () => {
    await Users.findByIdAndUpdate(userId, {
      $addToSet: {
        likedJobs: jobId,
        seenJobs: jobId,
      },
    });
    const expectRes = new Response(true, '', 200);
    const actualRes = await jobShortLister.unseenJob(userId, jobId);
    expect(actualRes).toEqual(expectRes);
  });

  test('unseenJob: Disliked Job', async () => {
    await Users.findByIdAndUpdate(userId, {
      $addToSet: {
        seenJobs: jobId,
      },
    });
    const expectRes = new Response(true, '', 200);
    const actualRes = await jobShortLister.unseenJob(userId, jobId);
    expect(actualRes).toEqual(expectRes);
  });

  test('addLikedJobs: Empty Ids', async () => {
    await testEmptyIds('addLikedJobs');
  });

  test('addLikedJobs: Invalid Ids', async () => {
    await testInvalidUserJobs('addLikedJobs');
  });

  test('addLikedJobs: Already selected job', async () => {
    await Users.findByIdAndUpdate(userId, {
      $addToSet: {
        seenJobs: jobId,
      },
    });
    const response = new Response(false, 'Job already selected once', 400);
    const usersBefore = await Users.find({}).lean();
    expect(await jobShortLister.addLikedJobs(userId, jobId)).toEqual(response);

    const usersAfter = await Users.find({}).lean();
    expect(usersBefore).toEqual(usersAfter);
  });

  test('addLikedJobs: Success', async () => {
    const response = new Response(true, '', 200);
    expect(await jobShortLister.addLikedJobs(userId, jobId)).toEqual(response);

    const user = await Users.findById(userId);
    expect(user.dailyJobCount).toBe(1);
    // Score should have increased by job keyword count
    expect(user.keywords[0].score).toBe(testData.jobKeywordData[0].count);
    expect(user.keywords[0].jobCount).toBe(1);
  });

  test('addDislikedJobs: Empty Ids', async () => {
    await testEmptyIds('addDislikedJobs');
  });

  test('addDislikedJobs: Invalid Ids', async () => {
    await testInvalidUserJobs('addDislikedJobs');
  });

  test('addDislikedJobs: Already selected job', async () => {
    await Users.findByIdAndUpdate(userId, {
      $addToSet: {
        seenJobs: jobId,
      },
    });
    const response = new Response(false, 'Job already selected once', 400);
    const usersBefore = await Users.find({}).lean();
    expect(await jobShortLister.addDislikedJobs(userId, jobId)).toEqual(response);

    const usersAfter = await Users.find({}).lean();
    expect(usersBefore).toEqual(usersAfter);
  });

  test('addDislikedJobs: Success', async () => {
    const response = new Response(true, '', 200);
    expect(await jobShortLister.addDislikedJobs(userId, jobId)).toEqual(response);

    const user = await Users.findById(userId);
    expect(user.dailyJobCount).toBe(1);
    // Score should have decreased by job keyword count
    expect(user.keywords[0].score).toBe(-testData.jobKeywordData[0].count);
    expect(user.keywords[0].jobCount).toBe(1);
  });

  test('removeJob: Empty Ids', async () => {
    await testEmptyIds('removeJob');
  });

  test('removeJob: Invalid Ids', async () => {
    await testInvalidUserJobs('removeJob');
  });

  test('removeJob: Not a liked job', async () => {
    const response = new Response(false, 'Not a seen job', 400);
    const usersBefore = await Users.find({}).lean();
    expect(await jobShortLister.removeJob(userId, jobId, false)).toEqual(response);

    const usersAfter = await Users.find({}).lean();
    expect(usersBefore).toEqual(usersAfter);
  });

  test('removeJob: Success', async () => {
    await Users.findByIdAndUpdate(userId, {
      $addToSet: {
        likedJobs: jobId,
        seenJobs: jobId,
      },
    });
    const response = new Response(true, '', 200);
    expect(await jobShortLister.removeJob(userId, jobId, true)).toEqual(response);

    const user = await Users.findById(userId);
    expect(user.likedJobs.length).toBe(0);
  });

  test('getLikedJobs: Empty Id', async () => {
    await testEmptyId('getLikedJobs', null);
  });

  test('getLikedJobs: Invalid Id', async () => {
    await testInvalidUserJob('getLikedJobs', null);
  });

  test('getLikedJobs: No jobs', async () => {
    const response = new Response([], '', 200);
    expect(await jobShortLister.getLikedJobs(userId)).toEqual(response);
  });

  test('getLikedJobs: Non existing jobs', async () => {
    const jobs = await Jobs.find({}).lean();
    const jobIds = jobs.map(job => job._id.toString());
    await Users.findByIdAndUpdate(userId, {
      $addToSet: {
        likedJobs: jobIds,
      },
    });
    await Jobs.deleteMany({});
    const response = new Response([], '', 200);
    expect(await jobShortLister.getLikedJobs(userId)).toEqual(response);
  });

  test('getLikedJobs: Success', async () => {
    const jobs = await Jobs.find({}).lean();
    // Job data should not have keywords
    jobs.forEach((_, jobIdx) => delete jobs[jobIdx].keywords);
    const jobIds = jobs.map(job => job._id.toString());
    await Users.findByIdAndUpdate(userId, {
      $addToSet: {
        likedJobs: jobIds,
      },
    });
    const response = new Response(jobs, '', 200);
    expect(await jobShortLister.getLikedJobs(userId)).toEqual(response);
  });

  test('clearLikedJobs: Empty Id', async () => {
    await testEmptyId('clearLikedJobs', false);
  });

  test('clearLikedJobs: Invalid Id', async () => {
    await testInvalidUserJob('clearLikedJobs', false);
  });

  test('clearLikedJobs: Success', async () => {
    const jobs = await Jobs.find({});
    const jobIds = jobs.map(job => job._id.toString());
    await Users.findByIdAndUpdate(userId, {
      $addToSet: {
        likedJobs: jobIds,
      },
    });
    const response = new Response(true, '', 200);
    expect(await jobShortLister.clearLikedJobs(userId)).toEqual(response);

    const user = await Users.findById(userId);
    expect(user.likedJobs.length).toBe(0);
  });
});
