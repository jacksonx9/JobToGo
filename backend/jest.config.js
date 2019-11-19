module.exports = {
  preset: '@shelf/jest-mongodb',
  testPathIgnorePatterns: [
    'dist/',
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    'src/*.js',
    '!src/nonfunc/*.js',
  ],
};
