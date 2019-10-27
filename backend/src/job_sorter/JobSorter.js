import { Jobs, Users } from '../schema';
import { JOBS_PER_SEND } from '..';


class JobSorter {
  constructor(app, user) {
    this.timepoint = Date.now();
    this.user = user;
    app.get('/jobSorter/:userId', async (req, res) => {
      const result = await this.getRelevantJobs(req.params.userId);
      res.status(result.status).send(result.mostRelevantJobs);
    });
  }

  async computeJobScores() {
    const jobs = await Jobs.find({});
    const skills = await this.user.getAllSkills();

    for (const skill of skills) {
      let docCount = 0;
      let wordCount = [];
      let keywordCount = [];
      const keyword = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const re = new RegExp(keyword, "g");

      for (const posting of jobs) {
        let count = (posting.description.toString().match(re) || []).length;
        wordCount.push(posting.description.split(' ').length);
        keywordCount.push(count);
        if (count > 0) {
            docCount++;
        }
      }

      let postingIdx = 0;
      let jobsLen = jobs.length;
      // calculate tf_idf each doc and save it
      for (const doc of jobs) {
        let tf = keywordCount[postingIdx] / wordCount[postingIdx];
        let idf = docCount != 0 ? Math.log(jobsLen / docCount) : 0;

        // add name and tf_idf score to each job's keywords the first time
        // replace tf_idf score for a keyword for each job
        const keyword_idx = doc.keywords.findIndex(elem => elem.name === keyword);
        if (keyword_idx === -1) {
          doc.keywords.push({
            name: keyword,
            tfidf: tf*idf
          });
        } else {
          doc.keywords[keyword_idx].tfidf = tf*idf;
        }

        await doc.save();
        postingIdx++;
      }
    }
  }

  async getRelevantJobs(userID) {
    let mostRelevantJobs = [];
    const jobScoreCache = new Map();
    const user = await Users.findById(userID);
    const userKeywords = user.userInfo.skillsExperiences;
    const jobs = Array.from(await Jobs.find({}));

    const jobScore = (job) => {
      let sum = 0;

      if (jobScoreCache.has(job.id)) {
        sum = jobScoreCache.get(job.id);
      } else {
        for (const keyword of job.keywords) {
          if (userKeywords.includes(keyword.name))
            sum += keyword.tfidf;
        }
      }

      return sum;
    }

    // Get jobs with overall highest tfidf scores
    mostRelevantJobs = jobs
      .sort((job_a, job_b) => {
        const job_a_score = jobScore(job_a);
        const job_b_score = jobScore(job_b);

        if (job_a_score > job_b_score)
          return 1;
        else if (job_b_score < job_a_score)
          return -1;

        return 0;
      }).slice(0, JOBS_PER_SEND);

    return {
      mostRelevantJobs,
      status: 200,
    };
  }
}

export default JobSorter;
