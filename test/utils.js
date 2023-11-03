const crypto = require('crypto')
const util = require('util')

const { host, user, password, database } = require('../testConfig')

module.exports = {
  sqlConfig: {
    defaultHost: 'test',
    connectionLimit: 10,
    waitForConnections: true,
    acquireTimeout: 120000,
    timeout: 120000,
    charset: 'utf8mb4',
    isLog: false,
    hosts: {
      test: {
        client: 'mysql2',
        host,
        user,
        password,
        database,
      },
    },
  },
  GetUuid: () => crypto.randomUUID().replace(/-/g, ''),
  GetLetter: (num) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const len = letters.length
    let str = ''
    while (num >= len) {
      const i = num % len
      str = letters[i] + str
      num = (num - i) / len - 1
    }
    return letters[num] + str
  },
  GenArray: (start, length) => {
    const ary = []
    for (let i = start; i < start + length; i++) {
      ary.push(i)
    }
    return ary
  },
  Sleep(ms) {
    return new Promise((res) => {
      setTimeout(res, ms)
    })
  },
  xLog: (obj) => {
    console.log(util.inspect(obj, false, null, true))
  },
}
