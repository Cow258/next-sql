/* eslint-disable vars-on-top */
/* eslint-disable no-redeclare */
/* eslint-disable no-var */
// const d = new Date('2001-01-01T00:00:00.000Z')
// console.log(d.getTime())
const util = require('util')

const sql = require('../lib/index')

require('console.table')
// const is = require('../lib/is')

sql.init({
  defaultHost: 'test',
  hosts: {
    test: {
      client: 'mysql',
      host: '127.0.0.1',
      port: 23306,
      user: 'testuser',
      password: 'testpassword',
      database: 'xsql_test',
    },
    test2: {
      client: 'mysql',
      host: '127.0.0.1',
      port: 23306,
      user: 'testuser',
      password: 'testpassword',
      database: 'xsql_test2',
    },
  },
})
console.log(util.inspect(sql, false, null, true))


const s = sql()
  .where({ isActive: 1, isEnable: 1 })
  .where('pets', 'NOT', null)
  .and(q => {
    q.or(() => {
      q.and('age', 'between', [40, 45])
      q.and('age', 'between', [50, 60])
    })
    q.or('age', 'between', [18, 25])
    q.or(() => {
      q.and('age', 'between', [40, 45])
      q.and('age', 'between', [50, 60])
    })
  })
  .limit(5)
  .offset(15)
  .orderBy('id desc')
  .groupBy('type')
const { conditions, ...state } = s._state
console.table('state', state)
console.table('conditions', conditions)
const statement = s.toStatement('read', 'users')
console.log('s.toStatement()', statement)
console.table('s.toRaw()', statement.toRaw())

console.log('===================================')

const statement2 = sql().toStatement('update', 'users', {
  name: 'Mary',
  cash: 50,
  createAt: new Date(),
})
console.log('s2.toStatement()', statement2)
console.table('s2.toRaw()', statement2.toRaw())

console.log('===================================')



// const s3 = s.clone()
// s3.and({ asd: 999 })
// const statement3 = s3.toStatement('update', 'users', { name: 'Mary' })
// console.log('s3.toStatement()', statement3)
// console.table('s3.toRaw()', s3.toRaw(...statement3))

// console.log('===================================')

// const statement4 = s.toStatement('read', 'users')
// console.log('s.toStatement()', statement4)
// console.table('s.toRaw()', s.toRaw(...statement4))


async function main() {

  // const newUser = await sql().insert('users', {
  //   name: 'Sam',
  //   createAt: Date.now(),
  // })
  // console.log(newUser)

  // await sql()
  //   .where({ id: newUser.insertId })
  //   .update('users', {
  //     flag: 5,
  //   })

  const users = await sql()
    // .where(q => {
    //   q.where('id', 'in', [2, 3])
    // })
    // .and(q => {
    //   q.where('id', 'in', [3, 4])
    // })
    // .where('name', 'like', '%a%')
    // .orderBy('id desc')
    .read('users')
  console.table(users)
  process.exit()
}
main()


  // (async () => {
  // })()

// sql.init({
//   defaultHost: 'default',
//   hosts: {
//     default: {
//       client: 'mysql',
//       host: '127.0.0.1',
//       user: 'root',
//       password: 'password',
//     },
//   },
// })

// const a = sql()
// const b = a.where()

// console.log({
//   a,
//   b,
//   check: a == b,
//   type: typeof a,
//   name: a.prototype,
// })


// const a = sql().where(q => {
//   console.log(q)
//   console.log(q._conditions)
// })
// const b = sql().where(q => {
//   console.log(q)
//   console.log(q._conditions)

// })
// console.log(a.where === b.where)

// sql.clients.mysql.init({

// })

// console.log('is.async =>', is.async(null))

// sql.clients.mysql.query('conn', 'sql', [1, '1'], (row) => {

// })

// sql().transaction(async (t) => {
//   await t().where()
//   t().where()
// })

// sql.clients.mysql.transaction('', async (q) => {

// })
