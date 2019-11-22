import scheduler from 'node-schedule';
import Logger from 'js-logger';
import supertest from 'supertest';

import Server from '../src/server';
import * as constants from '../src/constants';
import { Users } from '../src/schema';
import { mockMessenger, mockUser } from './utils/Mock';
import testData from './data/test_data';

jest.mock('firebase-admin');
jest.mock('nodemailer');
jest.mock('google-auth-library');

describe('User', () => {
  let server;
  let constantsCopy;
  let request;

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
    // Mock external APIs
    mockMessenger();
    mockUser();
  });

  afterEach(async () => {
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
});