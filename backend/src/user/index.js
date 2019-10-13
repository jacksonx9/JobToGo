import mongoClient from '..';

class User {
  constructor(db) {
    this.usersCollection = db.collection('user');
  }

  async createUser(query) {
    await this.usersCollection.insert({
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
    const user = await this.usersCollection.find(
        { 'credentials.email': userEmail }
    ).project({ _id: 0 }).toArray();

    return user.length > 0;
  }

  // get User
  async getUser(userEmail) {
    const usersCollection = this.db.collection('user');

    const user = await usersCollection.find(
        { 'credentials.email': userEmail }
    ).project({ _id: 0 }).toArray();

    return user.length > 0 ? user[0] : null;
  }
};

export default User;
