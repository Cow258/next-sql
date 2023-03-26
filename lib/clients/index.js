const { CLIENTS } = require('./constance')
const mysql = require('./mysql')
const mysql2 = require('./mysql2')

module.exports = {
  [CLIENTS.MYSQL]: mysql,
  [CLIENTS.MYSQL2]: mysql2,
}
