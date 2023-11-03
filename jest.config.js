module.exports = {
  collectCoverageFrom: [
    'lib/*.js',
    'clients/mysql2.js',
  ],
  coverageDirectory: './coverage',
  testMatch: [
    '**/test/**/*.test.js',
  ],
}
