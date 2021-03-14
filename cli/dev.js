/* eslint-disable no-unused-vars */
/* eslint-disable vars-on-top */
/* eslint-disable no-redeclare */
/* eslint-disable no-var */
// const d = new Date('2001-01-01T00:00:00.000Z')
// console.log(d.getTime())
const util = require('util')

const xsql = require('../lib/index')

require('console.table')
// const is = require('../lib/is')

function xlog(obj) {
  console.log(
    util.inspect(
      JSON.parse(
        JSON.stringify(obj)
      ), false, null, true
    )
  )
}

xsql.init({
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
// console.log(util.inspect(xsql, false, null, true))


// const s = xsql()
//   .where({ isActive: 1, isEnable: 1 })
//   .where('pets', 'NOT', null)
//   .and(q => {
//     q.or(() => {
//       q.and('age', 'between', [40, 45])
//       q.and('age', 'between', [50, 60])
//     })
//     q.or('age', 'between', [18, 25])
//     q.or(() => {
//       q.and('age', 'between', [40, 45])
//       q.and('age', 'between', [50, 60])
//     })
//   })
//   .limit(5)
//   .offset(15)
//   .orderBy('id desc')
//   .groupBy('type')
// const { conditions, ...state } = s._state
// console.table('state', state)
// console.table('conditions', conditions)
// const statement = s.toStatement('read', 'users')
// console.log('s.toStatement()', statement)
// console.table('s.toRaw()', statement.toRaw())

// console.log('===================================')

// const statement2 = xsql().toStatement('update', 'users', {
//   name: 'Mary',
//   cash: 50,
//   createAt: new Date(),
// })
// console.log('s2.toStatement()', statement2)
// console.table('s2.toRaw()', statement2.toRaw())

// console.log('===================================')



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

  // const newUser = await xsql().insert('users', {
  //   name: 'Mary',
  //   createAt: Date.now(),
  // })
  // console.log(newUser)

  // await xsql()
  //   .where({ id: newUser.insertId })
  //   .update('users', {
  //     flag: 5,
  //   })

  // const users = await xsql()
  //   // .where(q => {
  //   //   q.where('id', 'in', [2, 3])
  //   // })
  //   // .and(q => {
  //   //   q.where('id', 'in', [3, 4])
  //   // })
  //   // .where('name', 'like', '%a%')
  //   // .orderBy('id desc')
  //   .read('users')
  // console.table(users)

  // await xsql().transaction(async (t) => {
  //   const { insertId } = await t().insert('users', {
  //     name: 'Test3',
  //     createAt: Date.now(),
  //   })
  //   await t().insert('users', {
  //     id: insertId,
  //     name: 'Test4',
  //     createAt: Date.now(),
  //   })
  // })


  // Pagination Test
  const rows = []
  for (let i = 1; i <= 100; i++) {
    rows.push({
      index: i,
      pets: [1, 2],
    })
  }
  await xsql().delete('test')
  await xsql().batchInsert('test', rows, {
    jsonKeys: 'pets',
  })
  const tests = await xsql()
    .pagination({
      currPage: 6,
      navStep: 4,
    })
    .filter(async (row) => {
      return (new Promise((res) => {
        setTimeout(() => {
          row.pets = [...row.pets, 9]
          res(row)
        }, 50)
      }))
    })
    .read('test', {
      jsonKeys: 'pets',
    })
  const { eof, pagination } = tests
  console.log(util.inspect({
    tests,
    eof,
    pagination,
  }, false, null, true))


  // Relationship test
  // const reg = /^(.+):(.+)\.(.+)$/g
  // const str = 'computer:computers.id'
  // const [
  //   ,
  //   currentKey,
  //   targetTable,
  //   targetKey,
  // ] = reg.exec(str)
  // console.log([
  //   str.match(reg),
  //   reg.exec(str),
  //   reg.test(str),
  //   currentKey,
  //   targetTable,
  //   targetKey,
  // ])

  // const m = 'computer:computers.id'.match(/^(.+):(.+)\.(.+)$/g)
  // console.log(m)

  // const users = await xsql()
  //   .toOne('computer:computers.id')
  //   .toMany('pets:pets.id')
  //   .fromOne('cars', 'id:cars.user', {
  //     // query: (q) => {
  //     //   q.toOne('brand:brands.id')
  //     // },
  //   })
  //   // .where({ id: 1 })
  //   .read('users')
  // xlog(users)


  // JSON Support
  // await xsql().insert('users', {
  //   name: 'Jason',
  //   createAt: Date.now(),
  //   pets: [1, 2],
  // }, {
  //   jsonKeys: 'pets',
  // })

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

// const a = xsql()
// const b = a.where()

// console.log({
//   a,
//   b,
//   check: a == b,
//   type: typeof a,
//   name: a.prototype,
// })


// const a = xsql().where(q => {
//   console.log(q)
//   console.log(q._conditions)
// })
// const b = xsql().where(q => {
//   console.log(q)
//   console.log(q._conditions)

// })
// console.log(a.where === b.where)

// sql.clients.mysql.init({

// })

// console.log('is.async =>', is.async(null))

// sql.clients.mysql.query('conn', 'sql', [1, '1'], (row) => {

// })

// xsql().transaction(async (t) => {
//   await t().where()
//   t().where()
// })

// sql.clients.mysql.transaction('', async (q) => {

// })
