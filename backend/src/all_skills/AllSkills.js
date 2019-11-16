import assert from 'assert';
import { forEachAsync } from 'foreachasync';

import { Skills, Jobs } from '../schema';

class AllSkills {
  constructor(jobAnalyzer) {
    this.jobAnalyzer = jobAnalyzer;
  }

  static async setup() {
    // Make sure there is always one and only one entry
    const count = await Skills.countDocuments();
    assert(count === 0 || count === 1);

    if (count === 0) {
      await Skills.create({});
    }
  }

  /* gets and returns a set containing the collective skills of all the users */
  static async getAll() {
    const doc = await Skills.findOne({}).lean();
    return doc.skills;
  }

  /**
   * Updates all skills and recomputes job keyword counts and scores
   * @param {Array<String>} skills new skills to add to all skills
   */
  async update(skills) {
    const oldSkillsData = await Skills.findOneAndUpdate({}, {
      $addToSet: {
        skills,
      },
    }).orFail();

    const updatedSkills = await AllSkills.getAll();
    // Find newly added skills
    const newSkills = updatedSkills.slice(oldSkillsData.skills.length);

    if (newSkills.length === 0) {
      return;
    }

    // Update keyword counts of each job
    const jobs = await Jobs.find({});
    await forEachAsync(jobs, async (job) => {
      this.jobAnalyzer.computeJobKeywordCount(job, newSkills);
      await job.save();
    });

    // Computes tf idf for newly added skills
    await this.jobAnalyzer.computeJobScores(oldSkillsData.skills.length);
  }
}

export default AllSkills;
