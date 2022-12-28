/* eslint-disable import/no-dynamic-require */
const [, , cmd, ...args] = process.argv

require(`./${cmd}`)(...args)
