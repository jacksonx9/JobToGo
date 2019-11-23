import scheduler from 'node-schedule';
import Logger from 'js-logger';
import supertest from 'supertest';

import Server from '../src/server';
import { mockMessenger, mockSearcher } from './utils/Mock';
import * as constants from '../src/constants';
import jobConfig from '../src/job_searcher/config';
import { Users, Jobs } from '../src/schema';
import testData from './data/test_data';

jest.mock('axios');
jest.mock('cheerio');
jest.mock('indeed-scraper');
jest.mock('firebase-admin');

describe('Job Searching', () => {
  let server;
  let constantsCopy;
  let jobConfigCopy;
  let userId;
  let request;

  beforeAll(async () => {
    constantsCopy = JSON.parse(JSON.stringify(constants));
    jobConfigCopy = JSON.parse(JSON.stringify(jobConfig));
    constants.MONGO_URL = process.env.MONGO_URL;
    constants.LOG_LEVEL = Logger.OFF;
    constants.DEBUG = false;
    constants.MIN_JOBS_IN_DB = 10;
    constants.JOBS_PER_SEND = 10;
    jobConfig.keywords = ['software'];

    scheduler.scheduleJob = jest.fn();
    mockSearcher();
    mockMessenger();

    // Insert a few jobs to be removed
    Jobs.insertMany(testData.jobs.slice(0, 3));

    server = new Server();
    await server.start();

    request = supertest(server.app);
  });

  afterAll(async () => {
    await Jobs.deleteMany({});
    await server.shutdown();
    constants = constantsCopy;
    jobConfig = jobConfigCopy;
  });

  beforeEach(async () => {
    const user = await Users.create(testData.users[0]);
    userId = user._id.toString();
  });

  afterEach(async () => {
    await Users.deleteMany({});
    await jest.clearAllMocks();
  });

  test('Find searched jobs', async () => {
    // Check there are jobs in the store
    const response = await request.get(`/jobs/find/${userId}`);
    const receivedJobs = response.body.result;
    receivedJobs.forEach((_, i) => delete receivedJobs[i]._id);
    expect(receivedJobs).toMatchObject(testData.jobs.slice(1));
  });
});
