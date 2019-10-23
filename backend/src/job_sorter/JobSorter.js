import { Jobs, Users } from '../schema';
import JobSet from './JobSet';

import { JOBS_PER_SEND } from '..';


class JobSorter {
  constructor(app, user, shortlister) {
    this.user = user;
    this.shortlister = shortlister;

    app.get('/jobs/findJobs/:userId', async (req, res) => {
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
            tfidf: tf * idf
          });
        } else {
          doc.keywords[keyword_idx].tfidf = tf * idf;
        }

        await doc.save();
        postingIdx++;
      }
    }
  }

  async getRelevantJobs(userID) {
    // sort the job array using tfidf with highest score first
    const user = await Users.find({_id: userID}, 'userInfo.skillsExperiences');
    const userKeywords = user[0].userInfo.skillsExperiences;
    let potentialJobs = new JobSet();
    let mostRelevantJobs = [];
    const swipedJobs = [];

    swipedJobs.push(...await this.shortlister.getLikedJobs(userID));
    swipedJobs.push(...await this.shortlister.getDislikedJobs(userID));

    if (userKeywords.length === 0) {
      // TODO: Change arbitrary value
      mostRelevantJobs.push(...await Jobs.find({ _id: { $nin: swipedJobs } }).limit(JOBS_PER_SEND));
      return {
        mostRelevantJobs,
        status: 200,
      };
    }

    console.log("Starting job retrieval.");

    for (const keyword of userKeywords) {
      // adds the most suitable jobs based on keyword to the Set
      const relevantJobs = await Jobs.find({
        keywords: { $elemMatch: { name: keyword }},
        _id: { $nin: swipedJobs }
      });

      relevantJobs.sort((job1, job2) => {
        const job1_keyword_idx = job1.keywords.findIndex(elem => elem.name === keyword);
        const job2_keyword_idx = job2.keywords.findIndex(elem => elem.name === keyword);

        if (job1.keywords[job1_keyword_idx].tfidf > job2.keywords[job2_keyword_idx].tfidf)
          return 1;
        if (job1.keywords[job1_keyword_idx].tfidf < job2.keywords[job2_keyword_idx].tfidf)
          return -1;

        return 0;
      })
      .slice(0, JOBS_PER_SEND);

      for (const job of relevantJobs) {
        potentialJobs.add(job);
      }
    }

    const jobScore = (job) => {
      let sum = 0;

      let valid_keywords = job.keywords.filter(keyword => userKeywords.includes(keyword.name));
      for (const k of valid_keywords) {
        sum += k.tfidf;
      }

      return sum;
    }

    console.log("Getting most relevant jobs.");
    // Get highest overall tfidf scores
    mostRelevantJobs = Array.from(potentialJobs.values())
      .sort((a, b) => {
        (jobScore(a) > jobScore(b)) ? 1
      : ((jobScore(b) > jobScore(a)) ? -1 : 0)
      }).slice(0, JOBS_PER_SEND);

    return {
      mostRelevantJobs,
      status: 200,
    };
  }
}

export default JobSorter;
