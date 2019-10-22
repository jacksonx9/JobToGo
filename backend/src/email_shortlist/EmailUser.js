// import nodemailer from 'nodemailer'
import credentials from '../../credentials/google';

class EmailUser {
  constructor(app, user) {
    this.user = user;
  }
  // need to change this to import
  const nodemailer = require('nodemailer');

  async email_shortlist() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { // credentials for our email which is used to send
        user: credentials.email,
        pass: credentials.password,
      }
    });

    // meed to reformat how the message is composed
    const message = "job1 \njob2\n";
    const userEmail = this.user.getemail(); // implement this function

    let info = await transporter.sendMail({
        from: '"info.jobtogo@gmail.com" <info.jobtogo@gmail.com>',
        to: userEmail, // recipient email
        subject: 'Shortlisted jobs',
        text: message
    });

    console.log('Message sent: %s', info.messageId);
  }
}

// email_shortlist().catch(console.error);

export default EmailUser;