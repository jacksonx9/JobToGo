
import JobSearcher from '../src/job_searcher';
import JobAnalyzer from '../src/job_analyzer';
import User from '../src/user';
import { Users } from '../src/schema';

class TestAPIs {
  constructor(app) {
    const jobSearcher = new JobSearcher(app);
    const jobAnalyzer = new JobAnalyzer();
    const user = new User(app);
    const testEmail = 'uniqueUserName';
    const testUser = {
      credentials: {
        userName: 'name',
        email: testEmail,
        password: 'word'
      },
      userInfo: {
        location: 'Vancouver, BC',
        jobType: 'full-time',
        skillsExperiences: [ 'javascript', 'C', 'java' ]
      },
      keywords: [{
        score: 1,
        jobCount: 2,
        timeStamp: Date.now()
      },
      {
        score: 0,
        jobCount: 21,
        timeStamp: Date.now()
      }],
      keywordStatistic: {
          score: 10,
          jobCount: 30,
          timeStamp: Date.now()
      },
      friends: [],
      jobShortList: [],
      resumePath: './resume.pdf'
    };

    app.get('/test/users/testlogin', async (req, res) => {
      const userId = await user.createUser(testUser);
      console.log(userId);
      const updatedName = 'updateName';
      const userUpdateInfo = {
        credentials: {
          userName: updatedName,
          email: testEmail,
          password: 'word'
        },
        userInfo: {
          location: 'Vancouver, BC',
          jobType: 'full-time',
          skillsExperiences: [ 'javascript', 'C', 'java' ]
        },
        keywords: [{
          score: 1,
          jobCount: 2,
          timeStamp: Date.now()
        },
        {
          score: 0,
          jobCount: 21,
          timeStamp: Date.now()
        }],
        keywordStatistic: {
            score: 10,
            jobCount: 30,
            timeStamp: Date.now()
        },
        friends: [],
        jobShortList: [],
        resumePath: './resume.pdf'
      };

      if (await user.updateUserInfo(userId, userUpdateInfo)) {
        const updatedUser = await Users.findById(userId);
        if (updatedUser.credentials.userName == updatedName) {
          res.send('succeed');
        } else {
          res.send('failed');
        }
      } else {
        res.send('userId is not valid; check createUser');
      }
    });

    app.get('/test/users/testgetUser', async (req, res) => {
      res.json(await user.getUser('mail'));
    });

    app.get('/test/users/testCreateUser', async (req, res) => {
      await user.createUser(testUser);

      res.send('Done');
    });

    app.get('/test/users/testCreateUserAndUserExists', async (req, res) => {
      const userEmail = 'uniqueUserName';

      await user.createUser(testUser);

      if (await user.userExists(userEmail)) {
        res.send('user exists test passed');
      } else {
        res.send('user exists test failed');
      }
    });

    //purely for testing adding to database
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