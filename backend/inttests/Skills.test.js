import scheduler from 'node-schedule';
import Logger from 'js-logger';
import supertest from 'supertest';
import { forEachAsync } from 'foreachasync';

import Server from '../src/server';
import * as constants from '../src/constants';
import { Users, Jobs, Skills } from '../src/schema';
import { mockMessenger, mockResume } from './utils/Mock';
import testData from './data/test_data';

jest.mock('firebase-admin');
jest.mock('nodemailer');
jest.mock('stopword');
jest.mock('axios');

describe('Skills', () => {
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
    mockResume();
  });

  afterEach(async () => {
    await Users.deleteMany({});
    await Jobs.deleteMany({});
    await Skills.findOneAndUpdate({}, { skills: [] });
    await jest.clearAllMocks();
    await jest.restoreAllMocks();
  });

  test('Upload resume', async () => {
    // Check no skills
    let response = await request.get(`/users/skills/${userId}`);
    expect(response.body.result).toEqual([]);

    // Upload resume
    response = await request
      .post('/resume')
      .field('userId', userId)
      .attach('resume', `${__dirname}/data/resume.pdf`);
    expect(response.body.result).toBe(true);

    // Check skills have been added
    response = await request.get(`/users/skills/${userId}`);
    expect(response.body.result).toEqual(testData.skills);

    // Upload resume again
    response = await request
      .post('/resume')
      .field('userId', userId)
      .attach('resume', `${__dirname}/data/resume.pdf`);
    expect(response.body.result).toBe(true);

    // Check skills are the same
    response = await request.get(`/users/skills/${userId}`);
    expect(response.body.result).toEqual(testData.skills);
  });

  test('Upload resume errors', async () => {
    // Disable resume logs
    jest.spyOn(console, 'log').mockImplementation();

    // Invalid user
    let response = await request
      .post('/resume')
      .field('userId', invalidUserId)
      .attach('resume', `${__dirname}/data/resume.pdf`);
    expect(response.body.result).toBe(false);

    // Upload invalid resume
    response = await request
      .post('/resume')
      .field('userId', userId)
      .attach('resume', `${__dirname}/data/invalid.pdf`);
    expect(response.body.result).toBe(false);

    // Don't attach a resume
    response = await request
      .post('/resume')
      .field('userId', userId);
    expect(response.body.result).toBe(false);

    // Attach a non-pdf
    response = await request
      .post('/resume')
      .field('userId', userId)
      .attach('resume', `${__dirname}/data/test_data.json`);
    expect(response.body.result).toBe(false);
  });

  test('Job relevance', async () => {
    // Upload resume
    let response = await request
      .post('/resume')
      .field('userId', userId)
      .attach('resume', `${__dirname}/data/resume.pdf`);
    expect(response.body.result).toBe(true);

    // Check most relevant jobs are returned
    response = await request.get(`/jobs/find/${userId}`);
    expect(response.body.result).toMatchObject([
      testData.jobs[9], testData.jobs[8], testData.jobs[7], testData.jobs[6],
    ]);

    // Dislike jobs with c++, python
    await forEachAsync([7, 9], async (idx) => {
      response = await request.post('/jobs/dislike').send({
        userId,
        jobId: jobIds[idx],
      });
      expect(response.body.result).toBe(true);
    });

    // Like jobs with java
    await forEachAsync([6, 8], async (idx) => {
      response = await request.post('/jobs/like').send({
        userId,
        jobId: jobIds[idx],
      });
      expect(response.body.result).toBe(true);
    });

    // Check most relevant jobs are returned - jobs with java, jobs with no c++/python
    response = await request.get(`/jobs/find/${userId}`);
    expect(response.body.result).toMatchObject([
      testData.jobs[5], testData.jobs[1], testData.jobs[3], testData.jobs[0],
    ]);
  });
});
