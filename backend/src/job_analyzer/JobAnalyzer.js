import Logger from 'js-logger';

import { Jobs, Users } from '../schema';
import { JOBS_PER_SEND } from '../constants';


class JobAnalyzer {
  constructor(app, user, shortlister) {
    this.logger = Logger.get(this.constructor.name);

    this.user = user;
    this.shortlister = shortlister;

    app.get('/jobs/findJobs/:userId', async (req, res) => {
      const result = await this.getRelevantJobs(req.params.userId);
      res.status(result.status).send(result.mostRelevantJobs);
    });
  }

  async computeJobScores() {
    this.logger.info('Starting to compute job scores...');

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
        const tf = keywordCount[postingIdx] / wordCount[postingIdx];
        const idf = docCount != 0 ? Math.log(jobsLen / docCount) : 0;
        const tf_idf = tf * idf;

        // add name and tf_idf score to each job's keywords the first time
        // replace tf_idf score for a keyword for each job
        const keyword_idx = doc.keywords.findIndex(elem => elem.name === keyword);
        if (keyword_idx === -1) {
          doc.keywords.push({
            name: keyword,
            tfidf: tf_idf
          });
        } else {
          doc.keywords[keyword_idx].tfidf = tf_idf;
        }

        await doc.save();
        postingIdx++;
      }
    }

    this.logger.info('Computed job scores!');
  }

  async getRelevantJobs(userID) {
    const swipedJobs = [];
    const mostRelevantJobs = [];
    const jobScoreCache = new Map();
    const user = await Users.findById(userID);
    const userKeywords = user.userInfo.skillsExperiences;

    // Get jobs the user has already seen
    swipedJobs.push(...await this.shortlister.getLikedJobs(userID));
    swipedJobs.push(...await this.shortlister.getDislikedJobs(userID));
    const unseenJobs = await Jobs.find({ _id: { $nin: swipedJobs } });

    // If the user has not uploaded a resume
    if (userKeywords.length === 0) {
      mostRelevantJobs.push(...unseenJobs.limit(JOBS_PER_SEND));
      return {
        mostRelevantJobs,
        status: 200,
      };
    }

    this.logger.info("Starting job retrieval.");
    // Compute overall tf_idf score of a job
    const jobScore = (job) => {
      let sum = 0;

      if (jobScoreCache.has(job.id)) {
        sum = jobScoreCache.get(job.id);
      } else {
        for (const keyword of job.keywords) {
          if (userKeywords.includes(keyword.name))
            sum += keyword.tfidf;
        }
        jobScoreCache.set(job.id, sum);
      }

      return sum;
    }

    this.logger.info("Getting most relevant jobs.");
    // Get jobs with overall highest tfidf scores
    mostRelevantJobs.push(...unseenJobs
      .sort((job_a, job_b) => {
        const job_a_score = jobScore(job_a);
        const job_b_score = jobScore(job_b);

        if (job_a_score > job_b_score)
          return 1;
        else if (job_b_score < job_a_score)
          return -1;

        return 0;
      }).slice(0, JOBS_PER_SEND));

    return {
      mostRelevantJobs,
      status: 200,
    };
  }
}

export default JobAnalyzer;
