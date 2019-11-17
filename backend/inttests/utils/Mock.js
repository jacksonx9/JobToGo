import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

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

export { mockMessenger, send, sendMail };
