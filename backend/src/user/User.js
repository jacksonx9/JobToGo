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
    const user = await Users.create(query).catch(e => console.log(e));
    return typeof user === 'undefined' ? -1 : user.id;
  }

  // check for existing user in database (via email)
  async _userExists(userEmail) {
    const user = await Users.find(
        { 'credentials.email': userEmail },
        { _id: 0 }
    ).catch(e => console.log(e));
    return !user.length;
  }

  // Returns userId if succeeds, -1 otherwise
  async login(userEmail, userPassword) {
    const userIdObj = await Users.findOne(
      { 'credentials.email': userEmail, 'credentials.password': userPassword },
      '_id').catch(e => console.log(e));

    return userIdObj == null ? -1 : userIdObj._id;
  }

  // Can pass in only fields that need to be updated
  // Returns true if success and false otherwise
  async updateUserInfo(userId, info) {
    const res = await Users.updateOne({ _id: userId }, info)
                                      .catch(e => console.log(e));

    return res.nModified == 1 ? true : false;
  }

  // Returns true if success and false otherwise
  async addFriend(userID, friendID) {
    const res = Users.updateOne(
      { _id: userID },
      { $push: { friends: friendID }}).catch(e => console.log(e));

    return res.nModified == 1 ? true : false;
  }

  // Returns true if success and false otherwise
  async removeFriend(userID, friendID) {

  }

  // Returns true if success and false otherwise
  async confirmFriend(userID, friendID) {

  }

  // Array[Users]
  async getFriends(userID) {

  }

  // Array[strings]
  async getSkills(userID) {

  }

  // get UserId
  async _getUser(userEmail) {
    const user = await Users.find(
        { 'credentials.email': userEmail }, '_id'
    ).catch(e => console.log(e));

    return user.length > 0 ? user[0] : null;
  }
};

export default User;
