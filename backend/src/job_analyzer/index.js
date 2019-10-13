class JobAnalyzer {
    constructor(database) {
        this.db = database;
    }
    // TODO: change to passing in User and getting user's keywords
    async getRelatedJobs() {
        // const db = mongoClient.db('jobs');
        const jobsCollection = this.db.collection('jobs');

        const relatedJobs = await jobsCollection.find(
            { "summary": { $regex: new RegExp("javascript", "i") } }  
        ).project({ _id: 0 }).toArray();
        console.log(relatedJobs);
        
        return relatedJobs;
    }
};

export default JobAnalyzer;
