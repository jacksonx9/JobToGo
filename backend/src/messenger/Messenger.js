import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import Logger from 'js-logger';

import Response from '../types';
import { Users, Jobs } from '../schema';
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

    app.post('/messenger/email', async (req, res) => {
      const response = await this.emailLikedJobs(req.body.userId);
      res.status(response.status).send(response);
    });
  }

  async requestFriend(userId, friendId) {
    let user;
    let friend;

    if (!userId || !friendId) {
      return new Response(false, 'Invalid userId or friendId', 400);
    }

    try {
      user = await Users.findById(userId).orFail();
      friend = await Users.findById(friendId).orFail();
    } catch (e) {
      return new Response(false, 'Invalid userId or friendId', 400);
    }

    const { userName } = user.credentials;
    const message = {
      token: friend.credentials.firebaseToken,
      notification: {
        title: 'Friend request!',
        body: `${userName} wants to add you as a friend.`,
      },
    };

    try {
      // Send push notification
      const messageRes = await admin.messaging().send(message);
      this.logger.info(`Message sent: ${messageRes}`);
      return new Response(true, '', 200);
    } catch (e) {
      this.logger.error(e);
      return new Response(false, 'Internal server error', 500);
    }
  }

  async sendFriendJob(userId, friendId, jobId) {
    let friend;
    let user;
    let job;

    if (!userId || !friendId || !jobId) {
      return new Response(false, 'Invalid userId or friendId', 400);
    }

    try {
      user = await Users.findById(userId).orFail();
      friend = await Users.findById(friendId).orFail();
      job = await Jobs.findById(jobId).orFail();
    } catch (e) {
      return new Response(false, 'Invalid userId or friendId', 400);
    }

    // Users don't need access to jobs' keywords
    delete job.keywords;

    const { userName } = user.credentials;
    const { jobName } = job.title;
    const { jobCompany } = job.company;
    const message = {
      token: friend.credentials.firebaseToken,
      notification: {
        title: 'Friend sent you a job!',
        body: `${userName} thinks you would be a good fit for ${jobName} at ${jobCompany}!`,
      },
    };

    try {
      // Send push notification
      const messageRes = await admin.messaging().send(message);
      this.logger.info(`Message sent: ${messageRes}`);
      return new Response(true, '', 200);
    } catch (e) {
      this.logger.error(e);
      return new Response(false, 'Internal server error', 500);
    }
  }

  async emailLikedJobs(userId) {
    let user;
    let emailText = '';

    if (!userId) {
      return new Response(false, 'Invalid userId', 400);
    }

    try {
      user = await Users.findById(userId, 'credentials.email').orFail();
      const jobsResult = await this.shortlister.getLikedJobs(userId);

      if (jobsResult.status !== 200) {
        return jobsResult;
      }

      // Construct email message
      jobsResult.result.forEach((posting) => {
        const { title, company, url } = posting;
        emailText += `${title} @ ${company}
                    ${url}\n\n`;
      });
    } catch (e) {
      return new Response(false, 'Invalid userId', 400);
    }

    try {
      // TODO: Does not verify email is sent correctly
      // Will usually always succeed no matter what
      await this.mailer.sendMail({
        from: `"JobToGo" <${credentials.email}>`,
        to: user.credentials.email,
        subject: 'Shortlisted jobs',
        text: emailText,
      });
    } catch (e) {
      this.logger.error(e);
      return new Response(false, 'Internal server error', 500);
    }

    return new Response(true, '', 200);
  }
}

export default Messenger;
