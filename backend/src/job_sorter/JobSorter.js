// User shortlists job
// Add it to shortlisted jobs
// extract keywords from jobs(maybe top few)
// increments User keywords +/- 1

// extract 100 jobs for this user
// run tf-idf for the top keywords of user for the 100 jobs
// sum/weighted sum of total
// sort to have jobs with highest tf-idf first
import { Jobs } from '../schema';


class JobSorter {
  constructor(app, user) {
    this.user = user;
  }

  async getSkills() {
    return await this.user.getAllSkills();
  }

  async computeScore() {
    const jobs = Jobs.find({});
    const skills = this.user.getAllSkills();

    for (const keyword of skills) {
      let docCount = 0;
      let keywordCount = [];
      let wordCount = [];

      for (const posting of jobs) {
          // console.log(posting);
          let count = (posting.match(keyword) || []).length();
          keywordCount.push(count);
          if (count > 0) {
              docCount++;
          }
      }

      // calculate tfidf for each doc
      for (const doc of jobs) {
          tf = keywordCount / wordCount;
          idf = log(jobs.length() / docCount);


          // push tf_idf score to database
      }
    }
  }

}

export default JobSorter;
// const jobAnalzyer = new JobAnalyzer(app, user);
// const skills = user.getskills();
// const jobs = jobAnalzyer.findJobs(["javascript"])

// // sort the job array using tfidf with highest score first
// let sorted = [...tf_idf].sort((a, b) => {return b - a});
// for (let i = 0; i < tf_idf.length(); i++) {
//     let documentScore = tf_idf[i];
//     let returnIndex = sorted.indexOf(documentScore);
//     returnList[returnIndex] = jobs[i];
//     tf_idf[returnIndex] = -1;
// }

// increment/decrement the user skills based on which jobs are shortlisted/added

// so i calculated the tf_idf score for each doc based on the keywords of the user,
// now i want to sort the jobs to have the best jobs in the beginning. I am debaiting
// how to sort the job postings to reflect the score. I am thinking of sorting the tf_idf
// array and then making a new return array based on the values