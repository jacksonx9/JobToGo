import scheduler from 'node-schedule';
import Logger from 'js-logger';
import supertest from 'supertest';

import Server from '../src/server';
import * as constants from '../src/constants';
import { Users, Jobs } from '../src/schema';
import { mockMessenger, send } from './utils/Mock';
import testData from './data/test_data';

jest.mock('firebase-admin');

describe('Friends', () => {
  let server;
  let constantsCopy;
  let user1Id;
  let user2Id;
  let invalidUserId;
  let job1Id;
  let request;

  beforeAll(async () => {
    constantsCopy = JSON.parse(JSON.stringify(constants));
    constants.MONGO_URL = process.env.MONGO_URL;
    constants.MIN_JOBS_IN_DB = 0;
    constants.LOG_LEVEL = Logger.WARN;
    constants.DEBUG = false;

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
    // We create all users before each test case instead of test suite so that
    // the tests can be run in any order
    const user1 = await Users.create(testData.users[0]);
    const user2 = await Users.create(testData.users[1]);
    const invalidUser = await Users.create(testData.users[2]);
    const job1 = await Jobs.create(testData.jobs[0]);
    user1Id = user1._id.toString();
    user2Id = user2._id.toString();
    invalidUserId = invalidUser._id.toString();
    job1Id = job1._id.toString();
    // Delete the user to invalidate the id
    await Users.findByIdAndDelete(invalidUserId);

    // Mock external APIS
    mockMessenger();
  });

  afterEach(async () => {
    // Delete all users after each test
    await Users.deleteMany({});
    await Jobs.deleteMany({});
    await jest.clearAllMocks();
  });

  test('Add and remove friend success', async () => {
    // user1 adds user2
    let response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);

    // empty userId to get pending friends
    response = await request.get('/friends/pending/');
    expect(response.body.result).toEqual(null);
    expect(response.body.status).toEqual(400);

    // invalid userId to get pending friends
    response = await request.get('/friends/pending/123');
    expect(response.body.result).toEqual(null);
    expect(response.body.status).toEqual(400);


    // user2 checks user1 is a pending friend
    response = await request.get(`/friends/pending/${user2Id}`);
    expect(response.body.result).toEqual([{
      _id: user1Id,
      userName: testData.users[0].credentials.userName,
    }]);

    // user2 confirms user1 as a friend
    response = await request.post('/friends/confirm').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(true);

    // user2 checks user1 is a friend
    response = await request.get(`/friends/${user2Id}`);
    expect(response.body.result).toEqual([{
      _id: user1Id,
      userName: testData.users[0].credentials.userName,
    }]);

    // user1 checks user2 is a friend
    response = await request.get(`/friends/${user1Id}`);
    expect(response.body.result).toEqual([{
      _id: user2Id,
      userName: testData.users[1].credentials.userName,
    }]);

    // user1 removes user2 as a friend
    response = await request.delete('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toEqual(true);

    // user2 checks user1 is not a friend
    response = await request.get(`/friends/${user2Id}`);
    expect(response.body.result).toEqual([]);

    // user1 checks user2 is not a friend
    response = await request.get(`/friends/${user1Id}`);
    expect(response.body.result).toEqual([]);
  });

  test('Add friend rejected', async () => {
    // user1 adds user2
    let response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(true);

    // user2 checks user1 is a pending friend
    response = await request.get(`/friends/pending/${user2Id}`);
    expect(response.body.result).toEqual([{
      _id: user1Id,
      userName: testData.users[0].credentials.userName,
    }]);

    // user2 removes user1 as a pending friend
    response = await request.delete('/friends/pending').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toEqual(true);
  });

  test('Add and remove friend errors', async () => {
    // user1 adds self, cannot add self
    let response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(false);

    // user1 adds user2
    response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);

    // user1 adds user2 again, already added
    response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(false);

    // user2 adds user1, user2 already added
    response = await request.post('/friends').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(false);

    // user1 removes user2 as pending friend, not a pending friend
    response = await request.delete('/friends/pending').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(false);

    // user1 removes user2 as friend, not a friend
    response = await request.delete('/friends/').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(false);

    // user1 confirms user2 as friend, not a pending friend
    response = await request.post('/friends/confirm').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(false);

    // user2 confirms user1 as friend
    response = await request.post('/friends/confirm').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(true);

    // user2 adds user1, already a friend
    response = await request.post('/friends').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(false);
  });

  test('Send job success', async () => {
    // user1 adds user2
    let response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);

    // user2 checks user1 is a pending friend
    response = await request.get(`/friends/pending/${user2Id}`);
    expect(response.body.result).toEqual([{
      _id: user1Id,
      userName: testData.users[0].credentials.userName,
    }]);

    // user2 confirms user1 as a friend
    response = await request.post('/friends/confirm').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(true);

    // user1 sends job to user2
    response = await request.post('/friends/sendJob').send({
      userId: user1Id,
      friendId: user2Id,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);
  });

  test('Send job invalid inputs and failures', async () => {
    // user1 adds user2
    let response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);

    // user2 checks user1 is a pending friend
    response = await request.get(`/friends/pending/${user2Id}`);
    expect(response.body.result).toEqual([{
      _id: user1Id,
      userName: testData.users[0].credentials.userName,
    }]);

    // user2 confirms user1 as a friend
    response = await request.post('/friends/confirm').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(true);

    // user1 empty
    response = await request.post('/friends/sendJob').send({
      userId: '',
      friendId: user2Id,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(false);

    // user1 invalid
    response = await request.post('/friends/sendJob').send({
      userId: user1Id,
      friendId: 123,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(false);

    // sending job to self, error
    response = await request.post('/friends/sendJob').send({
      userId: user1Id,
      friendId: user1Id,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(false);
  });

  test('Open recommended jobs', async () => {
    // user1 adds user2
    let response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);

    // user2 checks user1 is a pending friend
    response = await request.get(`/friends/pending/${user2Id}`);
    expect(response.body.result).toEqual([{
      _id: user1Id,
      userName: testData.users[0].credentials.userName,
    }]);

    // user2 confirms user1 as a friend
    response = await request.post('/friends/confirm').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(true);

    // user1 sends job to user2
    response = await request.post('/friends/sendJob').send({
      userId: user1Id,
      friendId: user2Id,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);

    // get recommended jobs for user1
    response = await request.get(`/friends/recommendedJobs/${user1Id}`);
    expect(response.body.status).toEqual(200);
    expect(response.body.result).toEqual([]);

    // get recommended jobs for user2
    response = await request.get(`/friends/recommendedJobs/${user2Id}`);
    expect(response.body.status).toEqual(200);
    expect(response.body.result[0]._id.toString()).toEqual(job1Id);
  });

  test('Open recommended jobs invalid input', async () => {
    // user1 adds user2
    let response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);

    // user2 checks user1 is a pending friend
    response = await request.get(`/friends/pending/${user2Id}`);
    expect(response.body.result).toEqual([{
      _id: user1Id,
      userName: testData.users[0].credentials.userName,
    }]);

    // user2 confirms user1 as a friend
    response = await request.post('/friends/confirm').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(true);

    // user1 sends job to user2
    response = await request.post('/friends/sendJob').send({
      userId: user1Id,
      friendId: user2Id,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);

    // get recommended jobs for null user
    response = await request.get('/friends/recommendedJobs/');
    expect(response.body.status).toEqual(400);

    // get recommended jobs for invalid user
    response = await request.get('/friends/recommendedJobs/123');
    expect(response.body.status).toEqual(400);
  });

  test('Confirm job from friend success', async () => {
    // user1 adds user2
    let response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);

    // user2 checks user1 is a pending friend
    response = await request.get(`/friends/pending/${user2Id}`);
    expect(response.body.result).toEqual([{
      _id: user1Id,
      userName: testData.users[0].credentials.userName,
    }]);

    // user2 confirms user1 as a friend
    response = await request.post('/friends/confirm').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(true);

    // user1 sends job to user2
    response = await request.post('/friends/sendJob').send({
      userId: user1Id,
      friendId: user2Id,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);

    // user1 can not like job since it was never sent from a friend
    response = await request.post('/friends/confirmJob').send({
      userId: user1Id,
      jobId: job1Id,
    });
    expect(response.body.status).toEqual(400);
    expect(response.body.result).toBe(false);

    // user2 likes job from user1
    response = await request.post('/friends/confirmJob').send({
      userId: user2Id,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(true);
  });

  test('Confirm job from friend invalid inputs', async () => {
    // user1 adds user2
    let response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);

    // user2 checks user1 is a pending friend
    response = await request.get(`/friends/pending/${user2Id}`);
    expect(response.body.result).toEqual([{
      _id: user1Id,
      userName: testData.users[0].credentials.userName,
    }]);

    // user2 confirms user1 as a friend
    response = await request.post('/friends/confirm').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(true);

    // user1 sends job to user2
    response = await request.post('/friends/sendJob').send({
      userId: user1Id,
      friendId: user2Id,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);

    // null userId
    response = await request.post('/friends/confirmJob').send({
      userId: '',
      jobId: job1Id,
    });
    expect(response.body.result).toBe(false);
    expect(response.body.status).toEqual(400);

    // invalid userId
    response = await request.post('/friends/confirmJob').send({
      userId: 123,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(false);
    expect(response.body.status).toEqual(400);
  });

  test('Reject job from friend success', async () => {
    // user1 adds user2
    let response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);

    // user2 checks user1 is a pending friend
    response = await request.get(`/friends/pending/${user2Id}`);
    expect(response.body.result).toEqual([{
      _id: user1Id,
      userName: testData.users[0].credentials.userName,
    }]);

    // user2 confirms user1 as a friend
    response = await request.post('/friends/confirm').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(true);

    // user1 sends job to user2
    response = await request.post('/friends/sendJob').send({
      userId: user1Id,
      friendId: user2Id,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);

    // user1 can not dislike job since it was never sent from a friend
    response = await request.post('/friends/rejectJob').send({
      userId: user1Id,
      jobId: job1Id,
    });
    expect(response.body.status).toEqual(400);
    expect(response.body.result).toBe(false);

    // user2 dislikes job from user1
    response = await request.post('/friends/rejectJob').send({
      userId: user2Id,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(true);
  });

  test('Reject job from friend invalid inputs', async () => {
    // user1 adds user2
    let response = await request.post('/friends').send({
      userId: user1Id,
      friendId: user2Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);

    // user2 checks user1 is a pending friend
    response = await request.get(`/friends/pending/${user2Id}`);
    expect(response.body.result).toEqual([{
      _id: user1Id,
      userName: testData.users[0].credentials.userName,
    }]);

    // user2 confirms user1 as a friend
    response = await request.post('/friends/confirm').send({
      userId: user2Id,
      friendId: user1Id,
    });
    expect(response.body.result).toBe(true);

    // user1 sends job to user2
    response = await request.post('/friends/sendJob').send({
      userId: user1Id,
      friendId: user2Id,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(true);
    expect(send).toHaveBeenCalledTimes(2);

    // null userId
    response = await request.post('/friends/rejectJob').send({
      userId: '',
      jobId: job1Id,
    });
    expect(response.body.result).toBe(false);
    expect(response.body.status).toEqual(400);

    // invalid userId
    response = await request.post('/friends/rejectJob').send({
      userId: 123,
      jobId: job1Id,
    });
    expect(response.body.result).toBe(false);
    expect(response.body.status).toEqual(400);
  });
});
