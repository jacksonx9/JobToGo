import mongoClient from '..';


class JobAnalyzer {
    constructor(database) {
        this.db = database;
    }

    // TODO: change to passing in User and getting user's keywords
    async getDBJobs(keywords) {
        const jobsCollection = this.db.collection('jobs');
        let jobs = new Set();

        for (let keyword of keywords) {
            const re = new RegExp(keyword, "i");
            
            const jobsMatchingKeyword = await jobsCollection.find(
                { "description": { $regex: re } },
                { "title": { $regex: re } }   
            ).project({ _id: 0 }).toArray();
            jobsMatchingKeyword.forEach(item => jobs.add(item))
        }

        for (let job of jobs) {
            console.log(job);
        }
                
        return jobs;
    }
};

export default JobAnalyzer;
