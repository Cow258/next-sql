// const d = new Date('2001-01-01T00:00:00.000Z')
// console.log(d.getTime())

const sql = require('./lib')

sql.init({
  defaultHost: 'default',
  hosts: {
    default: {
      host: '127.0.0.1',
      user: 'root',
      password: 'password',
    },
  },
})

// const a = sql()
// const b = a.where()

// console.log({
//   a,
//   b,
//   check: a == b,
//   type: typeof a,
//   name: a.prototype,
// })

sql().where(q => {

})

