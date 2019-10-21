// User shortlists job
// Add it to shortlisted jobs
// extract keywords from jobs(maybe top few)
// increments User keywords +/- 1

// extract 100 jobs for this user
// run tf-idf for the top keywords of user for the 100 jobs
// sum/weighted sum of total
// sort to have jobs with highest tf-idf first
import JobAnalyzer from './JobAnalyzer';

const jobAnalzyer = new JobAnalyzer(app, user);
const skills = user.getskills();
const jobs = jobAnalzyer.findJobs(["javascript"])

let tf_idf = [];
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
    for (let i = 0; i < jobs.length; i++) {
        tf = keywordCount / wordCount;
        idf = log(jobs.length() / docCount);
        tf_idf[i] += tf * idf;
    }
}

// sort the job array using tfidf with highest score first
let sorted = [...tf_idf].sort((a, b) => {return b-a});


// increment/decrement the user skills based on which jobs are shortlisted/added

