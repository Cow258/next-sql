const mysql = require('mysql2')

const {
  host,
  user,
  password,
  database,
} = require('../testConfig')

module.exports = async () => {

  function connect() {
    const connection = mysql.createConnection({
      host,
      user,
      password,
      database,
    })
    connection.connect((err) => {
      if (err) {
        console.error('Waiting for DB start up...')
        setTimeout(connect, 5000) // wait for 5 second and try again
      } else {
        console.log('DB start up successfully.')
        connection.end()
      }
    })
  }

  connect()
}
