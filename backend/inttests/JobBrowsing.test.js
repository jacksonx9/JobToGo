import scheduler from 'node-schedule';
import Logger from 'js-logger';
import supertest from 'supertest';
import { forEachAsync } from 'foreachasync';

import Server from '../src/server';
import * as constants from '../src/constants';
import { Users, Jobs } from '../src/schema';
import { mockMessenger, sendMail } from './utils/Mock';
import testData from './data/test_data';

jest.mock('firebase-admin');
jest.mock('nodemailer');

describe('Job Browsing', () => {
  let server;
  let constantsCopy;
  let userId;
  let invalidUserId;
  let jobIds;
  let request;

  beforeAll(async () => {
    constantsCopy = JSON.parse(JSON.stringify(constants));
    constants.MONGO_URL = process.env.MONGO_URL;
    constants.LOG_LEVEL = Logger.WARN;
    constants.DEBUG = false;
    constants.MIN_JOBS_IN_DB = 0;
    constants.JOBS_PER_SEND = 4;
    constants.DAILY_JOB_COUNT_LIMIT = 9;

    scheduler.scheduleJob = jest.fn();
    // Mock external APIs
    mockMessenger();

    server = new Server();
    await server.start();

    request = supertest(server.app);
  });

  afterAll(async () => {
    await server.shutdown();
    constants = constantsCopy;
  });

  beforeEach(async () => {
    const user = await Users.create(testData.users[0]);
    const invalidUser = await Users.create(testData.users[2]);
    userId = user._id.toString();
    invalidUserId = invalidUser._id.toString();
    // Delete the user to invalidate the id
    await Users.findByIdAndDelete(invalidUserId);

    const jobs = await Jobs.insertMany(testData.jobs);
    jobIds = jobs.map(job => job._id.toString());

    // Mock external APIs
    mockMessenger();
  });

  afterEach(async () => {
    await Users.deleteMany({});
    await Jobs.deleteMany({});
    await jest.clearAllMocks();
  });

  test('Browse, (dis)like, remove jobs success', async () => {
    // Find 4 jobs
    let response = await request.get(`/jobs/find/${userId}`);
    expect(response.body.result).toMatchObject([
      testData.jobs[0], testData.jobs[1], testData.jobs[2], testData.jobs[3],
    ]);

    // Check no liked jobs
    response = await request.get(`/jobs/like/${userId}`);
    expect(response.body.result).toMatchObject([]);

    // Like jobs 0, 2, 3
    await forEachAsync([0, 2, 3], async (idx) => {
      response = await request.post('/jobs/like').send({
        userId,
        jobId: jobIds[idx],
      });
      expect(response.body.result).toBe(true);
    });

    // Dislike job 1
    response = await request.post('/jobs/dislike').send({
      userId,
      jobId: jobIds[1],
    });
    expect(response.body.result).toBe(true);

    // Check only jobs 0, 2, 3 are liked
    response = await request.get(`/jobs/like/${userId}`);
    expect(response.body.result).toMatchObject([
      testData.jobs[0], testData.jobs[2], testData.jobs[3],
    ]);

    // Delete liked job 0
    response = await request.delete('/jobs').send({
      userId,
      jobId: jobIds[0],
    });
    expect(response.body.result).toBe(true);

    // Check only jobs 2, 3 are liked
    response = await request.get(`/jobs/like/${userId}`);
    expect(response.body.result).toMatchObject([
      testData.jobs[2], testData.jobs[3],
    ]);

    // Clear all liked jobs
    response = await request.delete('/jobs/all').send({
      userId,
    });
    expect(response.body.result).toBe(true);

    // Check no liked jobs
    response = await request.get(`/jobs/like/${userId}`);
    expect(response.body.result).toMatchObject([]);
  });

  test('Browse, (dis)like, remove jobs errors', async () => {
    // Find 4 jobs
    let response = await request.get(`/jobs/find/${userId}`);
    expect(response.body.result).toMatchObject([
      testData.jobs[0], testData.jobs[1], testData.jobs[2], testData.jobs[3],
    ]);

    // Like job 0
    response = await request.post('/jobs/like').send({
      userId,
      jobId: jobIds[0],
    });
    expect(response.body.result).toBe(true);

    // Like job 0 again, cannot like same job again
    response = await request.post('/jobs/like').send({
      userId,
      jobId: jobIds[0],
    });
    expect(response.body.result).toBe(false);

    // Dislike job 0, cannot like and dislike same job
    response = await request.post('/jobs/dislike').send({
      userId,
      jobId: jobIds[0],
    });
    expect(response.body.result).toBe(false);

    // Delete job 1, cannot delete job not liked
    response = await request.delete('/jobs').send({
      userId,
      jobId: jobIds[1],
    });
    expect(response.body.result).toBe(false);
  });

  test('Daily job cap', async () => {
    // Find 4 jobs
    let response = await request.get(`/jobs/find/${userId}`);
    expect(response.body.result).toMatchObject([
      testData.jobs[0], testData.jobs[1], testData.jobs[2], testData.jobs[3],
    ]);

    // Like all jobs
    await forEachAsync([0, 1, 2, 3], async (idx) => {
      response = await request.post('/jobs/like').send({
        userId,
        jobId: jobIds[idx],
      });
      expect(response.body.result).toBe(true);
    });

    // Find 4 more jobs
    response = await request.get(`/jobs/find/${userId}`);
    expect(response.body.result).toMatchObject([
      testData.jobs[4], testData.jobs[5], testData.jobs[6], testData.jobs[7],
    ]);

    // Like all jobs
    await forEachAsync([4, 5, 6, 7], async (idx) => {
      response = await request.post('/jobs/like').send({
        userId,
        jobId: jobIds[idx],
      });
      expect(response.body.result).toBe(true);
    });

    // Find 4 more jobs, only receive 1
    response = await request.get(`/jobs/find/${userId}`);
    expect(response.body.result).toMatchObject([
      testData.jobs[8],
    ]);

    // Like job
    response = await request.post('/jobs/like').send({
      userId,
      jobId: jobIds[8],
    });
    expect(response.body.result).toBe(true);

    // No more jobs allowed
    response = await request.get(`/jobs/find/${userId}`);
    expect(response.body.result).toBeNull();
  });

  test('Email liked jobs', async () => {
    // Find 4 jobs
    let response = await request.get(`/jobs/find/${userId}`);
    expect(response.body.result).toMatchObject([
      testData.jobs[0], testData.jobs[1], testData.jobs[2], testData.jobs[3],
    ]);

    // Email liked jobs, fails on no liked jobs
    response = await request.post('/messenger/email').send({
      userId,
    });
    expect(response.body.result).toBe(false);
    expect(sendMail).toHaveBeenCalledTimes(0);

    // Like jobs 0, 2, 3
    await forEachAsync([0, 2, 3], async (idx) => {
      response = await request.post('/jobs/like').send({
        userId,
        jobId: jobIds[idx],
      });
      expect(response.body.result).toBe(true);
    });

    // Email liked jobs, success
    response = await request.post('/messenger/email').send({
      userId,
    });
    expect(response.body.result).toBe(true);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });
});
