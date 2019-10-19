
import JobSearcher from '../src/job_searcher';
import JobAnalyzer from '../src/job_analyzer';
import User from '../src/user';

class TestAPIs {
  constructor(app) {
    const jobSearcher = new JobSearcher(app);
    const jobAnalyzer = new JobAnalyzer();
    const user = new User();

    app.get('/test/users/testgetUser', async (req, res) => {
      res.json(await user.getUser('mail'));
    });

    app.get('/test/users/testCreateUser', async (req, res) => {
      await user.createUser({ 
        credentials: { 
          userName: 'name', 
          email: 'mail', 
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
      });

      res.send('Done');
    });

    app.get('/test/users/testCreateUserAndUserExists', async (req, res) => {
      const userEmail = 'uniqueUserName';

      await user.createUser({ 
        credentials: { 
          userName: 'name', 
          email: userEmail, 
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
      });

      if (await user.userExists(userEmail)) {
        res.send('user exists test passed');
      } else {
        res.send('user exists test failed');
      }
    });

    //purely for testing adding to database
    app.get('/test/jobs/testAddJobs/', async (req, res) => {
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