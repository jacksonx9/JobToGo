import mongoose from 'mongoose';
import scheduler from 'node-schedule';
import indeed from 'indeed-scraper';
import axios from 'axios';
import cheerio from 'cheerio';

import JobSearcher from '..';
import JobAnalyzer from '../../job_analyzer';
import AllSkills from '../../all_skills';
import { Jobs, Users } from '../../schema';
import * as constants from '../../constants';
import jobConfig from '../config';
import testData from './test_data';

jest.mock('../../job_analyzer');
jest.mock('../../all_skills');
jest.mock('node-schedule');
jest.mock('indeed-scraper');
jest.mock('axios');
jest.mock('cheerio');

// Custom HTTP error for mocking axios
class HTTPError extends Error {
  constructor(status) {
    super('');
    this.response = {
      status,
      statusText: '',
    };
  }
}

describe('Job Searcher', () => {
  let jobSearcher;
  let jobAnalyzer;
  let MIN_JOBS_IN_DB_COPY;

  // Helper function to mock all external API calls
  const mockAPIs = () => {
    indeed.query = jest.fn(() => new Promise(resolve => resolve(testData.jobs)));
    axios.get = jest.fn(url => new Promise((resolve, reject) => {
      const jobIdx = testData.jobs.findIndex(job => job.url === url);
      // Arbitrarily choose the first job to fail
      if (jobIdx === 0) {
        reject(new HTTPError(404));
      } else {
        resolve({ data: testData.jobs[jobIdx] });
      }
    }));
    cheerio.load = jest.fn(job => (selector) => {
      // Mock cheerio for job searching
      if (selector === jobConfig.indeedJobDescTag) {
        return { text: () => job.description };
      }
      if (selector === jobConfig.indeedJobUrlTag) {
        return { attr: () => job.url };
      }
      // Mock cheerio for job removing
      if (job.url === testData.jobs[1].url && selector === jobConfig.indeedExpiredTags[0]) {
        return { length: 1 };
      }
      if (job.url === testData.jobs[2].url && selector === jobConfig.indeedExpiredTags[1]) {
        return { length: 2 };
      }
      return { length: 0 };
    });
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    scheduler.scheduleJob = jest.fn((rule, callback) => {
      callback();
    });

    jobAnalyzer = new JobAnalyzer();
    jobSearcher = new JobSearcher(jobAnalyzer);

    // Save the value of the constant so we can reset it
    MIN_JOBS_IN_DB_COPY = constants.MIN_JOBS_IN_DB;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    jobAnalyzer.computeJobScores = jest.fn();
    jobAnalyzer.computeJobKeywordCount = jest.fn();
    AllSkills.getAll = jest.fn(() => new Promise(resolve => resolve(testData.skills)));
    mockAPIs();
  });

  afterEach(async () => {
    await Jobs.deleteMany({});
    await Users.deleteMany({});
    // Restore all mocks back to original functions
    jest.restoreAllMocks();
    // Reset the constant
    constants.MIN_JOBS_IN_DB = MIN_JOBS_IN_DB_COPY;
  });

  test('setupDailyUpdateJobStore', async () => {
    expect(scheduler.scheduleJob).toBeCalledTimes(1);
    expect(scheduler.scheduleJob.mock.calls[0][0]).toBe('0 0 0 * * *');
  });

  test('updateJobStore: No Jobs', async () => {
    // First job fails, so we start at the second
    const expectedJobs = testData.jobs.slice(1);
    await jobSearcher.updateJobStore();
    expect(await Jobs.find({}).lean()).toMatchObject(expectedJobs);
  });

  test('updateJobStore: Enough Jobs', async () => {
    // Temporarily set constant to 0
    constants.MIN_JOBS_IN_DB = 0;
    await jobSearcher.updateJobStore();
    expect(await Jobs.find({}).lean()).toMatchObject([]);
  });

  test('updateJobStore: Remove and add jobs', async () => {
    /*
     * We start with jobs 0, 1, 2, 3
     * removeOutdatedJobs will remove jobs 0, 1, 2
     * searchAndUpdateJobs will add jobs 1, 2, 3
     * We end up with jobs 3, 1, 2
     */
    const expectedJobs = [testData.jobs[3], testData.jobs[1], testData.jobs[2]];
    await Jobs.insertMany(testData.jobs);
    await jobSearcher.updateJobStore();
    expect(await Jobs.find({}).lean()).toMatchObject(expectedJobs);
  });

  test('addToJobStore: None', async () => {
    await jobSearcher.addToJobStore([]);
    expect(await Jobs.find({}).lean()).toMatchObject([]);
  });

  test('addToJobStore: Single', async () => {
    await jobSearcher.addToJobStore([testData.jobs[0]]);
    expect(await Jobs.find({}).lean()).toMatchObject([testData.jobs[0]]);
  });

  test('addToJobStore: Multiple', async () => {
    await jobSearcher.addToJobStore(testData.jobs);
    expect(await Jobs.find({}).lean()).toMatchObject(testData.jobs);
  });

  test('addToJobStore: Duplicates', async () => {
    await jobSearcher.addToJobStore([...testData.jobs, ...testData.jobs]);
    expect(await Jobs.find({}).lean()).toMatchObject(testData.jobs);
  });

  test('addToJobStore: Invalid', async () => {
    await jobSearcher.addToJobStore(testData.invalidJobs);
    expect(await Jobs.find({}).lean()).toMatchObject([]);
  });

  test('searchAndUpdateJobs: Success', async () => {
    const expectedJobs = testData.jobs.slice(1);
    await jobSearcher.searchAndUpdateJobs(jobConfig.keywords);

    expect(await Jobs.find({}).lean()).toMatchObject(expectedJobs);

    // computeJobKeywordCount is called per job, per keyphrase
    expect(jobAnalyzer.computeJobKeywordCount)
      .toBeCalledTimes(expectedJobs.length * jobConfig.keywords.length);

    expectedJobs.forEach((job) => {
      expect(jobAnalyzer.computeJobKeywordCount).toHaveBeenCalledWith(job, testData.skills);
    });
  });

  test('searchAndUpdateJobs: Existing Jobs', async () => {
    await Jobs.insertMany(testData.jobs);
    await jobSearcher.searchAndUpdateJobs(jobConfig.keywords);
    expect(jobAnalyzer.computeJobKeywordCount).toBeCalledTimes(0);
  });

  test('removeOutdatedJobs: Success', async () => {
    const jobs = await Jobs.insertMany(testData.jobs);
    const jobIds = jobs.map(job => job._id.toString());
    await Users.insertMany([
      {
        ...testData.users[0],
        likedJobs: [jobIds[0], jobIds[1]],
        seenJobs: [jobIds[0], jobIds[1], jobIds[3]],
      },
      {
        ...testData.users[1],
        likedJobs: [jobIds[2], jobIds[3]],
        seenJobs: [jobIds[2], jobIds[3]],
      },
    ]);
    // Should remove jobs 0, 1, 2
    await jobSearcher.removeOutdatedJobs();
    expect(await Jobs.find({}).lean()).toMatchObject([testData.jobs[3]]);

    const user1 = await Users.findOne({
      'credentials.userName': testData.users[0].credentials.userName,
    }).lean();
    const user2 = await Users.findOne({
      'credentials.userName': testData.users[1].credentials.userName,
    }).lean();
    expect(user1.likedJobs).toEqual([]);
    expect(user1.seenJobs).toEqual([jobIds[3]]);
    expect(user2.likedJobs).toEqual([jobIds[3]]);
    expect(user2.seenJobs).toEqual([jobIds[3]]);
  });

  test('removeOutdatedJobs: Page request error, keep jobs', async () => {
    axios.get = jest.fn(() => new Promise((_, reject) => { reject(new HTTPError(400)); }));

    await Jobs.insertMany(testData.jobs);
    await jobSearcher.removeOutdatedJobs();
    // Jobs should not be removed if request for job page fails
    expect(await Jobs.find({}).lean()).toMatchObject(testData.jobs);
  });
});
