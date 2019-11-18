import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import axios from 'axios';
import stopword from 'stopword';

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

export {
  mockMessenger, mockResume, send, sendMail,
};
