import mongoose from 'mongoose';
import { Express } from 'jest-express/lib/express';

import Friend from '..';
import Messenger from '../../messenger';
import Response from '../../types';
import { Users } from '../../schema';

jest.mock('../../messenger');

describe('Friend', () => {
  let friend;
  let messenger;
  let app;
  let user1Id;
  let user2Id;
  let invalidUserId;

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

    friend = new Friend(app, messenger);
  });

  afterAll(async () => {
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
    user1Id = user1._id;
    user2Id = user2._id;
    invalidUserId = invalidUser._id;
    // Delete the user to invalidate the id
    await Users.findByIdAndDelete(invalidUserId);
  });

  afterEach(async () => {
    // Delete all users after each test
    await Users.deleteMany({});
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
    const response = new Response(false, 'Invalid userId or friendId', 400);
    const usersBefore = await Users.find({});

    expect(await friend[func](undefined, undefined)).toEqual(response);
    expect(await friend[func](user1Id, undefined)).toEqual(response);
    expect(await friend[func](undefined, user2Id)).toEqual(response);

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
    const response = new Response(false, 'Invalid userId or friendId', 400);
    const usersBefore = await Users.find({});

    expect(await friend[func](user1Id, invalidUserId)).toEqual(response);
    expect(await friend[func](invalidUserId, user2Id)).toEqual(response);
    expect(await friend[func](123, user2Id)).toEqual(response);
    expect(await friend[func]('test', user2Id)).toEqual(response);
    expect(await friend[func]({}, user2Id)).toEqual(response);

    const usersAfter = await Users.find({});
    expect(usersBefore).toEqual(usersAfter);
  };

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
