import mongoose from 'mongoose';
import { Express } from 'jest-express/lib/express';

import JobAnalyzer from '..';
import * as testDataOriginal from './test_data';
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
  let jobAnalyzer;
  let testData;
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
    jobAnalyzer = new JobAnalyzer(app, shortLister);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    AllSkills.getAll = jest.fn(() => new Promise(resolve => resolve(testData.skills)));
    shortLister.getSeenJobIds = jest.fn(() => Array.from({length: testData.skills.length}, (_, k) => k+1));
    // Set json from constants file
    testData = JSON.parse(JSON.stringify(testDataOriginal));
    // Set the constant
    JOBS_PER_SEND = constants.JOBS_PER_SEND;
    JOBS_SEARCH_MAX_SIZE = constants.JOBS_SEARCH_MAX_SIZE;
    JOBS_SEARCH_PERCENT_SIZE = constants.JOBS_SEARCH_PERCENT_SIZE;
    DAILY_JOB_COUNT_LIMIT = constants.DAILY_JOB_COUNT_LIMIT;
    // Insert Users
    await Users.insertMany([
      {
        ...testData.users[0]
      },
      {
        ...testData.users[1]
      },
      {
        ...testData.users[2]
      }
    ])
  });

  afterEach(async () => {
    // Delete all users after each test
    await Users.deleteMany({});
    await Jobs.deleteMany({});
    // Make sure to clear all mock state (e.g. number of times called)
    jest.clearAllMocks();
  });

  // Helper function that tests computeJobScores with different skillsStart
  // and skillsEnd values.
  const testComputeJobScoresJobKeywordsStaySame = async (skillsStart, skillsEnd) => {
    testData.skills.forEach((_, i) => {
      const delKeywordCond = (skillsStart === undefined || skillsStart <= i) && (skillsEnd === undefined || skillsEnd > i);
      if (delKeywordCond) {
        testData.jobs.forEach(job => {
          delete job.keywords[i].tfidf;
        });
      }
    });

    await Jobs.insertMany([
      {
        ...testData.jobs[0],
      },
      {
        ...testData.jobs[1],
      },
      {
        ...testData.jobs[2],
      },
      {
        ...testData.jobs[3],
      },
    ]);

    await jobAnalyzer.computeJobScores(skillsStart, skillsEnd);
    const jobs = await Jobs.find({}, { _id: 0, 'keywords._id': 0 }).lean();
    expect(testDataOriginal.jobs[0].keywords).toEqual(jobs[0].keywords);
    expect(testDataOriginal.jobs[1].keywords).toEqual(jobs[1].keywords);
    expect(testDataOriginal.jobs[2].keywords).toEqual(jobs[2].keywords);
    expect(testDataOriginal.jobs[3].keywords).toEqual(jobs[3].keywords);
  };

  // Helper function that tests functions with a single user id as the input
  // Tests that an empty id will be rejected
  const testEmptyId = async (func) => {
    const response = new Response(null, 'Invalid userId', 400);
    const usersBefore = await Users.find({});

    expect(await jobAnalyzer[func](undefined)).toEqual(response);

    const usersAfter = await Users.find({});
    expect(JSON.stringify(usersBefore)).toEqual(JSON.stringify(usersAfter));
  };

  // Helper function that tests functions with a single user id as the input
  // Tests that an invalid id will be rejected
  const testInvalidUser = async (func) => {
    const response = new Response(null, 'Invalid userId', 400);
    const usersBefore = await Users.find({});

    expect(await jobAnalyzer[func](123)).toEqual(response);
    expect(await jobAnalyzer[func]('test')).toEqual(response);
    expect(await jobAnalyzer[func]({})).toEqual(response);

    const usersAfter = await Users.find({});
    expect(JSON.stringify(usersBefore)).toEqual(JSON.stringify(usersAfter));
  };

  test('No Keywords', async () => {
    const keywords = [];
    const job = testData.jobs[0];
    job.keywords = [];
    await jobAnalyzer.computeJobKeywordCount(job, keywords);
    expect(job.keywords.length).toEqual(0);
  });

  test('Valid Keywords', async () => {
    const job = testData.jobs[0];
    job.keywords = [];
    await jobAnalyzer.computeJobKeywordCount(job, testData.skills);
    expect(job.keywords[0].count).toEqual(2);
    expect(job.keywords[1].count).toEqual(1);
    expect(job.keywords[2].count).toEqual(0);
  });

  test('computeJobScores: Undefined SkillsEnd', async () => {
    await testComputeJobScoresJobKeywordsStaySame(1);
  });

  test('computeJobScores: Undefined SkillsStart and SkillsEnd', async () => {
    await testComputeJobScoresJobKeywordsStaySame();
  });

  test('computeJobScores: Specify Some Keywords', async () => {
    await testComputeJobScoresJobKeywordsStaySame(1, 2);
  });

  test('computeJobScores: Specify All Keywords', async () => {
    await testComputeJobScoresJobKeywordsStaySame(0, 4);
  });

  test('getRelevantJobs: Empty Id', async () => {
    await testEmptyId('getRelevantJobs');
  });

  test('getRelevantJobs: Invalid Users', async () => {
    await testInvalidUser('getRelevantJobs');
  });

  // TODO: make users with no, some, all keywords
  // TODO: relabel global constants
  test('getRelevantJobs: User has no Keywords', async () => {
    const userIds = await Users.find({}, '_id').lean();
    console.log(typeof userIds[0]._id);
    await jobAnalyzer.getRelevantJobs(userIds[0]._id);
    expect(jobAnalyzer._getJobsForUserWithNoKeywords).toHaveBeenCalledTimes(1);
  });

  test('getRelevantJobs: User has all Keywords', async () => {
  });

  test('getRelevantJobs: User exceeded Max Job Count', async () => {
  });

  test('getRelevantJobs: User has some Keywords', async () => {
  });

});
