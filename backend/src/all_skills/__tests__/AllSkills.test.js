import mongoose from 'mongoose';

import AllSkills from '..';
import JobAnalyzer from '../../job_analyzer';
import { Skills, Jobs } from '../../schema';
import testData from './test_data';

jest.mock('../../job_analyzer');

describe('AllSkills', () => {
  let allSkills;
  let jobAnalyzer;

  beforeAll(async () => {
    // Connect to the in-memory db
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    jobAnalyzer = new JobAnalyzer();
    allSkills = new AllSkills(jobAnalyzer);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Create skills, jobs before each test case so they don't depend on each other

    // Create a mock function that is easily verifiable
    jobAnalyzer.computeJobKeywordCount = jest.fn((job, skills) => {
      skills.forEach((skill, skillIdx) => {
        job.keywords.push({
          name: skill,
          tfidf: 0.5,
          count: skillIdx,
        });
      });
    });
    jobAnalyzer.computeJobScores = jest.fn();
    await Skills.create({});
    await Jobs.insertMany(testData.jobs);
  });

  afterEach(async () => {
    // Delete all skills, jobs so tests don't depend on each other
    await Skills.deleteMany({});
    await Jobs.deleteMany({});
    jest.clearAllMocks();
  });

  test('setup', async () => {
    await Skills.deleteMany({});
    // Calling setup once should create a single entry
    await AllSkills.setup();
    expect(await Skills.countDocuments()).toBe(1);
    // Calling setup another time should not create another entry
    await AllSkills.setup();
    expect(await Skills.countDocuments()).toBe(1);
  });

  test('getAll: No skills', async () => {
    expect(await AllSkills.getAll()).toEqual([]);
  });

  test('getAll: Success', async () => {
    await Skills.findOneAndUpdate({}, {
      skills: testData.skills,
    });
    expect(await AllSkills.getAll()).toEqual(testData.skills);
  });

  test('update: No previous skills', async () => {
    await allSkills.update(testData.skills);

    // Verify jobs were updated
    const keywordData = testData.skills.map((skill, skillIdx) => ({
      name: skill,
      tfidf: 0.5,
      count: skillIdx,
    }));
    const jobs = await Jobs.find({}).lean();
    jobs.forEach(job => expect(job.keywords).toMatchObject(keywordData));

    expect(jobAnalyzer.computeJobKeywordCount).toHaveBeenCalledTimes(testData.jobs.length);
    expect(jobAnalyzer.computeJobScores).toHaveBeenCalledTimes(1);
    expect(jobAnalyzer.computeJobScores).toHaveBeenCalledWith(0);
  });

  test('update: Existing skills', async () => {
    await Skills.findOneAndUpdate({ skills: testData.skills });
    await allSkills.update(testData.skills);
    expect(jobAnalyzer.computeJobKeywordCount).toHaveBeenCalledTimes(0);
    expect(jobAnalyzer.computeJobScores).toHaveBeenCalledTimes(0);
  });

  test('update: With previous skills', async () => {
    const prevSkills = [testData.skills[0], testData.skills[2]];
    const newSkills = [testData.skills[1], ...testData.skills.slice(3)];
    await Skills.findOneAndUpdate({ skills: prevSkills });
    await allSkills.update(newSkills);

    // Verify jobs were updated
    const keywordData = newSkills.map((skill, skillIdx) => ({
      name: skill,
      tfidf: 0.5,
      count: skillIdx,
    }));
    const jobs = await Jobs.find({}).lean();
    jobs.forEach(job => expect(job.keywords).toMatchObject(keywordData));

    expect(jobAnalyzer.computeJobKeywordCount).toHaveBeenCalledTimes(newSkills.length);
    expect(jobAnalyzer.computeJobScores).toHaveBeenCalledTimes(1);
    expect(jobAnalyzer.computeJobScores).toHaveBeenCalledWith(prevSkills.length);
  });
});
