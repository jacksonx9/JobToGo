import { Jobs, Users } from '../schema';
import JobSet from './JobSet';

import { JOBS_PER_SEND } from '..';


class JobSorter {
  constructor(app, user) {
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

        // check if keyword exists in database before pushing
        // .addIfDoesNotExist
        await Jobs.updateOne({ _id: doc.id },
          { $addToSet: { 'keywords': { name: keyword, tfidf: (tf * idf) } }})
          .exec()
          .catch(e => {
            console.log(e);
            return {
              status: 500,
              success: false
            };
          });
        // doc.keywords.push({
        //   name: keyword,
        //   tfidf: tf * idf
        // });

        // await doc.save();
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

    for (const keyword of userKeywords) {
      // adds the most suitable jobs based on keyword to the Set
      const relevantJobs = await Jobs.find({keywords: { $elemMatch: { name: keyword }}});

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

    console.log(Array.from(potentialJobs.values()));
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

// increment/decrement the user skills based on which jobs are shortlisted/added

// so i calculated the tf_idf score for each doc based on the keywords of the user,
// now i want to sort the jobs to have the best jobs in the beginning. I am debaiting
// how to sort the job postings to reflect the score. I am thinking of sorting the tf_idf
// array and then making a new return array based on the values