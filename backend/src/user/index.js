import { Users } from '../schema';

class User {
  async createUser(query) {
    await Users.create({
        credentials: query.credentials,            
        userInfo: query.userInfo,
        keywords: query.keywords,
        friends: query.friends,
        jobShortList: query.jobShortList,
        resumePath: query.resumePath
    }).catch(e => console.log(e));
  }

  // check for existing user in database (via email)
  async userExists(userEmail) {
    const user = await Users.find(
        { 'credentials.email': userEmail },
        { _id: 0, __v: 0 }
    ).catch(e => console.log(e));
    return user.length > 0;
  }

  // get User
  async getUser(userEmail) {
    const user = await Users.find(
        { 'credentials.email': userEmail },
        { _id: 0, __v: 0 }
    ).catch(e => console.log(e));

    return user.length > 0 ? user[0] : null;
  }
};

export default User;
