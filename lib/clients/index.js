const { CLIENTS } = require('./constance')
const mysql = require('./mysql')

module.exports = {
  [CLIENTS.MYSQL]: mysql,
}
