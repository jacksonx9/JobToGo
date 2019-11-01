import fs from 'fs';
import pdfparse from 'pdf-parse';
import stopword from 'stopword';
import axios from 'axios';
import multer from 'multer';
import Logger from 'js-logger';

import Response from '../types';
import { MEDIA_ROOT } from '../constants';
import credentials from '../../credentials/dandelion';

const EXTRACTION_ENDPOINT = 'https://api.dandelion.eu/datatxt/nex/v1/';
const MIN_CONFIDENCE = 0.8; // Min confidence to accept keyword
const RESUME_PATH = `${MEDIA_ROOT}/resumes/`;
const REQUEST_TIMEOUT = 4000;
const REQUEST_MAX_ATTEMPTS = 3;
const MAX_KEYWORD_LENGTH = 20;

class ResumeParser {
  constructor(app, user) {
    this.logger = Logger.get(this.constructor.name);
    this.user = user;

    // Upload resume as multipart form data
    const upload = multer();
    app.post('/resume', upload.single('resume'), async (req, res) => {
      const response = await this.handleResume(req.body.userId, req.file);
      res.status(response.status).send(response);
    });
  }

  async handleResume(userId, resume) {
    if (!userId || !resume) {
      return new Response(false, 'Invalid userId or resume', 400);
    }

    const { originalname, buffer, mimetype } = resume;
    this.logger.info(`Received: ${originalname}`);

    if (mimetype !== 'application/pdf') {
      return new Response(false, 'Invalid PDF', 400);
    }

    // Parse text out of resume
    const textResult = await this.parse(originalname, buffer);
    if (textResult.status !== 200) {
      return textResult;
    }

    // Extract keywords from text
    const extractedResult = await this.extract(textResult.result);
    if (extractedResult.status !== 200) {
      return extractedResult;
    }

    // Update user skills with keywords
    const updateResult = await this.user.updateSkills(userId, extractedResult.result);
    return updateResult;
  }

  async parse(fileName, buffer) {
    const outputPath = `${RESUME_PATH + fileName}.txt`;
    let resume;
    try {
      resume = await pdfparse(buffer);
    } catch (e) {
      return new Response(false, 'Invalid PDF', 400);
    }

    // TODO: Dandelion API request has a maximum length of 4096 characters
    // Remove all non-ascii characters, excess spaces, and stopwords
    const text = stopword.removeStopwords(resume.text
      .replace(/[^ -~]/g, ' ')
      .replace(/[^\w.\-+]/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .toLowerCase()
      .split(' ')).join(' ');

    // Write the standardized text into a file for debugging purposes
    fs.writeFile(outputPath, text, (err) => {
      if (err) {
        this.logger.error(err);
      }
    });

    return new Response(text, '', 200);
  }

  async extract(text) {
    // If API call fails due to timeout, try again up to max attempts
    const tryExtract = async (inputText, attempts) => {
      if (attempts >= REQUEST_MAX_ATTEMPTS) {
        return null;
      }

      try {
        // API call to extract keywords
        const res = await axios.get(
          `${EXTRACTION_ENDPOINT}?`
          + `min_confidence=${String(MIN_CONFIDENCE)}&`
          + `text=${encodeURIComponent(inputText)}&`
          + `token=${credentials.token}`,
          { timeout: REQUEST_TIMEOUT },
        );
        return res.data;
      } catch (e) {
        // Request timeout, try again
        if (e.code === 'ECONNABORTED') {
          return tryExtract(inputText, attempts + 1);
        }

        const { status, statusText } = e.response;
        this.logger.error(`${status}: ${statusText}`);
        return null;
      }
    };

    const textData = await tryExtract(text, 0);

    if (textData === null) {
      return new Response(null, 'Internal server error', 500);
    }

    // Filter out keywords over length 20 and remove duplicates
    const keywords = textData.annotations
      .map(ent => ent.spot)
      .filter(word => word.length <= MAX_KEYWORD_LENGTH);
    const uniqueKeywords = [...new Set(keywords)];
    this.logger.info('Skills from resume: ', uniqueKeywords);

    return new Response(uniqueKeywords, '', 200);
  }
}

export default ResumeParser;
