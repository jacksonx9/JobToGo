// User shortlists job
// Add it to shortlisted jobs
// extract keywords from jobs(maybe top few)
// increments User keywords +/- 1

// extract 100 jobs for this user
// run tf-idf for the top keywords of user for the 100 jobs
// sum/weighted sum of total
// sort to have jobs with highest tf-idf first
import { Jobs, Users } from '../schema';
import JobSet from './JobSet';

import { JOBS_PER_SEND } from '..';


class JobSorter {
  constructor(app, user) {
    this.user = user;
  }

  async computeJobScores() {
    const jobs = await Jobs.find({});
    const skills = await this.user.getAllSkills();
    console.log(skills);

    for (const keyword of skills) {
      let docCount = 0;
      let wordCount = [];
      let keywordCount = [];
      const re = new RegExp(keyword, "g");  // TODO: regular expression for C++

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
        doc.keywords.push({
          name: keyword,
          tfidf: tf * idf
        });

        await doc.save();
        postingIdx++;
      }
    }
  }

  async getRelevantJobs(userID) {
    // sort the job array using tfidf with highest score first
    const userKeywords = await Users.find({_id: userID}, 'keywords');
    let potentialJobs = new JobSet();
    let mostRelevantJobs = [];

    function jobScore(job) {
      return job.keywords.filter(keyword => mostRelevantJobs.includes(keyword)).length;
    }

    userKeywords.forEach(function(keyword) {
      // adds the most suitable jobs based on keyword to the Set
      const relaventJobs = Jobs.find({'keywords.name' : keyword})     // why does await not work here??
      .sort((a, b) => (a.keywords.tfidf > b.keywords.tfidf) ? 1
      : ((b.keywords.tfidf > a.keywords.tfidf) ? -1 : 0))
      .limit(JOBS_PER_SEND);
      potentialJobs.push(...relaventJobs);
    })
    .catch(e => {
      console.log(e);
      return {
        status: 400,
        success: false
      };
    });

    mostRelevantJobs = potentialJobs
      .sort((a, b) => (jobScore(a) > jobScore(b)) ? 1
      : ((jobScore(b) > jobScore(a)) ? -1 : 0))
      .limit(JOBS_PER_SEND);

    return {
      mostRelevantJobs,
      status: 200,
    };

    // for (const keyword of userKeywords) {

    //   const mostSuitable = Jobs.find({'keywords.name' : keyword})
    //     .sort(function(a, b) {
    //       return a-b
    //     }).limit(JOBS_PER_SEND);


    //     // (a, b) => (a.keywords.tfidf > b.keywords.tfidf) ? 1
    //     // : ((b.keywords.tfidf > a.keywords.tfidf) ? -1 : 0))
    //     // .limit(JOBS_PER_SEND);

    //   let sorted = [...tf_idf].sort((a, b) => {return b - a});
    //   for (let i = 0; i < tf_idf.length(); i++) {
    //       let documentScore = tf_idf[i];
    //       let returnIndex = sorted.indexOf(documentScore);
    //       returnList[returnIndex] = jobs[i];
    //       tf_idf[returnIndex] = -1;
    //   }
    // }
  }
}

export default JobSorter;

// increment/decrement the user skills based on which jobs are shortlisted/added

// so i calculated the tf_idf score for each doc based on the keywords of the user,
// now i want to sort the jobs to have the best jobs in the beginning. I am debaiting
// how to sort the job postings to reflect the score. I am thinking of sorting the tf_idf
// array and then making a new return array based on the values