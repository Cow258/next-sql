/* eslint-disable global-require */

const mysqldump = require('mysqldump')

module.exports = async () => {
  const config = require('../testConfig')

  const {
    host,
    user,
    password,
    database,
    charset,
  } = config
  await mysqldump({
    connection: {
      host,
      user,
      password,
      database,
      charset,
    },
    dumpToFile: './db/source/dump.sql',
    dump: {
      data: {
        format: false,
        maxRowsPerInsertStatement: 1000,
      },
      schema: {
        table: {
          dropIfExist: true,
        },
      },
    },
  })
  console.log('Saved dump to "./db/source/dump.sql"')
}
