
# Intro
`xSQL` is next-gen relationship SQL connector.\
Easy to use.
out of the box.

# Getting Start
```sh
npm i xsql
```
OR
```sh
yarn add xsql
```

## Config Examples
We will pass your config into `mysql` directly.\
You can find more detail from the following link\
https://github.com/mysqljs/mysql#connection-options
```js
const sql = require('xsql')
const config = {
  // Each connection is created will use the following default config 
  port: 3306,
  connectionLimit: 5,
  waitForConnections: true,
  acquireTimeout: 120000,
  timeout: 120000,
  charset: 'utf8mb4',
  default: 'default', // <- The default host id

  // Configs for each hosts
  hosts: {
    // At least one host config is required
    'default': { // <- Host ID
      host: 'example.com',
      user: 'username',
      password: 'password',
      database: 'dbname',
    },
    'HostId-2': {
      host: 'example2.com',
      user: 'username',
      password: 'password',
      database: 'dbname',
      timeout: 30000, // <- You can override default config 
    }
  }
}
// It will create PoolCluster for each hosts.
sql.init(config)
```

---

### Read all rows from `users` table
```js
const users = await sql().from('users').read()
```
Equivalent to the following SQL statement
```sql
SELECT * FROM `users`
```              
Result
```js
users = [
  { id: 1, name: 'Peter', computer: 50, pets: '20,21', gender: 'M', age: 20, birthAt: '2001-01-01T00:00:00.000Z' },
  { id: 2, name: 'Tom', computer: null, pets: null, gender: 'M', age: 56, birthAt: '1965-01-01T00:00:00.000Z' },
  { id: 3, name: 'Mary', computer: 51, pets: '22,23', gender: 'F', age: 42, birthAt: '1979-01-01T00:00:00.000Z' },
  { id: 4, name: 'Kitty', computer: null, pets: null, gender: 'F', age: 18, birthAt: '2003-01-01T00:00:00.000Z' },
  { id: 5, name: 'Sam', computer: null, pets: null, gender: 'M', age: 32, birthAt: '1989-01-01T00:00:00.000Z' },
  { id: 6, name: 'Kevin', computer: null, pets: null, gender: 'M', age: 76, birthAt: '1945-01-01T00:00:00.000Z' },
]
```
---
### Read single user
```js
const [ user ] = await sql()
  .from('users')
  .where({ id: 5 })
  .read()
```
Equivalent to the following SQL statement
```sql
SELECT * FROM `users` WHERE `id` = 5
```
Result
```js
user = { 
  id: 5,
  name: 'Sam',
  computer: null,
  pets: null,
  gender: 'M',
  age: 32,
  birthAt: '1989-01-01T00:00:00.000Z',
}
```
---
### Advanced query
```js
const users = await sql()
  .select('`name`, `age`, DATE_FORMAT(`birthAt`, "%Y") AS birthYear')
  .from('users')
  .where({ isActive: 1, isEnable: 1 })
  .where('pets', 'not', null)
  .where((q) => {
    q.or(() => {
      q.and('age', 'between', [40, 45])
      q.and('age', 'between', [50, 60])
    })
    q.or('age', 'between', [18, 25])
  })
  .read()
```
Equivalent to the following SQL statement
```sql
SELECT `name`, `age`, DATE_FORMAT(`birthAt`, "%Y") AS birthYear 
FROM `users`
WHERE `isActive` = ? AND `isEnable` = ? AND (
  (
    `age` between ? AND ?
    `age` between ? AND ?
  ) 
  OR `age` between ? AND ?
)
# Query Params
# [1, 1, 40, 45, 50, 60, 18, 25]
```
Result
```js
users = [
  { name: 'Peter', age: 20, birthYear: '2001' },
  { name: 'Tom', age: 56, birthYear: '1965' },
  { name: 'Mary', age: 42, birthYear: '1979' },
  { name: 'Kitty', age: 18, birthYear: '2003' },
]
```
---
### Row filter
```js
const users = await sql()
  .from('users')
  .filter((row) => ({
    id: row.id,
    age: row.age,
    birth: {
      year: row.birthAt.getFullYear(),
      month: row.birthAt.getMonth() + 1,
      day: row.birthAt.getDate(),
      timestamp: row.birthAt.getTime(),
    },
  }))
  .where({ id: 1 })
  .read()
```
Equivalent to the following SQL statement
```sql
SELECT * FROM `users`
```
Result
```js
users = [
  {
    id: 1,
    age: 20,
    birth: {
      year: 2001,
      month: 1,
      day: 1,
      timestamp: 978307200000,
    }
  },
]
```
---
### Group by and Order by
```js
const users = await xsql()
  .select('`gender`, AVG(`age`) AS averageAge')
  .from('users')
  .groupBy('`gender`')
  .orderBy('`gender` DESC, `averageAge`')
  .read()
```
Equivalent to the following SQL statement
```sql
SELECT `gender`, AVG(`age`) AS averageAge
FROM `users`
GROUP BY `gender`
ORDER BY `gender` DESC, `averageAge`
```
Result
```js
users = [
  { gender: 'M', averageAge: 46 },
  { gender: 'F', averageAge: 30 },
]
```

