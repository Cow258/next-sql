
# xSQL
# Table of content
- [Introduction](#introduction)
- [Getting Start](#getting-start)
- [Configuration](#configuration)
- [Basic](#basic)
    + [Standard Query](#standard-query)
    + [Fallback Query](#fallback-query)
    + [Fetch from multiple host](#fetch-from-multiple-host)
    + [Load module](#load-module)
- [Examples](#examples)
    + [Read all rows from users table](#read-all-rows-from--users--table)
    + [Read single user](#read-single-user)
    + [Advanced query](#advanced-query)
    + [Row filter](#row-filter)
    + [Group by and Order by](#group-by-and-order-by)
    + [Limit and Offset](#limit-and-offset)
    + [Pagination](#pagination)
    + [Relationship](#relationship)
    + [Insert Row](#insert-row)
    + [Insert multiple rows in batch mode](#insert-multiple-rows-in-batch-mode)
    + [Insert or update when exist in batch mode](#insert-or-update-when-exist-in-batch-mode)
    + [Insert or update when exist in batch summing mode](#insert-or-update-when-exist-in-batch-summing-mode)
    + [Update Row](#update-row)
    + [Update Row in summing mode](#update-row-in-summing-mode)
    + [Delete Row](#delete-row)

# Introduction
`xSQL` is next-gen relationship database connector.\

representing information as a series of JSON-like documents, 
as opposed to the table and row format of relational systems.
the key difference is that the structure of the key/value pairs in a given collection can vary from table to table
This more flexible approach is possible because documents are self-describing.

- Easy to use
- Easy to manage API content
- Out of the box without schema configuration
- Powerful relational table linking
- Powerful filter and SQL statement builder
- Multiple host connections
- Batch insert and update
- Batch update with database-side summing
- Pagination
- Transaction
- Module customization
- Base on [mysqljs/mysql](https://github.com/mysqljs/mysql)

# Getting Start
```sh
npm i xsql
```
OR
```sh
yarn add xsql
```

# Configuration
We will pass your config into `mysql` directly.\
You can find more detail from the following link\
https://github.com/mysqljs/mysql#connection-options
https://github.com/mysqljs/mysql#pool-options

__Options:__\
All config of this level will apply into each hosts.\
Also this config options as same as mysql [connection options](https://github.com/mysqljs/mysql#pool-options) and [pool options](https://github.com/mysqljs/mysql#pool-options).

- `default`: Default key of `hosts`
- `hosts`:
  - `key`: The key of this `host`
  - `value`: The config of this `host` only, all config of this level will override the default config

```js
const sql = require('xsql')
// It will create PoolCluster for each hosts.
sql.init({
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
})
```
# Basic

### Standard Query
```js
const rows = await sql().from('table').read()
```

### Fallback Query
```js
// Will return the origin raw data from mysql node module
const result = await sql().query('SELECT * FROM `user` WHERE id = ?', [5])
```

### Fetch from multiple host
```js
const hostA_tableA_rows = await sql('hostA').from('tableA').read()
const hostB_tableB_rows = await sql('hostB').from('tableB').read()
```

### Load module
[How to build your own module](MODULE.md)
```js
const thirdPartyModule = require('thirdPartyModule')
sql.loadModule(thirdPartyModule)
```

# Examples

### Read all rows from users table
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
  { id: 6, name: 'Kevin', computer: null, pets: '24', gender: 'M', age: 76, birthAt: '1945-01-01T00:00:00.000Z' },
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
We provide a new way to query the database,\
You can focus more on business logic without worrying about creating SQL statements.
- Each `function` or `() => {}` is equivalent to a parenthesis
- Each `where()` is equivalent to `AND`.
- Each `and()` is equivalent to `AND`.
- Each `where()` is equivalent to `and()`.
- Each `or()` is equivalent to `OR`.
- You can also use `and()` and `or()` anywhere
- All connective is in front of conditional
```js
const users = await sql()
  .select('`name`, `age`, DATE_FORMAT(`birthAt`, "%Y") AS birthYear')
  .from('users')
  .where({ isActive: 1, isEnable: 1 })
  .where('pets', 'NOT', null)
  .and(() => {
    this.or(() => {
      this.and('age', 'between', [40, 45])
      this.and('age', 'between', [50, 60])
    })
    this.or('age', 'between', [18, 25])
  })
  .read()
```
Equivalent to the following SQL statement
```sql
SELECT `name`, `age`, DATE_FORMAT(`birthAt`, "%Y") AS birthYear 
FROM `users`
WHERE `isActive` = ? 
AND `isEnable` = ? 
AND `pets` NOT NULL
AND (
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
  { name: 'Mary', age: 42, birthYear: '1979' },
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
const users = await sql()
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
const users = await sql()
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
> Will override the `limit()` and `offset()` settings!
```js
const users = await sql()
  .from('users')
  .pagination({
    // The current page
    currPage: 2,
    // How many rows pre each page
    rowStep: 10,
    // How many pages will shown on the navigation bar
    navStep: 4,
  })
  .read()
```
Result
```js
// Users of current page
users = [...UserObject]

/*
Case 1: Normal
    Current Page : 2
     Total users : 50
Range of user id : 11 to 20
*/
users.pagination = {
  currPage: 2,
  rowStep: 10,
  navStep: 4,
  hasPrev: true,
  hasNext: true,
  nav: {
    start: 1,
    end: 4,
    hasPrev: false,
    hasNext: true,
  },
}

/*
Case 2: Out of range
    Current Page : 6
     Total users : 50
Range of user id : ---
*/
users.pagination = {
  isOutOfRange: true,
  currPage: 6,
  rowStep: 10,
  navStep: 4,
  hasPrev: true,
  hasNext: false,
  nav: {
    start: 5,
    end: 5,
    hasPrev: false,
    hasNext: false,
  },
}
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
    query: (q) => {
      q.select('`id`, `model`')
      q.where({ isPrimary: 1 })
    },
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
SELECT `id`, `model` 
FROM `cars` 
WHERE `user` IN (1, 2, 3, 4, 5, 6)
AND isPrimary = ?
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
---
### Insert Row
```js
const newUser = {
  name: 'Bar',
  age: 28,
  computer: 56,
  pets: '69,70',
}
await sql().insert('users', newUser)
```

### Insert multiple rows in batch mode
```js
const newUsers = [
  { name: 'Foo', age: 28 },
  { name: 'Bar', age: 32 },
]
await sql().insert('users', newUsers)
```

### Insert or update when exist in batch mode
```js
const newComputers = [
  { id: 50, name: 'Win10', ip: '192.168.1.124' }
  { name: 'MacOS', ip: '192.168.1.125' }
]
await sql().update('computers', newComputers, {
  primaryKey: 'id',
})
```

### Insert or update when exist in batch summing mode
```js
const wallets = [
  { user: 1, cash: 50 }
  { user: 2, cash: -50 }
]
await sql().update('wallets', wallets, {
  primaryKey: 'user',
  sumKey: ['cash']
})
```
---
### Update Row
```js
await sql()
  .from('users')
  .where({ id: 1 })
  .update({
    name: 'Tom',
  })
```

### Update Row in summing mode
```js
await sql()
  .from('users')
  .where({ id: 1 })
  .update({
    name: 'Tom',
    cash: 50,
  }, {
    sumKey: ['cash']
  })
```
---
### Delete Row
```js
await sql()
  .from('users')
  .where({ id: 1 })
  .delete()
```