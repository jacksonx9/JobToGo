import { IS_TEST_SERVER } from '../constants';

const testData = {
  indeedQuery: {
    host: 'www.indeed.com',
    maxAge: '30',
    sort: 'relevance',
    limit: IS_TEST_SERVER ? 5 : 50,
  },
  indeedExpiredTags: [
    '.jobsearch-ExpiredJobMetadata',
    '.jobsearch-JobInfoHeader-expiredHeader',
  ],
  indeedJobUrlTag: '#indeed-share-url',
  indeedJobDescTag: '#jobDescriptionText',
  keywords: [
    'software',
    'software intern',
    'java',
    'javascript',
    'python',
    'android',
    'react',
    'nodejs',
    'mongo',
    'ios',
    'gpu',
    'verilog',
    'linux',
    'opengl',
    'machine learning',
    'neural networks',
    'pytorch',
    'tensorflow',
  ],
};

export default testData;
