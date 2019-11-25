import mongoose from 'mongoose';
import { Express } from 'jest-express/lib/express';
import redis from 'redis';
import SocketMock from 'socket.io-mock';
import bluebird from 'bluebird';

import Friend from '..';
import Messenger from '../../messenger';
import Response from '../../types';
import { Users, Jobs } from '../../schema';
import { REDIS_IP } from '../../constants';

jest.mock('../../messenger');

bluebird.promisifyAll(redis);

describe('Friend', () => {
  let friend;
  let messenger;
  let app;
  let user1Id;
  let user2Id;
  let job1Id;
  let invalidUserId;
  let redisClient;

  beforeAll(async () => {
    // Connect to the in-memory db
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    app = new Express();
    messenger = new Messenger();
    messenger.requestFriend = jest.fn(() => new Response(true, '', 200));
    redisClient = redis.createClient({
      host: REDIS_IP,
    });

    const socket = new SocketMock();
    SocketMock.prototype.to = jest.fn(() => socket);

    friend = new Friend(app, redisClient, socket, messenger);
  });

  afterAll(async () => {
    redisClient.quit();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // We create all users before each test case instead of test suite so that
    // the tests can be run in any order
    const user1 = await Users.create({
      credentials: {
        userName: 'user1',
        email: 'user1@mail.com',
      },
    });
    const user2 = await Users.create({
      credentials: {
        userName: 'user2',
        email: 'user2@mail.com',
      },
    });
    const invalidUser = await Users.create({
      credentials: {
        userName: 'invalidUser',
        email: 'invalidUser@mail.com',
      },
    });
    const job1 = await Jobs.create({
      'title' : 'Real Programmers Only',
      'url' : 'http://www.indeed.com/viewjob?from=appsharedroid&jk=c14a37f847778a31',
      'company' : 'Jobot',
      'location' : 'Cincinnati, OH 45241',
      'postDate' : '',
      'salary' : '$60,000 - $80,000 a year',
      'description' : 'Rust rust sucks. Python is great',
      'keywords': [
          {
              'name': 'rust',
              'tfidf': 0.46209812037329684,
              'count': 2,
          },
          {
              'name': 'python',
              'tfidf': 0.46209812037329684,
              'count': 1,
          },
          {
              'name': 'java',
              'tfidf': 0,
              'count': 0,
          },
      ],
    });
    user1Id = user1._id.toString();
    user2Id = user2._id.toString();
    invalidUserId = invalidUser._id.toString();
    job1Id = job1._id.toString();
    // Delete the user to invalidate the id
    await Users.findByIdAndDelete(invalidUserId);
  });

  afterEach(async () => {
    // Delete all users after each test
    await Users.deleteMany({});
    await Jobs.deleteMany({});
    // Make sure to clear all mock state (e.g. number of times called)
    jest.clearAllMocks();
  });

  // Helper function that tests functions with a single user id as the input
  // Tests that an empty id will be rejected
  const testEmptyId = async (func) => {
    const response = new Response(null, 'Invalid userId', 400);
    const usersBefore = await Users.find({});

    expect(await friend[func](undefined)).toEqual(response);

    const usersAfter = await Users.find({});
    expect(usersBefore).toEqual(usersAfter);
  };

  // Helper function that tests functions with two user ids as the input
  // Tests that one or more empty ids will be rejected
  const testEmptyIds = async (func) => {
    const usersBefore = await Users.find({});
    let actualResponse = await friend[func](undefined, undefined);
    expect(actualResponse.status).toEqual(400);
    actualResponse = await friend[func](user1Id, undefined);
    expect(actualResponse.status).toEqual(400);
    actualResponse = await friend[func](undefined, user2Id);
    expect(actualResponse.status).toEqual(400);

    const usersAfter = await Users.find({});
    expect(usersBefore).toEqual(usersAfter);
  };

  // Helper function that tests functions with a single user id as the input
  // Tests that an invalid id will be rejected
  const testInvalidUser = async (func) => {
    const response = new Response(null, 'Invalid userId', 400);
    const usersBefore = await Users.find({});

    expect(await friend[func](invalidUserId)).toEqual(response);
    expect(await friend[func](123)).toEqual(response);
    expect(await friend[func]('test')).toEqual(response);
    expect(await friend[func]({})).toEqual(response);

    const usersAfter = await Users.find({});
    expect(usersBefore).toEqual(usersAfter);
  };

  // Helper function that tests functions with two user ids as the input
  // Tests that one or more invalid ids will be rejected
  const testInvalidUsers = async (func) => {
    const usersBefore = await Users.find({});

    let actualResponse = await friend[func](user1Id, invalidUserId);
    expect(actualResponse.status).toEqual(400);
    actualResponse = await friend[func](invalidUserId, user2Id);
    expect(actualResponse.status).toEqual(400);
    actualResponse = await friend[func](123, user2Id);
    expect(actualResponse.status).toEqual(400);
    actualResponse = await friend[func]('test', user2Id);
    expect(actualResponse.status).toEqual(400);
    actualResponse = await friend[func]({}, user2Id);
    expect(actualResponse.status).toEqual(400);

    const usersAfter = await Users.find({});
    expect(usersBefore).toEqual(usersAfter);
  };

  test('getRecommendedJobs: Empty Id', async () => {
    await testEmptyId('getRecommendedJobs');
    expect(messenger.requestFriend).toHaveBeenCalledTimes(0);
  });

  test('getRecommendedJobs: Invalid Id', async () => {
    await testInvalidUser('getRecommendedJobs');
    expect(messenger.requestFriend).toHaveBeenCalledTimes(0);
  });

  test('confirmJob: Empty Ids', async () => {
    await testEmptyIds('confirmJob');
    expect(messenger.requestFriend).toHaveBeenCalledTimes(0);
  });

  test('confirmJob: Invalid Ids', async () => {
    await testInvalidUsers('confirmJob');
    expect(messenger.requestFriend).toHaveBeenCalledTimes(0);
  });

  test('confirmJob: Valid User and Job', async () => {
    await Users.findByIdAndUpdate(user1Id, {
      $push: {
        friendSuggestedJobs: job1Id,
      },
    });
    const response = new Response(true, '', 200);
    expect(await friend.confirmJob(user1Id, job1Id)).toEqual(response);
  });

  test('sendJob: Valid send Job', async () => {
    await Users.findByIdAndUpdate(user1Id, {
      $push: {
        friends: user2Id,
      },
    });
    await Users.findByIdAndUpdate(user2Id, {
      $push: {
        friends: user1Id,
      },
    });
    const response = new Response(undefined, '', 200);
    expect(await friend.sendJob(user1Id, user2Id, job1Id)).toEqual(response);
  });

  test('addFriend: Empty Ids', async () => {
    await testEmptyIds('addFriend');
    expect(messenger.requestFriend).toHaveBeenCalledTimes(0);
  });

  test('addFriend: Invalid Users', async () => {
    await testInvalidUsers('addFriend');
    expect(messenger.requestFriend).toHaveBeenCalledTimes(0);
  });

  test('addFriend: Self', async () => {
    const response = new Response(false, 'Cannot add self as a friend', 400);
    const usersBefore = await Users.find({});

    expect(await friend.addFriend(user1Id, user1Id)).toEqual(response);
    expect(await friend.addFriend(user2Id, user2Id)).toEqual(response);
    expect(messenger.requestFriend).toHaveBeenCalledTimes(0);

    const usersAfter = await Users.find({});
    expect(usersBefore).toEqual(usersAfter);
  });

  test('addFriend: Success', async () => {
    const response = new Response(true, '', 200);
    expect(await friend.addFriend(user1Id, user2Id)).toEqual(response);
    expect(messenger.requestFriend).toHaveBeenCalledTimes(1);

    const user2 = await Users.findById(user2Id);
    const user1 = await Users.findById(user1Id);
    expect(user1.pendingFriends.length).toBe(0);
    expect(user2.pendingFriends.length).toBe(1);
    expect(JSON.stringify(user2.pendingFriends[0])).toEqual(JSON.stringify(user1Id));

    expect(user1.friends.length).toBe(0);
    expect(user2.friends.length).toBe(0);
  });

  test('addFriend: Already Pending', async () => {
    await Users.findByIdAndUpdate(user2Id, {
      $addToSet: {
        pendingFriends: user1Id,
      },
    });
    const response1 = new Response(false, 'Friend has already been added', 400);
    const response2 = new Response(false, 'Friend already a pending friend of user', 400);

    const usersBefore = await Users.find({});
    expect(await friend.addFriend(user1Id, user2Id)).toEqual(response1);
    expect(await friend.addFriend(user2Id, user1Id)).toEqual(response2);

    const usersAfter = await Users.find({});
    expect(usersBefore).toEqual(usersAfter);
  });

  test('removeFriend: Empty Ids', async () => {
    await testEmptyIds('removeFriend');
  });

  test('removeFriend: Invalid Users', async () => {
    await testInvalidUsers('removeFriend');
  });

  test('removeFriend: Not Friends', async () => {
    const response = new Response(false, 'Not a friend', 400);
    const usersBefore = await Users.find({});

    expect(await friend.removeFriend(user1Id, user1Id)).toEqual(response);
    expect(await friend.removeFriend(user2Id, user2Id)).toEqual(response);

    const usersAfter = await Users.find({});
    expect(usersBefore).toEqual(usersAfter);
  });

  test('removeFriend: Success', async () => {
    await Users.findByIdAndUpdate(user2Id, {
      $addToSet: {
        friends: user1Id,
      },
    });
    await Users.findByIdAndUpdate(user1Id, {
      $addToSet: {
        friends: user2Id,
      },
    });
    const response = new Response(true, '', 200);
    expect(await friend.removeFriend(user1Id, user2Id)).toEqual(response);

    const user1 = await Users.findById(user1Id);
    const user2 = await Users.findById(user2Id);
    expect(user1.friends.length).toBe(0);
    expect(user2.friends.length).toBe(0);
  });

  test('confirmFriend: Empty Ids', async () => {
    await testEmptyIds('confirmFriend');
  });

  test('confirmFriend: Invalid Users', async () => {
    await testInvalidUsers('confirmFriend');
  });

  test('confirmFriend: Not Pending Friend', async () => {
    const response = new Response(false, 'Not a pending friend', 400);
    const usersBefore = await Users.find({});

    expect(await friend.confirmFriend(user1Id, user1Id)).toEqual(response);
    expect(await friend.confirmFriend(user2Id, user2Id)).toEqual(response);

    const usersAfter = await Users.find({});
    expect(usersBefore).toEqual(usersAfter);
  });

  test('confirmFriend: Success', async () => {
    await Users.findByIdAndUpdate(user1Id, {
      $addToSet: {
        pendingFriends: user2Id,
      },
    });
    const response = new Response(true, '', 200);
    expect(await friend.confirmFriend(user1Id, user2Id)).toEqual(response);

    const user1 = await Users.findById(user1Id);
    const user2 = await Users.findById(user2Id);
    expect(user1.friends.length).toBe(1);
    expect(user2.friends.length).toBe(1);
    expect(user1.pendingFriends.length).toBe(0);
    expect(JSON.stringify(user1.friends[0])).toEqual(JSON.stringify(user2Id));
    expect(JSON.stringify(user2.friends[0])).toEqual(JSON.stringify(user1Id));
  });

  test('removePendingFriend: Empty Ids', async () => {
    await testEmptyIds('removePendingFriend');
  });

  test('removePendingFriend: Invalid Users', async () => {
    await testInvalidUsers('removePendingFriend');
  });

  test('removePendingFriend: Not Pending Friend', async () => {
    const response = new Response(false, 'Not a pending friend', 400);
    const usersBefore = await Users.find({});

    expect(await friend.removePendingFriend(user1Id, user1Id)).toEqual(response);
    expect(await friend.removePendingFriend(user2Id, user2Id)).toEqual(response);

    const usersAfter = await Users.find({});
    expect(usersBefore).toEqual(usersAfter);
  });

  test('removePendingFriend: Success', async () => {
    await Users.findByIdAndUpdate(user1Id, {
      $addToSet: {
        pendingFriends: user2Id,
      },
    });
    const response = new Response(true, '', 200);
    expect(await friend.removePendingFriend(user1Id, user2Id)).toEqual(response);

    const user1 = await Users.findById(user1Id);
    const user2 = await Users.findById(user2Id);
    expect(user1.pendingFriends.length).toBe(0);
    expect(user2.pendingFriends.length).toBe(0);
  });

  test('getFriends: Empty Id', async () => {
    await testEmptyId('getFriends');
  });

  test('getFriends: Invalid User', async () => {
    await testInvalidUser('getFriends');
  });

  test('getFriends: No Friends', async () => {
    const response = new Response([], '', 200);

    expect(await friend.getFriends(user1Id)).toEqual(response);
  });

  test('getFriends: Has Friends', async () => {
    await Users.findByIdAndUpdate(user2Id, {
      $addToSet: {
        friends: user1Id,
      },
    });
    await Users.findByIdAndUpdate(user1Id, {
      $addToSet: {
        friends: user2Id,
      },
    });

    const response1 = new Response([{
      _id: user2Id,
      userName: 'user2',
    }], '', 200);
    const response2 = new Response([{
      _id: user1Id,
      userName: 'user1',
    }], '', 200);

    expect(await friend.getFriends(user1Id)).toEqual(response1);
    expect(await friend.getFriends(user2Id)).toEqual(response2);
  });

  test('getPendingFriends: Empty Id', async () => {
    await testEmptyId('getPendingFriends');
  });

  test('getPendingFriends: Invalid User', async () => {
    await testInvalidUser('getPendingFriends');
  });

  test('getPendingFriends: No Pending Friends', async () => {
    const response = new Response([], '', 200);

    expect(await friend.getPendingFriends(user1Id)).toEqual(response);
  });

  test('getPendingFriends: Has Pending Friends', async () => {
    await Users.findByIdAndUpdate(user1Id, {
      $addToSet: {
        pendingFriends: user2Id,
      },
    });

    const response = new Response([{
      _id: user2Id,
      userName: 'user2',
    }], '', 200);

    expect(await friend.getPendingFriends(user1Id)).toEqual(response);
  });
});
