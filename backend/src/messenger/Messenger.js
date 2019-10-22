import admin from 'firebase-admin';

import { Users } from '../schema';
import firebaseCredentials from '../../credentials/firebase';

class Messenger {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseCredentials),
      databaseURL: 'https://jobtogo-103fd.firebaseio.com'
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
      console.log('Message sent: ' + messageRes);
      return true;
    } catch(e) {
      console.log(e);
      return false;
    }
  }
};

export default Messenger;