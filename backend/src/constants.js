import Logger from 'js-logger';

export const IS_TEST_SERVER = process.env.HOSTNAME === 'jobtogo_backend_test';

export const PORT = IS_TEST_SERVER ? 8090 : 8080;
export const MONGO_URL = `mongodb://171.0.0.3:27017/${IS_TEST_SERVER ? 'Test' : 'JobToGo'}`;
export const FIREBASE_URL = 'https://jobtogo-103fd.firebaseio.com';
export const LOG_LEVEL = IS_TEST_SERVER ? Logger.DEBUG : Logger.INFO;
export const DEBUG = true;

export const JOBS_PER_SEND = 20;
export const JOBS_SEARCH_MAX_SIZE = 2000;
export const JOBS_SEARCH_PERCENT_SIZE = 0.25;
export const DAILY_JOB_COUNT_LIMIT = 200;
export const MIN_JOBS_IN_DB = IS_TEST_SERVER ? 100 : 500;

export const RATE_LIMIT_CONFIG = {
  maxConcurrent: 6, // Max concurrent HTTP connections at a time
  minTime: 100, // Min time between HTTP requests
};
