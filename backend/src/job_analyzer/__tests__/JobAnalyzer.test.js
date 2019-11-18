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
  let shortLister;
  let jobAnalyzer;
  let testData;

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
    shortLister.getSeenJobIds = jest.fn(() => []);
    // Set json from constants file
    testData = JSON.parse(JSON.stringify(testDataOriginal));
    // Set the constant
    constants.JOBS_PER_SEND = 1;
    constants.JOBS_SEARCH_MAX_SIZE = 10;
    constants.JOBS_SEARCH_PERCENT_SIZE = 0.5;
    constants.DAILY_JOB_COUNT_LIMIT = 2;
    // Insert Users
    await Users.insertMany([
      {
        ...testData.users[0],
      },
      {
        ...testData.users[1],
      },
      {
        ...testData.users[2],
      },
    ]);
    // Insert Jobs
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
    // Delete jobs in database and replace them
    await Jobs.deleteMany({});

    testData.skills.forEach((_, i) => {
      const delKeywordCond = (skillsStart === undefined || skillsStart <= i)
        && (skillsEnd === undefined || skillsEnd > i);
      if (delKeywordCond) {
        testData.jobs.forEach((job) => {
          job.keywords[i].tfidf = -1;
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

  test('computeJobScores: job docCount is zero', async () => {
    // Delete jobs in database and replace them
    await Jobs.deleteMany({});
    await Jobs.create({
      title: 'PyMOL Engineer',
      url: 'http://www.indeed.com/viewjob?from=appsharedroid&jk=f529f96e15869d03',
      company: 'Schrödinger',
      location: 'New York, NY 10036',
      postDate: '13 days ago',
      salary: '',
      description: 'We’re looking to hire a PyMOL Software Engineer to join us in our mission to design drugs that improve human health and materials that increase quality of life!',
      keywords: [
        {
          name: 'jobsDoNotContainThis',
          count: 0,
        },
      ],
    });
    AllSkills.getAll = jest.fn(() => new Promise(resolve => resolve(['jobsDoNotContainThis'])));

    await jobAnalyzer.computeJobScores();
    const jobs = await Jobs.find({}, { _id: 0, 'keywords._id': 0 }).lean();
    expect(jobs[0].keywords[0].tfidf).toEqual(0);
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

  test('getRelevantJobs: User has no Keywords', async () => {
    const userIds = await Users.find({}, '_id').lean();
    const res = await jobAnalyzer.getRelevantJobs(userIds[0]._id.toString());
    expect(res.result.length).toEqual(1);
  });

  test('getRelevantJobs: User has all Keywords', async () => {
    const userIds = await Users.find({}, '_id').lean();
    const jobIds = await Jobs.find({}, '_id').lean();
    const res = await jobAnalyzer.getRelevantJobs(userIds[1]._id.toString());
    expect(res.result[0]._id).toEqual(jobIds[0]._id);
  });

  test('getRelevantJobs: User has some Keywords', async () => {
    const userIds = await Users.find({}, '_id').lean();
    const jobIds = await Jobs.find({}, '_id').lean();
    const res = await jobAnalyzer.getRelevantJobs(userIds[2]._id.toString());
    expect(res.result[0]._id).toEqual(jobIds[2]._id);
  });

  test('getRelevantJobs: User exceeded Max Job Count', async () => {
    const userIds = await Users.find({}, '_id').lean();
    await Users.findByIdAndUpdate(userIds[0]._id.toString(), {
      $set: {
        dailyJobCount: 2,
      },
    });
    const res = await jobAnalyzer.getRelevantJobs(userIds[0]._id.toString());
    expect(res.errorMessage).toEqual('Exceeded maximum number of daily jobs');
  });

  test('getRelevantJobs: Smaller Job Queue', async () => {
    constants.JOBS_PER_SEND = 2;
    constants.DAILY_JOB_COUNT_LIMIT = 4;

    const userIds = await Users.find({}, '_id').lean();
    await Users.findByIdAndUpdate(userIds[0]._id.toString(), {
      $set: {
        dailyJobCount: 3,
      },
    });
    const res = await jobAnalyzer.getRelevantJobs(userIds[0]._id.toString());
    expect(res.result.length).toEqual(1);
  });

  test('_getJobsForUserWithNoKeywords: Seen Some Jobs', async () => {
    const jobIds = await Jobs.find({}, '_id').lean();
    const seenJobIds = [jobIds[0]._id.toString(), jobIds[1]._id.toString()];

    const res = await jobAnalyzer._getJobsForUserWithNoKeywords(seenJobIds, 4);
    expect(res.result.length).toEqual(2);
  });

  test('_getJobsForUserWithNoKeywords: Seen None Jobs', async () => {
    const res = await jobAnalyzer._getJobsForUserWithNoKeywords([], 4);
    expect(res.result.length).toEqual(4);
  });

  test('_deleteJobKeywords: No Keywords', async () => {
    const jobs = await Jobs.find({}).lean();
    delete jobs[0].keywords;
    await jobAnalyzer._deleteJobKeywords([jobs[0]]);
    expect(jobs[0].keywords).toEqual(undefined);
  });

  test('_deleteJobKeywords: Many Keywords', async () => {
    const jobs = await Jobs.find({}).lean();
    await jobAnalyzer._deleteJobKeywords(jobs);
    expect(jobs[0].keywords).toEqual(undefined);
    expect(jobs[1].keywords).toEqual(undefined);
    expect(jobs[2].keywords).toEqual(undefined);
    expect(jobs[3].keywords).toEqual(undefined);
  });

  test('_getUnseenJobs: User is not over Limit', async () => {
    const jobs = await jobAnalyzer._getUnseenJobs([]);
    expect(jobs.length).toEqual(4);
  });

  test('_getUnseenJobs: User is over Limit', async () => {
    constants.JOBS_SEARCH_MAX_SIZE = 2;
    const jobs = await jobAnalyzer._getUnseenJobs([]);
    expect(jobs.length).toEqual(1);
  });

  test('_getMostRelevantJobs: Number of Jobs to Send is More Than Available Jobs', async () => {
    const userKeywords = testData.skills;
    const jobs = await Jobs.find({});
    const res = await jobAnalyzer._getMostRelevantJobs(userKeywords, jobs, 5);
    expect(res).toEqual(jobs);
  });

  test('_getMostRelevantJobs: Number of Jobs to Send is Less Than Available Jobs', async () => {
    const userKeywords = [
      {
        name: 'rust',
        score: 2,
        jobCount: 1,
        timeStamp: '2019-10-22T21:40:15.127Z',
      },
      {
        name: 'python',
        score: 3,
        jobCount: 1,
        timeStamp: '2019-10-22T21:40:15.127Z',
      },
      {
        name: 'java',
        score: 0,
        jobCount: 0,
        timeStamp: '2019-10-22T21:40:15.127Z',
      },
    ];
    const jobs = [
      {
        _id: 0,
        keywords: [
          {
            name: 'rust',
            tfidf: 0,
            count: 0,
          },
          {
            name: 'python',
            tfidf: 0,
            count: 0,
          },
          {
            name: 'java',
            tfidf: 0,
            count: 0,
          },
        ],
      },
      {
        _id: 1,
        keywords: [
          {
            name: 'rust',
            tfidf: 0.6931471805599453,
            count: 1,
          },
          {
            name: 'python',
            tfidf: 0,
            count: 0,
          },
          {
            name: 'java',
            tfidf: 0,
            count: 0,
          },
        ],
      },
      {
        _id: 2,
        keywords: [
          {
            name: 'rust',
            tfidf: 0,
            count: 0
          },
          {
            name: 'python',
            tfidf: 0,
            count: 0
          },
          {
            name: 'java',
            tfidf: 0,
            count: 0,
          },
        ],
      },
      {
        _id: 3,
        keywords: [
          {
            name: 'rust',
            tfidf: 0.46209812037329684,
            count: 2,
          },
          {
            name: 'python',
            tfidf: 0.46209812037329684,
            count: 1,
          },
          {
            name: 'java',
            tfidf: 0,
            count: 0,
          },
        ],
      },
      {
        _id: 4,
        keywords: [
          {
            name: 'rust',
            tfidf: 0,
            count: 0,
          },
          {
            name: 'python',
            tfidf: 0,
            count: 0,
          },
          {
            name: 'java',
            tfidf: 0,
            count: 0,
          },
        ],
      },
      {
        _id: 5,
        keywords: [
          {
            name: 'rust',
            tfidf: 0.00001,
            count: 1,
          },
          {
            name: 'python',
            tfidf: 0,
            count: 0,
          },
          {
            name: 'java',
            tfidf: 1.3862943611198906,
            count: 1,
          },
        ],
      },
      {
        _id: 6,
        keywords: [
          {
            name: 'rust',
            tfidf: 0,
            count: 0,
          },
          {
            name: 'python',
            tfidf: 0,
            count: 0,
          },
          {
            name: 'java',
            tfidf: 0,
            count: 0,
          },
        ],
      },
    ];

    const res = await jobAnalyzer._getMostRelevantJobs(userKeywords, jobs, 3);
    expect(res.length).toEqual(3);
    expect(res[0]._id).toEqual(3);
    expect(res[1]._id).toEqual(5);
    expect(res[2]._id).toEqual(1);
  });
});
