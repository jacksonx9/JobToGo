import mongoose, { Error } from 'mongoose';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { Express } from 'jest-express/lib/express';

import Messenger from '..';
import JobShortlister from '../../job_shortlister';
import Response from '../../types';
import { Users, Jobs } from '../../schema';
import credentials from '../../../credentials/google';
import testData from './test_data';

jest.mock('firebase-admin');
jest.mock('nodemailer');
jest.mock('../../job_shortlister');

describe('Messenger', () => {
  let messenger;
  let shortlister;
  let user1Id;
  let user2Id;
  let invalidUserId;
  let job1Id;
  let send;
  let sendMail;

  beforeAll(async () => {
    // Connect to the in-memory db
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    const app = new Express();
    shortlister = new JobShortlister(app);

    // Mock functions required on creation
    send = jest.fn();
    sendMail = jest.fn();
    nodemailer.createTransport = jest.fn(() => ({
      sendMail,
    }));

    messenger = new Messenger(app, shortlister);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // We create all users before each test case instead of test suite so that
    // the tests can be run in any order
    const user1 = await Users.create(testData.users[0]);
    const user2 = await Users.create(testData.users[1]);
    const invalidUser = await Users.create(testData.users[2]);
    const job1 = await Jobs.create(testData.jobs[0]);
    user1Id = user1._id;
    user2Id = user2._id;
    invalidUserId = invalidUser._id;
    job1Id = job1._id;
    // Delete the user to invalidate the id
    await Users.findByIdAndDelete(invalidUserId);

    // Mock external functions
    shortlister.getLikedJobs = jest.fn(() => new Response(testData.jobs, '', 200));
    nodemailer.createTransport = jest.fn(() => ({
      sendMail,
    }));
    admin.messaging = jest.fn(() => ({
      send,
    }));
  });

  afterEach(async () => {
    // Delete all users after each test
    await Users.deleteMany({});
    await Jobs.deleteMany({});
    // Make sure to clear all mock state (e.g. number of times called)
    jest.restoreAllMocks();
  });

  test('requestFriend: Empty ids', async () => {
    const response = new Response(false, 'Invalid userId or friendId', 400);
    expect(await messenger.requestFriend(undefined, undefined)).toEqual(response);
    expect(await messenger.requestFriend(user1Id, undefined)).toEqual(response);
    expect(await messenger.requestFriend(undefined, user2Id)).toEqual(response);
  });

  test('requestFriend: Invalid users', async () => {
    const response = new Response(false, 'Invalid userId or friendId', 400);
    expect(await messenger.requestFriend(invalidUserId, user2Id)).toEqual(response);
    expect(await messenger.requestFriend(user1Id, invalidUserId)).toEqual(response);
    expect(await messenger.requestFriend(123, user2Id)).toEqual(response);
    expect(await messenger.requestFriend('test', user2Id)).toEqual(response);
    expect(await messenger.requestFriend({}, user2Id)).toEqual(response);
  });

  test('requestFriend: Success', async () => {
    const response = new Response(true, '', 200);
    expect(await messenger.requestFriend(user1Id, user2Id)).toEqual(response);
    expect(admin.messaging().send).toHaveBeenCalledTimes(1);
    expect(admin.messaging().send).toHaveBeenCalledWith({
      token: testData.users[1].credentials.firebaseToken,
      notification: {
        title: 'Friend request!',
        body: `${testData.users[0].credentials.userName} wants to add you as a friend.`,
      },
    });
  });

  test('requestFriend: Firebase messaging error', async () => {
    // Make firebase messaging throw an error
    admin.messaging = jest.fn(() => ({
      send: jest.fn(() => { throw new Error(); }),
    }));
    const response = new Response(false, 'Internal server error', 500);
    expect(await messenger.requestFriend(user1Id, user2Id)).toEqual(response);
  });

  test('emailLikedJobs: Empty id', async () => {
    const response = new Response(false, 'Invalid userId', 400);
    expect(await messenger.emailLikedJobs(undefined)).toEqual(response);
  });

  test('emailLikedJobs: Invalid user', async () => {
    const response = new Response(false, 'Invalid userId', 400);
    expect(await messenger.emailLikedJobs(invalidUserId)).toEqual(response);
  });

  test('emailLikedJobs: No jobs', async () => {
    shortlister.getLikedJobs = jest.fn(() => new Response([], '', 200));
    const response = new Response(false, 'No jobs to email', 400);
    expect(await messenger.emailLikedJobs(user1Id)).toEqual(response);
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(0);
  });

  test('emailLikedJobs: Success', async () => {
    const response = new Response(true, '', 200);
    expect(await messenger.emailLikedJobs(user1Id)).toEqual(response);
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(1);

    let emailText = '';
    testData.jobs.forEach((posting) => {
      const { title, company, url } = posting;
      emailText += `${title} @ ${company}\n${url}\n\n`;
    });
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
      from: `"JobToGo" <${credentials.email}>`,
      to: testData.users[0].credentials.email,
      subject: 'Shortlisted jobs',
      text: emailText,
    });
  });

  test('sendFriendJob: Empty ids', async () => {
    const response = new Response(false, 'Invalid userId or friendId', 400);
    expect(await messenger.sendFriendJob(undefined, undefined, undefined)).toEqual(response);
    expect(await messenger.sendFriendJob(user1Id, undefined, undefined)).toEqual(response);
    expect(await messenger.sendFriendJob(undefined, user2Id, undefined)).toEqual(response);
  });

  test('sendFriendJob: Invalid users', async () => {
    const response = new Response(false, 'Invalid userId or friendId', 400);
    expect(await messenger.sendFriendJob(invalidUserId, user2Id, job1Id)).toEqual(response);
    expect(await messenger.sendFriendJob(user1Id, invalidUserId, user1Id)).toEqual(response);
    expect(await messenger.sendFriendJob(123, user2Id, job1Id)).toEqual(response);
    expect(await messenger.sendFriendJob('test', user2Id, job1Id)).toEqual(response);
    expect(await messenger.sendFriendJob({}, user2Id, user1Id)).toEqual(response);
  });

  test('sendFriendJob: Success', async () => {
    const response = new Response(true, '', 200);
    expect(await messenger.sendFriendJob(user1Id, user2Id,job1Id)).toEqual(response);
    expect(admin.messaging().send).toHaveBeenCalledTimes(2);
    const name = testData.users[0].credentials.userName;
    const title = testData.jobs[0].title;
    const company = testData.jobs[0].company;
    expect(admin.messaging().send).toHaveBeenCalledWith({
      token: testData.users[1].credentials.firebaseToken,
      notification: {
        title: 'Friend sent you a job!',
        body: `${name} thinks you would be a good fit for ${title} at ${company}!`,
      },
    });
  });

  test('sendFriendJob: Firebase messaging error', async () => {
    // Make firebase messaging throw an error
    admin.messaging = jest.fn(() => ({
      send: jest.fn(() => { throw new Error(); }),
    }));
    const response = new Response(false, 'Internal server error', 500);
    expect(await messenger.sendFriendJob(user1Id, user2Id, job1Id)).toEqual(response);
  });
});
