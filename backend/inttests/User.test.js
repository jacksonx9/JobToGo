import scheduler from 'node-schedule';
import Logger from 'js-logger';
import supertest from 'supertest';
import io from 'socket.io-client';

import Server from '../src/server';
import * as constants from '../src/constants';
import { Users } from '../src/schema';
import Response from '../src/types';
import { mockMessenger, mockUser } from './utils/Mock';
import testData from './data/test_data';

jest.mock('firebase-admin');
jest.mock('nodemailer');
jest.mock('google-auth-library');

describe('User', () => {
  let server;
  let constantsCopy;
  let request;
  let socket;
  let socket2;

  beforeAll(async () => {
    constantsCopy = JSON.parse(JSON.stringify(constants));
    constants.MONGO_URL = process.env.MONGO_URL;
    constants.LOG_LEVEL = Logger.WARN;
    constants.DEBUG = false;
    constants.MIN_JOBS_IN_DB = 0;

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
    socket = io.connect(`http://localhost:${constants.PORT}`);
    socket2 = io.connect(`http://localhost:${constants.PORT}`);
    // Mock external APIs
    mockMessenger();
    mockUser();
  });

  afterEach(async () => {
    socket.disconnect();
    socket2.disconnect();
    await Users.deleteMany({});
    await jest.clearAllMocks();
    await jest.restoreAllMocks();
  });

  test('Google login', async () => {
    // Check user does not exist
    let response = await request.get(`/users/${testData.users[0].credentials.email}`);
    expect(response.body.result).toBeNull();

    // Login with google first time, should create user
    response = await request.post('/users/googleLogin').send({
      idToken: 'idToken',
      firebaseToken: testData.users[0].credentials.firebaseToken,
    });

    response = await request.post('/users').send({
      userData: {
        credentials: {
          userName: testData.users[0].credentials.userName,
          email: response.body.result.credentials.email,
          idToken: response.body.result.credentials.idToken,
          firebaseToken: response.body.result.credentials.firebaseToken,
        },
      },
    });

    const user = await Users.findOne({});
    expect(response.body.result).toEqual(user._id.toString());

    // Login with google again, should return same userId
    response = await request.post('/users/googleLogin').send({
      idToken: 'idToken',
      firebaseToken: testData.users[0].credentials.firebaseToken,
    });
    expect(response.body.result).toEqual(user._id.toString());

    // User should now be searchable by username (same as email with google)
    response = await request.get(`/users/${testData.users[0].credentials.userName}`);
    expect(response.body.result).toEqual({
      _id: user._id.toString(),
      userName: testData.users[0].credentials.userName,
      email: testData.users[0].credentials.email,
    });
  });

  test('Regular signup/signin', async () => {
    // Check user does not exist
    let response = await request.get(`/users/${testData.users[0].credentials.email}`);
    expect(response.body.result).toBeNull();

    // Sign up, should create user
    response = await request.post('/users/').send({
      userData: testData.users[0],
    });
    const user = await Users.findOne({});
    expect(response.body.result).toEqual(user._id.toString());

    // Login, should return same userId
    response = await request.post('/users/login').send({
      userName: testData.users[0].credentials.userName,
      password: testData.users[0].credentials.password,
    });
    expect(response.body.result).toEqual(user._id.toString());

    // User should now be searchable by username
    response = await request.get(`/users/${testData.users[0].credentials.userName}`);
    expect(response.body.result).toEqual({
      _id: user._id.toString(),
      userName: testData.users[0].credentials.userName,
      email: testData.users[0].credentials.email,
    });
  });

  test('Signup/signin errors', async () => {
    // Google login with no tokens, should fail
    let response = await request.post('/users/googleLogin');
    expect(response.body.result).toBeNull();

    // Signup with no email, username, should fail
    response = await request.post('/users/');
    expect(response.body.result).toBeNull();

    // Login with google first time, should fail until create user called
    response = await request.post('/users/googleLogin').send({
      idToken: 'idToken',
      firebaseToken: testData.users[0].credentials.firebaseToken,
    });
    expect(response.body.result).toEqual({
      credentials: {
        email: testData.users[0].credentials.email,
        idToken: response.body.result.credentials.idToken,
        firebaseToken: response.body.result.credentials.firebaseToken,
      },
    });

    // Create user
    response = await request.post('/users').send({
      userData: {
        credentials: {
          userName: testData.users[0].credentials.userName,
          email: response.body.result.credentials.email,
          idToken: response.body.result.credentials.idToken,
          firebaseToken: response.body.result.credentials.firebaseToken,
        },
      },
    });
    const user = await Users.findOne({});
    expect(response.body.result).toEqual(user._id.toString());

    // Signup with same email, should fail
    response = await request.post('/users/').send({
      userData: testData.users[0],
    });
    expect(response.body.result).toEqual('email');

    // Login with no password, should fail
    response = await request.post('/users/login').send({
      email: testData.users[1].credentials.email,
    });
    expect(response.body.result).toBeNull();

    // Login with non-existent user, should fail
    response = await request.post('/users/login').send({
      email: testData.users[1].credentials.email,
      password: testData.users[1].credentials.password,
    });
    expect(response.body.result).toBeNull();
  });

  test('Update user preferences', async () => {
    // Login with google first time, should create user
    let response = await request.post('/users/googleLogin').send({
      idToken: 'idToken',
      firebaseToken: testData.users[0].credentials.firebaseToken,
    });
    response = await request.post('/users').send({
      userData: {
        credentials: {
          userName: testData.users[0].credentials.userName,
          email: response.body.result.credentials.email,
          idToken: response.body.result.credentials.idToken,
          firebaseToken: response.body.result.credentials.firebaseToken,
        },
      },
    });
    const user = await Users.findOne({});
    expect(response.body.result).toEqual(user._id.toString());

    // Login with google again, should return same userId
    response = await request.post('/users/googleLogin').send({
      idToken: 'idToken',
      firebaseToken: testData.users[0].credentials.firebaseToken,
    });
    expect(response.body.result).toEqual(user._id.toString());

    // Update user info with invalid job type, should fail
    response = await request.put(`/users/userInfo/${user._id.toString()}`).send({
      userInfo: {
        location: testData.users[0].userInfo.location,
        jobType: 'unknown',
      },
    });
    expect(response.body.result).toBe(false);

    // Update user info with no info, should fail
    response = await request.put(`/users/userInfo/${user._id.toString()}`);
    expect(response.body.result).toBe(false);

    // Update user info
    response = await request.put(`/users/userInfo/${user._id.toString()}`).send({
      userInfo: testData.users[0].userInfo,
    });
    expect(response.body.result).toBe(true);
  });

  test('Get username and password', async () => {
    // Login with google first time, should create user
    let response = await request.post('/users/googleLogin').send({
      idToken: 'idToken',
      firebaseToken: testData.users[0].credentials.firebaseToken,
    });
    response = await request.post('/users').send({
      userData: {
        credentials: {
          userName: testData.users[0].credentials.userName,
          email: response.body.result.credentials.email,
          idToken: response.body.result.credentials.idToken,
          firebaseToken: response.body.result.credentials.firebaseToken,
        },
      },
    });
    const user = await Users.findOne({});
    expect(response.body.result).toEqual(user._id.toString());

    // Get user info with invalid user id, should fail
    response = await request.get('/users/userInfo/1}');
    expect(response.body.result).toBe(false);

    // Get user info with valid user id
    response = await request.get(`/users/userInfo/${user._id.toString()}`);
    expect(response.body.result._id.toString()).toEqual(user._id.toString());
  });

  test('Change Username', async () => {
    // Login with google first time, should create user
    let response = await request.post('/users/googleLogin').send({
      idToken: 'idToken',
      firebaseToken: testData.users[0].credentials.firebaseToken,
    });
    response = await request.post('/users').send({
      userData: {
        credentials: {
          userName: testData.users[0].credentials.userName,
          email: response.body.result.credentials.email,
          idToken: response.body.result.credentials.idToken,
          firebaseToken: response.body.result.credentials.firebaseToken,
        },
      },
    });
    const user = await Users.findOne({});
    expect(response.body.result).toEqual(user._id.toString());

    // Change Username with invalid user id, should fail
    response = await request.put('/users/userName/1}');
    expect(response.body.result).toBe(false);

    // Change Username with valid user id
    response = await request.put(`/users/userName/${user._id.toString()}`).send({
      userName: 'changed name',
    });
    expect(response.body.result).toBe(true);
  });

  test('Change Password', async () => {
    // Login with google first time, should create user
    let response = await request.post('/users/googleLogin').send({
      idToken: 'idToken',
      firebaseToken: testData.users[0].credentials.firebaseToken,
    });
    response = await request.post('/users').send({
      userData: {
        credentials: {
          userName: testData.users[0].credentials.userName,
          email: response.body.result.credentials.email,
          idToken: response.body.result.credentials.idToken,
          firebaseToken: response.body.result.credentials.firebaseToken,
        },
      },
    });
    const user = await Users.findOne({});
    expect(response.body.result).toEqual(user._id.toString());

    // Change password with invalid user id, should fail
    response = await request.put('/users/password/1}');
    expect(response.body.result).toBe(false);

    // Change password with valid user id
    response = await request.put(`/users/password/${user._id.toString()}`).send({
      password: 'changed password',
    });
    expect(response.body.result).toBe(true);
  });

  test('Get Keywords', async () => {
    // Login with google first time, should create user
    let response = await request.post('/users/googleLogin').send({
      idToken: 'idToken',
      firebaseToken: testData.users[0].credentials.firebaseToken,
    });
    response = await request.post('/users').send({
      userData: {
        credentials: {
          userName: testData.users[0].credentials.userName,
          email: response.body.result.credentials.email,
          idToken: response.body.result.credentials.idToken,
          firebaseToken: response.body.result.credentials.firebaseToken,
        },
      },
    });
    const user = await Users.findOne({});
    expect(response.body.result).toEqual(user._id.toString());

    // Get Skills with invalid user id, should fail
    response = await request.get('/users/skills/1}');
    expect(response.body.result).toBeNull();

    // Get Skills with valid user id
    response = await request.get(`/users/skills/${user._id.toString()}`);
    expect(response.body.result).toEqual([]);
  });

  test('Add Keywords', async () => {
    // Login with google first time, should create user
    let response = await request.post('/users/googleLogin').send({
      idToken: 'idToken',
      firebaseToken: testData.users[0].credentials.firebaseToken,
    });
    response = await request.post('/users').send({
      userData: {
        credentials: {
          userName: testData.users[0].credentials.userName,
          email: response.body.result.credentials.email,
          idToken: response.body.result.credentials.idToken,
          firebaseToken: response.body.result.credentials.firebaseToken,
        },
      },
    });
    const user = await Users.findOne({});
    expect(response.body.result).toEqual(user._id.toString());

    // Add keyword with invalid user id, should fail
    response = await request.post('/users/keywords').send({
      userId: null,
      keyword: 'new keyword',
    });
    expect(response.body.result).toBe(false);

    // Add keyword with valid user id
    response = await request.post('/users/keywords').send({
      userId: user._id.toString(),
      keyword: 'new keyword',
    });
    expect(response.body.result).toBe(true);

    // Add exisiting keyword with valid user id
    response = await request.post('/users/keywords').send({
      userId: user._id.toString(),
      keyword: 'new keyword',
    });
    expect(response.body.result).toBe(true);
  });

  test('Delete Keywords', async () => {
    // Login with google first time, should create user
    let response = await request.post('/users/googleLogin').send({
      idToken: 'idToken',
      firebaseToken: testData.users[0].credentials.firebaseToken,
    });
    response = await request.post('/users').send({
      userData: {
        credentials: {
          userName: testData.users[0].credentials.userName,
          email: response.body.result.credentials.email,
          idToken: response.body.result.credentials.idToken,
          firebaseToken: response.body.result.credentials.firebaseToken,
        },
      },
    });
    const user = await Users.findOne({});
    expect(response.body.result).toEqual(user._id.toString());

    // Add keyword with invalid user id, should fail
    response = await request.delete('/users/keywords').send({
      userId: null,
      keyword: 'old keyword',
    });
    expect(response.body.result).toBe(false);

    // Insert keyword with valid user id
    response = await request.post('/users/keywords').send({
      userId: user._id.toString(),
      keyword: 'new keyword',
    });
    expect(response.body.result).toBe(true);

    // Delete non existant keyword with valid user id
    response = await request.delete('/users/keywords').send({
      userId: user._id.toString(),
      keyword: 'non existant keyword',
    });
    expect(response.body.result).toBe(true);

    // Delete exisiting keyword with valid user id
    response = await request.delete('/users/keywords').send({
      userId: user._id.toString(),
      keyword: 'new keyword',
    });
    expect(response.body.result).toBe(true);
  });

  test('Search users', async (done) => {
    // Create user1
    let response = await request.post('/users/').send({
      userData: testData.users[0],
    });
    const user1 = await Users.findOne({});
    const user1Id = user1._id.toString();
    expect(response.body.result).toEqual(user1Id);

    // Create user2
    response = await request.post('/users/').send({
      userData: testData.users[1],
    });
    const user2 = await Users.findOne({
      'credentials.userName': testData.users[1].credentials.userName,
    });
    const user2Id = user2._id.toString();
    expect(response.body.result).toEqual(user2Id);

    // Check userId is received
    socket.on('userId', (userIdData) => {
      expect(userIdData).toEqual(new Response(true, '', 200));

      // Search non existent user
      socket.on('users', (nonExistentUserData) => {
        expect(nonExistentUserData).toEqual(new Response([], '', 200));
        socket.off('users');

        // Search for user2
        socket.on('users', (user2Data) => {
          expect(user2Data).toEqual(new Response([{
            _id: user2Id,
            userName: testData.users[1].credentials.userName,
            isFriend: false,
          }], '', 200));
          done();
        });
        socket.emit('users-search', testData.users[1].credentials.userName);
      });
      socket.emit('users-search', 'invalidUser');
    });
    socket.emit('userId', user1Id);
  });

  test('Search users errors', async (done) => {
    // Create user1
    const response = await request.post('/users/').send({
      userData: testData.users[0],
    });
    const user1 = await Users.findOne({});
    const user1Id = user1._id.toString();
    expect(response.body.result).toEqual(user1Id);

    // Invalid userId
    socket.on('userId', (invalidUserIdData) => {
      expect(invalidUserIdData).toEqual(new Response(false, 'Invalid userId', 400));
      socket.off('userId');

      // Check userId is received
      socket.on('userId', (userIdData) => {
        expect(userIdData).toEqual(new Response(true, '', 200));

        // Search for self
        socket.on('users', (data) => {
          expect(data).toEqual(new Response([], '', 200));
          done();
        });
        socket.emit('users-search', testData.users[0].credentials.userName);
      });
      socket.emit('userId', user1Id);
    });
    socket.emit('userId', 'test');

    // Unregistered user
    socket2.on('users', (data) => {
      expect(data).toEqual(new Response(null, 'Invalid userId', 400));
      done();
    });
    socket2.emit('users-search', testData.users[0].credentials.userName);
  });
});
