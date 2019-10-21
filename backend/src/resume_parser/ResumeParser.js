import fs from 'fs';
import pdfparse from 'pdf-parse';
import stopword from 'stopword';
import axios from 'axios';

import credentials from '../../credentials/dandelion';

const EXTRACTION_ENDPOINT = 'https://api.dandelion.eu/datatxt/nex/v1/';
const MIN_CONFIDENCE = 0.8;
const RESUME_PATH = 'mediafiles/resumes/';

class ResumeParser {
  constructor(app, user) {
    app.post('/users/resume/upload', async (req, res) => {
      const userId = req.body.userId;
      try {
        const resumeKeywords = await this.parse('Vicki');
        const updateStatus = await user.updateUserInfo(userId, {
          skillsExperiences: resumeKeywords
        });
        res.status(updateStatus ? 200 : 400).send(updateStatus);
      } catch(e) {
        console.log(e);
        res.status(500).send(false);
      }
    });
  }

  /**
   * Extract important keywords from a resume
   * @param {String} fileName file name of resume to parse, without file extension
   * @returns {Array<String>} list of extracted keywords
   */
  async parse(fileName) {
    const inputPath = RESUME_PATH + fileName + '.pdf';
    const outputPath = RESUME_PATH + fileName + '.txt';
    const resume = await pdfparse(fs.readFileSync(inputPath));

    // TODO: Dandelion API request has a maximum length of 4096 characters
    // Remove all non-ascii characters, excess spaces, and stopwords
    const text = stopword.removeStopwords(resume.text
      .replace(/[^\x00-\x7F]/g, ' ')
      .replace(/[^\w.\-+]/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .toLowerCase()
      .split(' ')).join(' ');

    // Write the standardized text into a file
    fs.writeFile(outputPath, text, (err) => {
      if (err) {
        console.log(err);
      }
    });

    // Get keywords
    const res = await axios.get(
      `${EXTRACTION_ENDPOINT}?` +
      `min_confidence=${String(MIN_CONFIDENCE)}&` +
      `text=${encodeURIComponent(text)}&` +
      `token=${credentials.token}`
    ).catch(e => console.log(e));

    // Filter out keywords over length 20 and remove duplicates
    const keywords = res.data.annotations.map(ent => ent.spot).filter(word => word.length < 20);
    const uniqueKeywords = [...new Set(keywords)];
    return uniqueKeywords;
  }
};

export default ResumeParser;