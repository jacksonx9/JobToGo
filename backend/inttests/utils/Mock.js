import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import axios from 'axios';
import stopword from 'stopword';
import cheerio from 'cheerio';
import indeed from 'indeed-scraper';
import { OAuth2Client } from 'google-auth-library';

import jobConfig from '../../src/job_searcher/config';
import testData from '../data/test_data';

// Custom HTTP error for mocking axios
class HTTPError extends Error {
  constructor(status) {
    super('');
    this.response = {
      status,
      statusText: '',
    };
  }
}

const send = jest.fn();
const sendMail = jest.fn();

const mockMessenger = () => {
  admin.messaging = jest.fn(() => ({
    send,
  }));
  nodemailer.createTransport = jest.fn(() => ({
    sendMail,
  }));
};

const mockResume = () => {
  stopword.removeStopwords = jest.fn(words => words);
  jest.spyOn(axios, 'get').mockImplementation(uri => new Promise((resolve) => {
    const re = new RegExp(/text=(.*?)&token=/);
    const skills = decodeURIComponent(uri.match(re)[1]).split(' ');
    resolve({
      data: {
        annotations: [
          { spot: skills[1] },
          { spot: skills[2] },
          { spot: skills[3] },
        ],
      },
    });
  }));
};

const mockSearcher = () => {
  indeed.query = jest.fn(() => new Promise(resolve => resolve(
    JSON.parse(JSON.stringify(testData.jobs)),
  )));
  axios.get = jest.fn(url => new Promise((resolve, reject) => {
    const jobIdx = testData.jobs.findIndex(job => job.url === url);
    // Arbitrarily choose the first job to fail
    if (jobIdx === 0) {
      reject(new HTTPError(404));
    } else {
      resolve({ data: JSON.parse(JSON.stringify(testData.jobs[jobIdx])) });
    }
  }));
  cheerio.load = jest.fn(job => (selector) => {
    // Mock cheerio for job searching
    if (selector === jobConfig.indeedJobDescTag) {
      return { text: () => job.description };
    }
    if (selector === jobConfig.indeedJobUrlTag) {
      return { attr: () => job.url };
    }
    // Mock cheerio for job removing
    if (job.url === testData.jobs[1].url && selector === jobConfig.indeedExpiredTags[0]) {
      return { length: 1 };
    }
    if (job.url === testData.jobs[2].url && selector === jobConfig.indeedExpiredTags[1]) {
      return { length: 2 };
    }
    return { length: 0 };
  });
};

const mockUser = () => {
  OAuth2Client.prototype.verifyIdToken = jest.fn(() => new Promise((resolve) => {
    resolve({
      payload: {
        email: testData.users[0].credentials.email,
      },
    });
  }));
};

export {
  mockMessenger, mockResume, mockSearcher, mockUser, send, sendMail,
};
