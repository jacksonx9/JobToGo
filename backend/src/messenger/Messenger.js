import admin from 'firebase-admin';
import nodemailer from 'nodemailer'
import Logger from 'js-logger';

import { Users } from '../schema';
import firebaseCredentials from '../../credentials/firebase';
import credentials from '../../credentials/google';

const DATABASE_URL = 'https://jobtogo-103fd.firebaseio.com';

class Messenger {
  constructor(app, shortlister) {
    this.logger =  Logger.get(this.constructor.name);

    this.shortlister = shortlister;

    admin.initializeApp({
      credential: admin.credential.cert(firebaseCredentials),
      databaseURL: DATABASE_URL,
    });

    app.post('/jobs/emailUser/', async (req, res) => {
      try {
        const userId = req.body.userId;
        const result = await this.emailShortlist(userId);
        res.status(result.status).send(result.success);
      } catch(e) {
        this.logger.error(e);;
        res.status(500).send(null);
      }
    });
  }

  async requestFriend(userId, friendId) {
    try {
      const user = await Users.findById(userId);
      const userName = user.credentials.userName;
      const friend = await Users.findById(friendId);

      const message = {
        token: friend.credentials.firebaseToken,
        notification: {
          title: 'Friend request!',
          body: `${userName} wants to add you as a friend.`
        },
        data: {
          friendName: userName,
          friendId: userId,
        },
      };
      const messageRes = await admin.messaging().send(message);
      this.logger.info('Message sent: ' + messageRes);
      return true;
    } catch(e) {
      this.logger.error(e);
      return false;
    }
  }

  async emailShortlist(userId) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: credentials.email,
        pass: credentials.password,
      }
    });

    const docs = await Users.find({ _id: userId }, 'credentials.email');
    const userEmail = docs[0].credentials.email;
    const userShortlist = await this.shortlister.getLikedJobsData(userId);

    let message = "";
    for (const posting of userShortlist) {
      const { title, company, url } = posting;
      message +=
      `${title} @ ${company}
      ${url}\n\n`;
    }

    await transporter.sendMail({
        from: `"${credentials.email}" <${credentials.email}>`,
        to: userEmail,
        subject: 'Shortlisted jobs',
        text: message
    }).catch(e => {
      this.logger.error(e);
      return {status: 400, success: false};
    });
    return {
      status: 200,
      success: true
    };
  }
};

export default Messenger;