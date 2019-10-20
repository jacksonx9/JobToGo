import { Users } from '../schema';

class User {
  constructor(app) {
    // param: user that contains the user's id and a json object userInfo
    app.get('/users/update/:user', async (req, res) => {
      this.updateUserInfo(req.params.user.id, req.params.user.info);
    });

    // param: userEmailPassword that contain the user's email and password
    // return: userId if succeeds and -1 otherwise
    app.get('/users/update/:userEmailPassword', async (req, res) => {
      res.send(this.login(req.params.userEmailPassword.userEmail,
                          req.params.userEmailPassword.userPassword));
    });
  }

  // return: userId if succeeds and -1 otherwise
  async createUser(query) {
    const { credentials, userInfo, keywords, friends, jobShortList, resumePath } = query;

    const user = await Users.create({
        credentials, userInfo, keywords, friends, jobShortList, resumePath
    }).catch(e => console.log(e));

    return user == undefined ? -1 : user.id;
  }

  // Returns userId if succeeds, -1 otherwise
  async login(userEmail, userPassword) {
    const user = await Users.find(
      { 'credentials.email': userEmail },
      { __v: 0 }
    ).catch(e => console.log(e));

    return !user.length && user.userPassword == userPassword ? user.id : -1;
  }

  //.lean() raw js object

  // Returns true if succeeded and false otherwise
  async updateUserInfo(userId, info) {
    const res = await Users.replaceOne({ _id: userId }, info).catch(e => console.log(e));

    return res.nModified == 1 ? true : false;
  }

  // return bool
  async addFriend(userID, friendID) {

  }

  // return bool
  async removeFriend(userID, friendID) {

  }

  // return bool
  async confirmFriend(userID, friendID) {

  }

  // Array[strings]
  async getSkills(userID) {

  }

  // Array[Users]
  async getFriends(userID) {

  }

  // check for existing user in database (via email)
  async userExists(userEmail) {
    const user = await Users.find(
        { 'credentials.email': userEmail },
        { _id: 0, __v: 0 }
    ).catch(e => console.log(e));
    return !user.length;
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
