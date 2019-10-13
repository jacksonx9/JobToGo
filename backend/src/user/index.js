import mongoClient from '..';

class User {
  constructor(database) {
    this.db = database;
  }

  async createUser(query) {
    const uersCollection = this.db.collection('user');

    await uersCollection.insert({
        credentials: query.credentials,            
        userInfo: query.userInfo,
        keywords: query.keywords,
        friends: query.friends,
        jobShortList: query.jobShortList,
        resumePath: query.resumePath
    }).catch(e => console.log(e));
  }

  // check for existing user in database (via email)

  // get User
};

export default User;
