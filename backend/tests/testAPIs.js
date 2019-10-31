
import JobSearcher from '../src/job_searcher';
import JobAnalyzer from '../src/job_analyzer';
import User from '../src/user';
import { Users } from '../src/schema';

class TestAPIs {
  constructor(app) {
    const jobSearcher = new JobSearcher(app);
    const jobAnalyzer = new JobAnalyzer(app);
    const user = new User(app);
    const testEmail = 'uniqueUserName2';
    const testPassword = 'word';
    const testUser = {
      credentials: {
        userName: 'name',
        email: testEmail,
        password: testPassword,
      },
      userInfo: {
        location: 'Vancouver, BC',
        jobType: 'full-time',
        skillsExperiences: ['javascript', 'C', 'java'],
      },
      keywords: [{
        score: 1,
        jobCount: 2,
        timeStamp: Date.now(),
      },
      {
        score: 0,
        jobCount: 21,
        timeStamp: Date.now(),
      }],
      keywordStatistic: {
        score: 10,
        jobCount: 30,
        timeStamp: Date.now(),
      },
      friends: [],
      pendingFriends: [],
      jobShortList: [],
      resumePath: './resume.pdf',
    };

    app.get('/test/users/updateUserInfo', async (req, res) => {
      const userId = await user.createUser(testUser);
      const updatedName = 'updateName';
      const userUpdateInfo = {
        credentials: {
          userName: updatedName,
          email: testEmail,
          password: 'word'
        },
        // userInfo: {
        //   location: 'Vancouver, BC',
        //   jobType: 'full-time',
        //   skillsExperiences: [ 'javascript', 'C', 'java' ]
        // },
        keywords: [{
          score: 1,
          jobCount: 2,
          timeStamp: Date.now(),
        },
        {
          score: 0,
          jobCount: 21,
          timeStamp: Date.now(),
        }],
        keywordStatistic: {
          score: 10,
          jobCount: 30,
          timeStamp: Date.now(),
        },
        jobShortList: [],
        resumePath: './resume.pdf',
      };

      if (await user.updateUserInfo(userId, userUpdateInfo)) {
        const updatedUser = await Users.findById(userId);
        if (updatedUser.credentials.userName == updatedName &&
            updatedUser.userInfo.location == 'Vancouver, BC') {
          res.send('succeed');
        } else {
          res.send('failed');
        }
      } else {
        res.send('userId is not valid; check createUser');
      }
    });

    app.get('/test/users/testlogin', async (req, res) => {
      const testuserId = await user._getUser(testEmail);
      const userId = await user.login(testEmail, testPassword);

      if (userId.equals(testuserId._id))
        console.log('Passed: valid login test...\n');
      else
        console.log('Failed: valid login test...\n');

      if (await user.login("invalid email", testPassword) == -1)
        console.log('Passed: invalid email test...\n');
      else
        console.log('Failed: invalid email test...\n');

      if (await user.login(testEmail, "invalid password") == -1)
        console.log('Passed: invalid password test...\n');
      else
        console.log('Failed: invalid password test...\n');
    });

    app.get('/test/users/testgetUser', async (req, res) => {
      res.json(await user.getUser('mail'));
    });

    app.post('/test/users/testCreateUser', async (req, res) => {
      const c = await user.createUser(testUser);

      res.send('Done');
    });

    app.get('/test/users/testCreateUserAndUserExists', async (req, res) => {
      const userEmail = 'uniqueUserName';

      await user.createUser(testUser);

      if (await user._userExists(userEmail)) {
        res.send('user exists test passed');
      } else {
        res.send('user exists test failed');
      }
    });

    // purely for testing adding to database
    app.get('/test/jobs/testAddJobs', async (req, res) => {
      await jobSearcher.updateJobs('javascript');
      await jobSearcher.updateJobs('C');

      res.send('Done');
    });

    // //purely for testing query database; querying for javascript and C jobs
    app.get('/test/jobs/testGetDBJobs', async (req, res) => {
      res.json(await jobAnalyzer.getDBJobs(['javascript', 'C']));
    });
  }
}

export default TestAPIs;