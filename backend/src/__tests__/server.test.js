
import admin from 'firebase-admin';
import mongoose from 'mongoose';
import Logger from 'js-logger';

import Server from '../server';
import * as constants from '../constants';
import AllSkills from '../all_skills';
import User from '../user';
import Friend from '../friend';
import ResumeParser from '../resume_parser';
import JobSearcher from '../job_searcher';
import JobShortLister from '../job_shortlister';
import JobAnalyzer from '../job_analyzer';
import Messenger from '../messenger';

jest.mock('firebase-admin');
jest.mock('../user');
jest.mock('../friend');
jest.mock('../resume_parser');
jest.mock('../job_searcher');
jest.mock('../job_shortlister');
jest.mock('../job_analyzer');
jest.mock('../messenger');
jest.mock('../all_skills');

describe('Server', () => {
  let server;
  let constantsCopy;

  beforeAll(async () => {
    constantsCopy = JSON.parse(JSON.stringify(constants));
    constants.LOG_LEVEL = Logger.WARN;
    AllSkills.setup = jest.fn(() => new Promise(resolve => resolve()));
    JobSearcher.prototype.updateJobStore = jest.fn(() => new Promise(resolve => resolve()));

    admin.initializeApp = jest.fn();
    server = new Server();
  });

  beforeEach(async () => {
    Object.assign(constants, constantsCopy);
    constants.MONGO_URL = process.env.MONGO_URL;
    constants.LOG_LEVEL = Logger.WARN;
  });

  afterEach(async () => {
    if (server.redisClient && server.redisClient.connected) {
      server.redisClient.quit();
    }
    if (mongoose.connection) {
      await mongoose.disconnect();
    }

    jest.clearAllMocks();
  });

  test('Firebase initialized', () => {
    expect(admin.initializeApp).toHaveBeenCalledTimes(1);
  });

  test('setupDB: Connected', async () => {
    await server.setupDB();
    expect(server.redisClient).toBeTruthy();
    expect(server.redisClient.connected).toBe(true);
  });

  test('setupDB: Redis failed to connect', () => {
    constants.REDIS_IP = '127.0.0.1';
    expect(server.setupDB()).rejects.toThrow(Error);
  });

  test('setupDB: Mongo failed to connect', () => {
    constants.MONGO_URL = '127.0.0.1';
    expect(server.setupDB()).rejects.toThrow(Error);
  });

  test('start and shutdown', async () => {
    await server.start();
    await server.shutdown();
    expect(JobSearcher.prototype.updateJobStore).toHaveBeenCalledTimes(1);
    expect(AllSkills).toHaveBeenCalledTimes(1);
    expect(User).toHaveBeenCalledTimes(1);
    expect(Friend).toHaveBeenCalledTimes(1);
    expect(ResumeParser).toHaveBeenCalledTimes(1);
    expect(JobSearcher).toHaveBeenCalledTimes(1);
    expect(JobShortLister).toHaveBeenCalledTimes(1);
    expect(JobAnalyzer).toHaveBeenCalledTimes(1);
    expect(Messenger).toHaveBeenCalledTimes(1);
  });
});
