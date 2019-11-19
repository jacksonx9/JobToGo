import axios from 'axios';
import { forEachAsync } from 'foreachasync';
import Logger from 'js-logger';

import { Users } from '../schema';

const generateFriends = async () => {
  const logger = Logger.get('FriendLimit');

  const numFriends = 101;
  const usersData = [];

  await Users.deleteMany({});

  // Create main test user
  usersData.push({
    credentials: {
      userName: 'info.jobtogo@gmail.com',
      email: 'info.jobtogo@gmail.com',
      firebaseToken: 'fYhcgN0hR9M:APA91bHfQ2GXpqVeBxR49CIR60G59LXouN6iu3Qag1wA6XYm4Xp8-bFp2SlpijlWh0jPf13IMsZBqXv9RHgic_82Bm7o6j68okMgMzgj_0l7LDMckLnsB187d2TtPu605Qm9RSMpABEw',
    },
  });

  // Create friends
  for (let i = 0; i < numFriends; i += 1) {
    usersData.push({
      credentials: {
        userName: `${i}`,
        email: `${i}@mail.com`,
        firebaseToken: '',
      },
    });
  }

  try {
    const users = await Users.insertMany(usersData);
    const userIds = users.map(user => user._id.toString());

    // Add friends
    await forEachAsync(userIds.slice(1), async (userId) => {
      await axios.post('http://localhost:8090/friends', {
        userId: userIds[0],
        friendId: userId,
      });
    });

    // Confirm friend requests
    await forEachAsync(userIds.slice(1), async (userId) => {
      await axios.post('http://localhost:8090/friends/confirm', {
        userId,
        friendId: userIds[0],
      });
    });

    logger.debug(`Successfully added ${numFriends} friends!`);
  } catch (e) {
    logger.error(e);
  }
};

export default generateFriends;