---
### Limit and Offset
```js
const users = await xsql()
  .select('`id`, `name`')
  .from('users')
  .limit(1)
  .offset(3)
  .read()
```
Equivalent to the following SQL statement
```sql
SELECT `id`, `name`
FROM `users`
LIMIT 1, 3
```
Result
```js
users = [
  { id: 4, name: 'Kitty' },
]
```
---

### Pagination
```js
const users = await xsql()
  .from('users')
  .pagination({
    currPage: 2,
    step: 8,
  })
  .read()
```

---
### Relationship
```js
const users = await sql()
  .from('users')
  .filter(({ id, name, age }) => ({ id, name, age }))
  .toOne('computer:computers.id', {
    filter: ({ id, name, ip }) => ({ id, name, ip }),
  })
  .toMany('pets:pets.id', {
    filter: ({ id, type, name }) => ({ id, type, name }),
  })
  .fromMany('primaryCar', 'id:cars.user', {
    query: (q) => q.where({ isPrimary: 1 }),
    filter: ({ id, model }) => ({ id, model }),
  })
  .read()
```
Equivalent to the following SQL statement
```sql
# Master Query
SELECT * FROM `users`

# toOne Query
SELECT * FROM `computers` WHERE `id` IN (50, 51)

# toMany Query
SELECT * FROM `pets` WHERE `id` IN (20, 21, 22, 23)

# fromMany Query
SELECT * FROM `cars` WHERE `user` IN (1, 2, 3, 4, 5, 6) AND isPrimary = ?
# fromMany Query Params
# [1]
```
Result
```js
users = [
  {
    id: 1,
    name: 'Tom',
    age: 20,
    computer: {
      id: 50,
      name: 'Windows 10',
      ip: '192.168.1.123',
    },
    pets: [
      { id: 20, type: 'dog', name: 'Foo' },
      { id: 21, type: 'cat', name: 'Bar' },
    ],
    primaryCar: {
      id: 101,
      model: 'Model S'
    },
  },
  {
    id: 2,
    name: 'Peter',
    age: 20,
    computer: null,
    pets: null,
    primaryCar: null,
  },
  ...
]
```
### Insert Row
```js
const newUser = {
  name: 'Bar',
  age: 28,
  computer: 56,
  pets: '69,70',
}
await xsql().insert('users', newUser)
```

### Insert multiple rows in batch mode
```js
const newUsers = [
  { name: 'Foo', age: 28 },
  { name: 'Bar', age: 32 },
]
await xsql().insert('users', newUsers)
```

### Insert or update when exist in batch mode
```js
const newComputers = [
  { id: 50, name: 'Win10', ip: '192.168.1.124' }
  { name: 'MacOS', ip: '192.168.1.125' }
]
await xsql().update('computers', newComputers, {
  primaryKey: 'id',
})
```

### Insert or update when exist in batch summing mode
```js
const wallets = [
  { user: 1, cash: 50 }
  { user: 2, cash: -50 }
]
await xsql().update('wallets', wallets, {
  primaryKey: 'user',
  sumKey: ['cash']
})
```

### Delete Row
```js
await xsql()
  .from('users')
  .where({ id: 1 })
  .delete()
```