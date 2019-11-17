import scheduler from 'node-schedule';
import Logger from 'js-logger';
import supertest from 'supertest';

import Server from '../src/server';
import * as constants from '../src/constants';
import { Users } from '../src/schema';
import { mockMessenger, send } from './utils/Mock';
import testData from './data/test_data';

jest.mock('firebase-admin');

describe('Friends', () => {
  let server;
  let constantsCopy;
  let user1Id;
  let user2Id;
  let invalidUserId;
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
    user1Id = user1._id.toString();
    user2Id = user2._id.toString();
    invalidUserId = invalidUser._id.toString();
    // Delete the user to invalidate the id
    await Users.findByIdAndDelete(invalidUserId);

    // Mock external APIS
    mockMessenger();
  });

  afterEach(async () => {
    // Delete all users after each test
    await Users.deleteMany({});
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
});
