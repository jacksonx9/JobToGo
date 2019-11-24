import pdfparse from 'pdf-parse';
import stopword from 'stopword';
import axios from 'axios';
import multer from 'multer';
import Logger from 'js-logger';
import vision from '@google-cloud/vision';

import { Users } from '../schema';
import Response from '../types';
import credentials from '../../credentials/dandelion';

const EXTRACTION_ENDPOINT = 'https://api.dandelion.eu/datatxt/nex/v1/';
const MIN_CONFIDENCE = 0.8; // Min confidence to accept keyword
const REQUEST_TIMEOUT = 4000;
const REQUEST_MAX_ATTEMPTS = 3;
const MAX_KEYWORD_LENGTH = 20;
// Dandelion API request URI has a maximum length of 4096 characters
export const MAX_REQUEST_URI_LENGTH = 4096;
const MAX_REQUEST_TEXT_LENGTH = MAX_REQUEST_URI_LENGTH
  - (EXTRACTION_ENDPOINT.length + credentials.token.length + String(MIN_CONFIDENCE).length + 29);

class ResumeParser {
  constructor(app, user) {
    this.logger = Logger.get(this.constructor.name);
    this.user = user;
    this.client = new vision.ImageAnnotatorClient();

    // Upload resume as multipart form data
    const upload = multer();
    app.post('/resume', upload.single('resume'), async (req, res) => {
      const response = await this.handleResume(req.body.userId, req.file);
      res.status(response.status).send(response);
    });
  }

  async handleResume(userId, resume) {
    let textResult;
    if (!userId || !resume) {
      return new Response(false, 'Invalid userId or resume', 400);
    }

    const { originalname, buffer, mimetype } = resume;
    this.logger.info(`Received: ${originalname}`);

    // Verify user is valid before starting to parse
    try {
      await Users.findById(userId).orFail();
    } catch (e) {
      return new Response(false, 'Invalid userId or resume', 400);
    }

    if (mimetype === 'application/pdf') {
      // Parse text out of resume
      textResult = await this.parsePdf(buffer);
    } else if (mimetype.startsWith('image')) {
      textResult = await this.parseImage(buffer);
    } else {
      return new Response(false, 'Invalid PDF', 400);
    }

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

  async parsePdf(buffer) {
    let resume;

    try {
      resume = await pdfparse(buffer);
    } catch (e) {
      return new Response(false, 'Invalid PDF', 400);
    }

    return this._removeStopWords(resume.text);
  }

  async parseImage(buffer) {
    const request = {
      image: buffer,
    };

    this.client
      .safeSearchDetection(request)
      .then(response => {
        return this._removeStopWords(response);
      })
      .catch(err => {
        console.error(err);
        return new Response(false, 'Invalid Image', 400);
      });
  }

  // Remove all non-ascii characters, excess spaces, and stopwords
  _removeStopWords(text) {
    const parsedText = stopword.removeStopwords(text
      .replace(/[^ -~]/g, ' ')
      .replace(/[^\w.\-+]/g, ' ')
      .replace(/[ ]{2,}/g, ' ')
      .trim()
      .toLowerCase()
      .split(' ')).join(' ');

    return new Response(parsedText, '', 200);
  }

  async extract(text) {
    // If API call fails due to timeout, try again up to max attempts
    const tryExtract = async (inputText, attempts) => {
      if (attempts >= REQUEST_MAX_ATTEMPTS) {
        return null;
      }

      try {
        // TODO: Don't just remove all characters over the limit
        // API call to extract keywords
        const res = await axios.get(
          `${EXTRACTION_ENDPOINT}?`
          + `min_confidence=${String(MIN_CONFIDENCE)}&`
          + `text=${encodeURIComponent(inputText).substring(0, MAX_REQUEST_TEXT_LENGTH)}&`
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
