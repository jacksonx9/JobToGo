import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import Logger from 'js-logger';

import { Users } from '../schema';
import credentials from '../../credentials/google';


class Messenger {
  constructor(app, shortlister) {
    this.logger = Logger.get(this.constructor.name);

    this.shortlister = shortlister;
    this.mailer = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: credentials.email,
        pass: credentials.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    app.post('/messenger/email/', async (req, res) => {
      const result = await this.emailLikedJobs(req.body.userId);
      res.status(result.status).send(result);
    });
  }

  async requestFriend(userId, friendId) {
    let user;
    let friend;

    if (!userId || !friendId) {
      return {
        result: false,
        message: 'Invalid userId or friendId',
        status: 400,
      };
    }

    try {
      user = await Users.findById(userId).orFail();
      friend = await Users.findById(friendId).orFail();
    } catch (e) {
      return {
        result: false,
        message: 'Invalid userId or friendId',
        status: 400,
      };
    }

    const { userName } = user.credentials;
    const message = {
      token: friend.credentials.firebaseToken,
      notification: {
        title: 'Friend request!',
        body: `${userName} wants to add you as a friend.`,
      },
      data: {
        friendName: userName,
        friendId: userId,
      },
    };

    try {
      // Send push notification
      const messageRes = await admin.messaging().send(message);
      this.logger.info(`Message sent: ${messageRes}`);
      return {
        result: true,
        message: '',
        status: 200,
      };
    } catch (e) {
      this.logger.error(e);
      return {
        result: false,
        message: 'Internal Server Error',
        status: 500,
      };
    }
  }

  async emailLikedJobs(userId) {
    let user;
    let message = '';

    if (!userId) {
      return {
        result: false,
        message: 'Invalid userId',
        status: 400,
      };
    }

    try {
      user = await Users.findById(userId, 'credentials.email').orFail();
      const jobsResult = await this.shortlister.getLikedJobsData(userId);

      if (jobsResult.status !== 200) {
        return jobsResult;
      }

      // Construct email message
      jobsResult.result.forEach((posting) => {
        const { title, company, url } = posting;
        message += `${title} @ ${company}
                    ${url}\n\n`;
      });
    } catch (e) {
      return {
        result: false,
        message: 'Invalid userId',
        status: 400,
      };
    }

    try {
      // TODO: Does not verify email is sent correctly
      // Will usually always succeed no matter what
      await this.mailer.sendMail({
        from: `"JobToGo" <${credentials.email}>`,
        to: user.credentials.email,
        subject: 'Shortlisted jobs',
        text: message,
      });
    } catch (e) {
      this.logger.error(e);
      return {
        result: false,
        message: 'Internal Server Error',
        status: 500,
      };
    }

    return {
      result: true,
      message: '',
      status: 200,
    };
  }
}

export default Messenger;
