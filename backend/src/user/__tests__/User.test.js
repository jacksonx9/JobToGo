import mongoose from 'mongoose';
import { Express } from 'jest-express/lib/express';
import { OAuth2Client } from 'google-auth-library';
import redis from 'redis';
import SocketMock from 'socket.io-mock';
import bluebird from 'bluebird';

import User from '..';
import Response from '../../types';
import { Users } from '../../schema';
import testData from './test_data';
import AllSkills from '../../all_skills';
import { REDIS_IP } from '../../constants';

bluebird.promisifyAll(redis);

const mockUser = () => {
  OAuth2Client.prototype.verifyIdToken = jest.fn(({ idToken, audience }) => new
  Promise((resolve) => {
    if (audience !== null && idToken === 'idToken') {
      resolve({
        payload: {
          email: testData.validUserData.credentials.email,
        },
      });
    } else {
      throw Error('invalid idToken');
    }
  }));
};

describe('User', () => {
  let user;
  let user1Id;
  let allSkills;
  let redisClient;

  beforeAll(async () => {
    // Connect to the in-memory db
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    redisClient = redis.createClient({
      host: REDIS_IP,
    });

    const socket = new SocketMock();
    SocketMock.prototype.to = jest.fn(() => socket);

    const app = new Express();
    allSkills = new AllSkills();
    user = new User(app, redisClient, socket, allSkills);
  });

  afterAll(async () => {
    redisClient.quit();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // We create all users before each test case instead of test suite so that
    // the tests can be run in any order
    const user1 = await Users.create(testData.validUserData);
    user1Id = user1._id;

    // Mock external APIs
    mockUser();
    // Mock external functions
    allSkills.update = jest.fn(() => null);
  });

  afterEach(async () => {
    await Users.deleteMany({});
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  // Helper function that tests functions with a single user id as the input
  // Tests that an empty id will be rejected
  const testEmptyId = async (func) => {
    const response = 400;

    const actualRes = await user[func](undefined);
    expect(actualRes.status).toEqual(response);
  };

  // Helper function that tests functions with two user ids as the input
  // Tests that one or more empty ids will be rejected
  const testEmptyIds = async (func) => {
    const responseStatus = 400;

    let res = await user[func](undefined, undefined);
    expect(res.status).toEqual(responseStatus);
    res = await user[func](user1Id, undefined);
    expect(res.status).toEqual(responseStatus);
    res = await user[func](undefined, user1Id);
    expect(res.status).toEqual(responseStatus);
    res = await user[func]('invalid', 'invalid');
    expect(res.status).toEqual(responseStatus);
  };

  test('createUser: Undefined User Data', async () => {
    const expectedRes = new Response(null, 'Invalid format, email, or userName', 400);
    expect(await user.createUser(undefined)).toEqual(expectedRes);
  });

  test('createUser: Invalid User Data', async () => {
    const expectedRes = new Response(null, 'Invalid format, email, or userName', 400);
    expect(await user.createUser(testData.invalidUserData)).toEqual(expectedRes);
  });

  test('createUser: Email Taken', async () => {
    const expectedRes = new Response('email', 'Email is already used', 400);
    expect(await user.createUser(testData.validUserData)).toEqual(expectedRes);
  });

  test('createUser: UserName Taken', async () => {
    const expectedRes = new Response('userName', 'Username is already used', 400);
    expect(await user.createUser(testData.user1DiffEmail)).toEqual(expectedRes);
  });

  test('editPassword: Invalid Inputs', async () => {
    testEmptyIds('editPassword');
  });

  test('editUserName: Invalid Inputs', async () => {
    testEmptyIds('editUserName');
  });

  test('editPassword: Valid Inputs', async () => {
    const res = await user.editPassword(user1Id, 'asdf');
    expect(res).toEqual(new Response(true, '', 200));
  });

  test('editUserName: Valid Inputs', async () => {
    const res = await user.editPassword(user1Id, 'asdf');
    expect(res).toEqual(new Response(true, '', 200));
  });

  test('createUser: Valid User Data', async () => {
    await Users.deleteMany({});
    const res = await user.createUser(testData.validUserData);
    expect(res.status).toEqual(200);
  });

  test('login: Invalid Inputs', async () => {
    testEmptyIds('login');
  });

  test('login: Success', async () => {
    const res = await user.login(testData.validUserData.credentials.userName,
      testData.validUserData.credentials.password);
    expect(res.status).toEqual(200);
  });

  test('loginGoogle: Invalid Inputs', async () => {
    testEmptyIds('loginGoogle');
  });

  test('getUserInfo: Invalid Inputs', async () => {
    testEmptyId('getUserInfo');
  });

  test('getUserInfo: Created User', async () => {
    const res = await user.getUserInfo(user1Id);
    expect(res.result._id).toEqual(user1Id);
    expect(res.status).toEqual(200);
  });

  test('searchUser, Invalid User', async () => {
    const expectedRes = new Response(null, 'Invalid userId', 400);
    expect(await User.searchUser(undefined, '')).toEqual(expectedRes);
  });

  test('searchUser, User Searching Itself', async () => {
    const expectedRes = new Response([], '', 200);
    expect(await User.searchUser(user1Id.toString(), 'user')).toEqual(expectedRes);
  });

  test('searchUser, User Searching Other User', async () => {
    const secondUser = await Users.create(testData.secondUser);
    const actualRes = await User.searchUser(user1Id, 'second');
    expect(actualRes.result[0]._id).toEqual(secondUser._id);
  });

  test('addKeyword, Invalid Inputs', async () => {
    testEmptyIds('addKeyword');
  });

  test('addKeyword, Valid Inputs', async () => {
    const res = await user.addKeyword(user1Id, 'c++');
    expect(res).toEqual(new Response(true, '', 200));
    const userData = await Users.findById(user1Id);
    expect(userData.keywords[0].name).toEqual('c++');
  });

  test('addKeyword, Existing Keyword', async () => {
    await Users.findByIdAndUpdate(user1Id, {
      $push: {
        keywords: {
          name: 'c++',
          score: 0,
          jobCount: 0,
          timeStamp: Date.now(),
        },
      },
    });

    const res = await user.addKeyword(user1Id, 'c++');
    expect(res).toEqual(new Response(true, 'User already has this keyword', 400));
  });

  test('deleteKeyword, Invalid Inputs', async () => {
    testEmptyIds('deleteKeyword');
  });

  test('deleteKeyword, Valid Inputs', async () => {
    await Users.findByIdAndUpdate(user1Id, {
      $push: {
        keywords: {
          name: 'c++',
          score: 0,
          jobCount: 0,
          timeStamp: Date.now(),
        },
      },
    });

    const res = await user.deleteKeyword(user1Id, 'c++');
    expect(res).toEqual(new Response(true, '', 200));
  });

  test('loginGoogle: First Time User Logs In', async () => {
    await Users.deleteMany({});
    const res = await user.loginGoogle('idToken', testData.validUserData.credentials.firebaseToken);
    expect(res.status).toEqual(400);
  });

  test('loginGoogle: Account already exists', async () => {
    const res = await user.loginGoogle('idToken', testData.validUserData.credentials.firebaseToken);
    expect(res).toEqual(new Response(user1Id, '', 200));
  });

  test('updateUserInfo: Invalid Inputs', async () => {
    testEmptyIds('updateUserInfo');
  });

  test('updateUserInfo: Valid Inputs', async () => {
    const userData = {
      location: 'hawaii',
      jobType: 'internship',
    };
    const res = await user.updateUserInfo(user1Id, userData);
    expect(res.status).toEqual(200);
    const userRes = await Users.findById(user1Id).lean();
    expect(userRes.userInfo).toEqual(userData);
  });

  test('getUser: Invalid Input', async () => {
    const res = await user.getUser(undefined);
    expect(res.status).toEqual(404);
  });

  test('getUser: Valid Username', async () => {
    const expectResult = {
      _id: user1Id,
      userName: testData.validUserData.credentials.userName,
      email: testData.validUserData.credentials.email,
    };
    const res = await user.getUser(testData.validUserData.credentials.userName);
    expect(res.status).toEqual(200);
    expect(res.result).toEqual(expectResult);
  });

  test('updateSkills: Invalid Inputs', async () => {
    testEmptyIds('updateSkills');
    expect(allSkills.update).toHaveBeenCalledTimes(0);
  });

  test('updateSkills: Valid Inputs', async () => {
    await Users.findByIdAndUpdate(user1Id, {
      $addToSet: {
        keywords: {
          name: 'oldSkill',
        },
      },
    });
    const keywords = ['newSkill', 'oldSkill'];
    const res = await user.updateSkills(user1Id, keywords);
    expect(res.status).toEqual(200);
    const userRes = await Users.findById(user1Id).lean();
    expect(userRes.keywords[1].name).toEqual(keywords[0]);
    expect(allSkills.update).toHaveBeenCalledTimes(1);
  });

  test('getSkills: Undefined Input', async () => {
    const res = await user.getSkills(undefined);
    expect(res.status).toEqual(400);
  });

  test('getSkills: Invalid Input', async () => {
    const res = await user.getSkills(123);
    expect(res.status).toEqual(400);
  });

  test('getSkills: Valid Inputs', async () => {
    const jobName = 'newSkill';
    await Users.findByIdAndUpdate(user1Id, {
      $addToSet: {
        keywords: {
          name: jobName,
        },
      },
    });
    const res = await user.getSkills(user1Id);
    expect(res.status).toEqual(200);
    expect(res.result).toEqual([jobName]);
  });

  test('handleUserId: Invalid Inputs', async () => {
    testEmptyIds('handleUserId');
  });

  test('handleUserId: Valid Inputs', async () => {
    const res = await user.handleUserId(user1Id.toString(), 'test');
    expect(res).toEqual(new Response(true, '', 200));
    expect(await user.redisClient.getAsync(user1Id.toString())).toEqual('test');
    expect(await user.redisClient.getAsync('test')).toEqual(user1Id.toString());
  });
});
