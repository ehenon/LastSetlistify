// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  /* coveragePathIgnorePatterns: [
    '\\\\node_modules\\\\',
  ], */

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'text',
    'lcov',
  ],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // An array of regexp pattern strings that are matched
  // against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '/dist/',
  ],
};
