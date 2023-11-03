module.exports = {
  collectCoverageFrom: [
    'lib/*.js',
    'lib/clients/mysql2.js',
  ],
  coverageDirectory: './coverage',
  testMatch: [
    '**/test/**/*.test.js',
  ],
}
