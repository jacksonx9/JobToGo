import mongoose from 'mongoose';
import stopword from 'stopword';
import axios from 'axios';
import { Express } from 'jest-express/lib/express';
import vision from '@google-cloud/vision';
import fs from 'fs';

import ResumeParser, { MAX_REQUEST_URI_LENGTH } from '../ResumeParser';
import User from '../../user';
import { Users } from '../../schema';
import Response from '../../types';
import testData from './test_data';

jest.mock('../../user');
jest.mock('stopword');
jest.mock('axios');
jest.mock('@google-cloud/vision');

vision.ImageAnnotatorClient.prototype.textDetection = jest.fn(request => new Promise((resolve) => {
  const validBuffer = fs.readFileSync(`${__dirname}/test_files/resume.png`);
  if (request !== null && request.image !== null && validBuffer.equals(request.image)) {
    resolve([
      {
        fullTextAnnotation: {
          text: 'valid image text',
        },
      },
    ]);
  } else {
    throw Error('invalid idToken');
  }
}));

class HTTPError extends Error {
  constructor(code, status) {
    super('');
    this.code = code;
    this.response = {
      status,
      statusText: '',
    };
  }
}

describe('Resume Parser', () => {
  let resumeParser;
  let user;
  let userId;
  let invalidUserId;

  beforeAll(async () => {
    // Connect to the in-memory db
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    const app = new Express();
    user = new User(app);
    resumeParser = new ResumeParser(app, user);
  });

  beforeEach(async () => {
    // We create all users before each test case instead of test suite so that
    // the tests can be run in any order
    const user1 = await Users.create(testData.users[0]);
    const invalidUser = await Users.create(testData.users[1]);
    userId = user1._id;
    invalidUserId = invalidUser._id;
    // Delete the user to invalidate the id
    await Users.findByIdAndDelete(invalidUserId);

    // Mock external functions
    stopword.removeStopwords = jest.fn(words => words);
    jest.spyOn(axios, 'get').mockImplementation(() => new Promise((resolve) => {
      resolve({
        data: {
          annotations: [
            { spot: testData.skills[0] },
            { spot: testData.skills[1] },
            { spot: testData.skills[0] },
            { spot: testData.skills[2] },
          ],
        },
      });
    }));
    user.updateSkills = jest.fn(() => new Response(true, '', 200));
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  afterEach(async () => {
    // Delete all users after each test
    await Users.deleteMany({});
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('parsePdf: Invalid PDF', async () => {
    // Disable console log in pdfparse
    jest.spyOn(console, 'log').mockImplementation();
    const invalidPdf = fs.readFileSync(`${__dirname}/test_files/invalid.pdf`);
    const response = new Response(false, 'Invalid PDF', 400);

    expect(await resumeParser.parsePdf(123)).toEqual(response);
    expect(await resumeParser.parsePdf('test')).toEqual(response);
    expect(await resumeParser.parsePdf({})).toEqual(response);
    expect(await resumeParser.parsePdf(invalidPdf)).toEqual(response);
  });

  test('parsePdf: Empty PDF', async () => {
    const emptyPdf = fs.readFileSync(`${__dirname}/test_files/empty.pdf`);
    const response = new Response('', '', 200);

    expect(await resumeParser.parsePdf(emptyPdf)).toEqual(response);
    expect(stopword.removeStopwords).toHaveBeenCalledTimes(1);
    expect(stopword.removeStopwords).toHaveBeenCalledWith(['']);
  });

  test('parseImage: Empty Image', async () => {
    // Disable console log in parseImage
    jest.spyOn(console, 'log').mockImplementation();
    const emptyImage = fs.readFileSync(`${__dirname}/test_files/empty.png`);
    const response = new Response(false, 'Invalid image', 400);

    expect(await resumeParser.parseImage(emptyImage)).toEqual(response);
    expect(stopword.removeStopwords).toHaveBeenCalledTimes(0);
  });

  test('parseImage: Invalid Image', async () => {
    // Disable console log in parseImage
    jest.spyOn(console, 'log').mockImplementation();
    const response = new Response(false, 'Invalid image', 400);

    expect(await resumeParser.parseImage(123)).toEqual(response);
    expect(await resumeParser.parseImage('test')).toEqual(response);
    expect(await resumeParser.parseImage({})).toEqual(response);
  });

  test('parseImage: Success', async () => {
    const resume = fs.readFileSync(`${__dirname}/test_files/resume.png`);
    const response = new Response(testData.parsedPhotoResumeText, '', 200);

    expect(await resumeParser.parseImage(resume)).toEqual(response);
    expect(stopword.removeStopwords).toHaveBeenCalledTimes(1);
    expect(stopword.removeStopwords).toHaveBeenCalledWith(testData.parsedPhotoResumeText.split(' '));
  });

  test('parsePdf: Success', async () => {
    const resume = fs.readFileSync(`${__dirname}/test_files/resume.pdf`);
    const response = new Response(testData.parsedResumeText, '', 200);

    expect(await resumeParser.parsePdf(resume)).toEqual(response);
    expect(stopword.removeStopwords).toHaveBeenCalledTimes(1);
    expect(stopword.removeStopwords).toHaveBeenCalledWith(testData.parsedResumeText.split(' '));
  });

  test('extract: Success', async () => {
    const response = new Response([testData.skills[0], testData.skills[1]], '', 200);
    expect(await resumeParser.extract(testData.parsedResumeText)).toEqual(response);
  });

  test('extract: Text length above API limit', async () => {
    const longText = 'text '.repeat(10000);
    const response = new Response([testData.skills[0], testData.skills[1]], '', 200);
    expect(await resumeParser.extract(longText)).toEqual(response);
    expect(axios.get.mock.calls[0][0].length).toBeLessThanOrEqual(MAX_REQUEST_URI_LENGTH);
  });

  test('extract: Timeout', async () => {
    jest.spyOn(axios, 'get').mockImplementation(() => new Promise((_, reject) => {
      reject(new HTTPError('ECONNABORTED', 408));
    }));
    const response = new Response(null, 'Internal server error', 500);
    expect(await resumeParser.extract(testData.parsedResumeText)).toEqual(response);
  });

  test('extract: Unknown error', async () => {
    jest.spyOn(axios, 'get').mockImplementation(() => new Promise((_, reject) => {
      reject(new HTTPError('', 500));
    }));
    const response = new Response(null, 'Internal server error', 500);
    expect(await resumeParser.extract(testData.parsedResumeText)).toEqual(response);
  });

  test('handleResume: Empty inputs', async () => {
    const resume = fs.readFileSync(`${__dirname}/test_files/resume.pdf`);
    const response = new Response(false, 'Invalid userId or resume', 400);
    expect(await resumeParser.handleResume(undefined, undefined)).toEqual(response);
    expect(await resumeParser.handleResume(userId, undefined)).toEqual(response);
    expect(await resumeParser.handleResume(undefined, {
      originalname: 'empty.pdf',
      buffer: resume,
      mimetype: 'application/pdf',
    })).toEqual(response);
    expect(user.updateSkills).toHaveBeenCalledTimes(0);
  });

  test('handleResume: Invalid user', async () => {
    const resume = fs.readFileSync(`${__dirname}/test_files/resume.pdf`);
    const response = new Response(false, 'Invalid userId or resume', 400);
    expect(await resumeParser.handleResume(invalidUserId, {
      originalname: 'empty.pdf',
      buffer: resume,
      mimetype: 'application/pdf',
    })).toEqual(response);
    expect(user.updateSkills).toHaveBeenCalledTimes(0);
  });

  test('handleResume: Invalid PDF', async () => {
    // Disable console log in pdfparse
    jest.spyOn(console, 'log').mockImplementation();

    const invalidPdf = fs.readFileSync(`${__dirname}/test_files/invalid.pdf`);
    const invalidPdfRes = new Response(false, 'Invalid PDF', 400);
    const invalidPdfOrImageRes = new Response(false, 'Invalid PDF or image', 400);

    expect(await resumeParser.handleResume(userId, {
      originalname: 'text.txt',
      buffer: 'text',
      mimetype: 'text/plain',
    })).toEqual(invalidPdfOrImageRes);
    expect(await resumeParser.handleResume(userId, {
      originalname: 'invalid.pdf',
      buffer: invalidPdf,
      mimetype: 'application/pdf',
    })).toEqual(invalidPdfRes);
    expect(user.updateSkills).toHaveBeenCalledTimes(0);
  });

  test('handleResume: Timeout', async () => {
    jest.spyOn(axios, 'get').mockImplementation(() => new Promise((_, reject) => {
      reject(new HTTPError('ECONNABORTED', 408));
    }));
    const resume = fs.readFileSync(`${__dirname}/test_files/resume.pdf`);
    const response = new Response(null, 'Internal server error', 500);
    expect(await resumeParser.handleResume(userId, {
      originalname: 'resume.pdf',
      buffer: resume,
      mimetype: 'application/pdf',
    })).toEqual(response);
    expect(user.updateSkills).toHaveBeenCalledTimes(0);
  });

  test('handleResume: Success', async () => {
    const resume = fs.readFileSync(`${__dirname}/test_files/resume.pdf`);
    const response = new Response(true, '', 200);
    expect(await resumeParser.handleResume(userId, {
      originalname: 'resume.pdf',
      buffer: resume,
      mimetype: 'application/pdf',
    })).toEqual(response);
    expect(user.updateSkills).toHaveBeenCalledTimes(1);
    expect(user.updateSkills)
      .toHaveBeenCalledWith(userId, [testData.skills[0], testData.skills[1]]);
  });
});
