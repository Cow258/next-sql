
# next-sql
💪🏻💪🏻💪🏻💪🏻💪🏻💪🏻💪🏻💪🏻💪🏻\
We are working in progress now!\
🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️🏃🏻‍♂️

[See more detail here](https://github.com/Cow258/next-sql/projects/1)
# Table of content
- [🎉 Introduction](#---introduction)
- [🚀 Getting Start](#---getting-start)
- [⚙️ Configuration](#---configuration)
- [💖 Basic](#---basic)
    + [Standard Query](#standard-query)
    + [Fallback Query](#fallback-query)
    + [Fetch from multiple host](#fetch-from-multiple-host)
    + [Load module](#load-module)
- [📚 Examples](#---examples)
    + [Read all rows from users table](#read-all-rows-from-users-table)
    + [Read single user](#read-single-user)
    + [Advanced query](#advanced-query)
    + [Row filter](#row-filter)
    + [Group by and Order by](#group-by-and-order-by)
    + [Limit and Offset](#limit-and-offset)
    + [Pagination](#pagination)
    + [Relationship](#relationship)
      - [Mapper syntax](#mapper-syntax)
      - [toOne(mapper, options)](#toone-mapper--options-)
      - [toMany(mapper, options)](#tomany-mapper--options-)
      - [fromOne(addonKey, mapper, options)](#fromone-addonkey--mapper--options-)
      - [fromMany()](#frommany--)
      - [Example](#example)
    + [Insert Row](#insert-row)
    + [Insert multiple rows in batch mode](#insert-multiple-rows-in-batch-mode)
    + [Insert or update when exist in batch mode](#insert-or-update-when-exist-in-batch-mode)
    + [Insert or update when exist in batch summing mode](#insert-or-update-when-exist-in-batch-summing-mode)
    + [Update Row](#update-row)
    + [Update Row in summing mode](#update-row-in-summing-mode)
    + [Update all rows of table](#update-all-rows-of-table)
    + [Delete Row](#delete-row)
    + [Delete all rows of table](#delete-all-rows-of-table)
    + [Transaction](#transaction)

# 🎉 Introduction
`next-sql` is next-gen relationship database connector.

- Easy to use
- Write less, Do more
- Easy to manage API content and data
- Out of the box, No schema configuration before using
- Powerful relational table linking
- Powerful filter and SQL statement builder
- Multiple host connections
- Batch insert and update
- Batch update with summation on the database side
- Pagination with navigation bar
- Transaction support
- Module customization
- Base on [mysqljs/mysql](https://github.com/mysqljs/mysql)

> 🏃🏻‍♂️ Working on progress...\
> [See more detail](https://github.com/Cow258/next-sql/projects)
> - Module customization
> - To support more databases in the future, such as Postgres, MSSQL, MariaDB, SQLite3, Oracle, Amazon Redshift
> - To support One from Many

# 🚀 Getting Start
```sh
npm i next-sql
```
OR
```sh
yarn add next-sql
```

# ⚙️ Configuration
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
const nsql = require('next-sql')
// It will create PoolCluster for each hosts.
nsql.init({
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
# 💖 Basic

### Standard Query
```js
const rows = await nsql().read('table')
```

### Fallback Query
```js
// Will return the origin raw data from mysql node module
const result = await nsql().query('SELECT * FROM `user` WHERE id = ?', [5])
```

### Fetch from multiple host
```js
const hostA_tableA_rows = await nsql('hostA').read('tableA')
const hostB_tableB_rows = await nsql('hostB').read('tableB')
```

### Load module
[How to build your own module](MODULE.md)
```js
const thirdPartyModule = require('thirdPartyModule')
nsql.loadModule(thirdPartyModule)
```

# 📚 Examples

### Read all rows from users table
```js
const users = await nsql().read('users')
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
__Example:__
```js
const [ user ] = await nsql()
  .where({ id: 5 })
  .read('users')
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
- Each `function` or `(q) => {}` is equal to a bracket `()`
- The `q` is current instance, it only required when first bracket `()`
- Each `where()` is equal to `AND`.
- Each `and()` is equal to `AND`.
- Each `or()` is equal to `OR`.
- You can also use `where()` and `and()` and `or()` anywhere
- All connective (`AND`/`OR`) will render in front of the conditional

__Example:__
```js
const users = await nsql()
  .select('`name`, `age`, DATE_FORMAT(`birthAt`, "%Y") AS birthYear')
  .where({ isActive: 1, isEnable: 1 })
  .where('pets', 'NOT', null)
  .and(q => {
    q.or(() => {
      q.and('age', 'between', [40, 45])
      q.and('age', 'between', [50, 60])
    })
    q.or('age', 'between', [18, 25])
  })
  .read('users')
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
__Example:__
```js
const users = await nsql()
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
  .read('users')
```
Equivalent to the following SQL statement
```sql
SELECT * FROM `users` WHERE `id` = 1
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
__Example:__
```js
const users = await nsql()
  .select('`gender`, AVG(`age`) AS averageAge')
  .groupBy('`gender`')
  .orderBy('`gender` DESC, `averageAge`')
  .read('users')
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
__Example:__
```js
const users = await nsql()
  .select('`id`, `name`')
  .limit(1)
  .offset(3)
  .read('users')
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
Automatically manage pagination.

__Demo:__
- [React]()
- [Handlebar]()

> Will override the `limit()` and `offset()` settings!

> Only can use with `read()`

__Example:__
```js
const users = await nsql()
  .pagination({
    // The current page
    currPage: 2,
    // How many rows pre each page
    rowStep: 10,
    // How many pages will shown on the navigation bar
    navStep: 4,
  })
  .read('users')
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
- Use RDS like No-SQL
- No longer need to use JOIN TABLE
- Construct the data model directly from the query
- Non-blocking asynchronous table rows mapper

#### Mapper syntax
`{currentKey}`__:__`{targetTable}`__.__`{targetKey}`
- `currentKey`: The key of current table you want to map
- `targetTable`: Which table do you want to map?
- `targetKey`: The key of the targer table

Example:

When mapping computer into user

__Users Table__ (Current Table)
| id | name | computer |
|----|------|----------|
| 1  | Tom  | 50       |

__Computers Table__ (Target Table)
| id | name  | ip            |
|----|-------|---------------|
| 50 | Win10 | 192.168.0.123 |
```js
await nsql()
  .toOne('computer:computers.id')
  .read('users')
```

#### toOne(mapper, options)
Each row linked to one foreign item

Parameters:
- `mapper`: The mapper string
- `options`: The options for this relationship mapping
  - `filter`: `(row) => (row)`\
    Each incoming row will be replaced by this function,\
    async function is not allowed.
  - `query`: `(q) => {}`\
    The `q` of the callback is a new instance of `nsql()`,\
    you can do any addition query you want,\
    also you can do unlimited layer relationship.

#### toMany(mapper, options)
Each row linked to many foreign items

Parameters:
- `mapper`: The mapper string
- `options`: The options for this relationship mapping
  - `splitter`: `','` || `'json[]'` || `'json.key'`\
    You can customize the separation character,\
    or using `JSON` to provide the mapping data.\
    `JSON` must eventually return `string[]` or `number[]` or `null`
  - `filter`: `(row) => (row)`\
    Each incoming row will be replaced by this function,\
    async function is not allowed.
  - `query`: `(q) => {}`\
    The `q` of the callback is a new instance of `nsql()`,\
    you can do any addition query you want,\
    also you can do unlimited layer relationship.

#### fromOne(addonKey, mapper, options)
Each foreign items linked to one current row

Parameters:
- `addonKey`: You must provide the key for store all incoming data, this key will add to the end of current row object
- `mapper`: The mapper string
- `options`: The options for this relationship mapping
  - `filter`: `(row) => (row)`\
    Each incoming row will be replaced by this function,\
    async function is not allowed.
  - `query`: `(q) => {}`\
    The `q` of the callback is a new instance of `nsql()`,\
    you can do any addition query you want,\
    also you can do unlimited layer relationship.

#### fromMany()
> __🔄 Coming Soon...__\
> Not supported at this moment.\
> Maybe it will be supported in some days of the future.

#### Example
```js
const users = await nsql()
  .filter(({ id, name, age }) => ({ id, name, age }))
  .toOne('computer:computers.id', {
    filter: ({ id, name, ip }) => ({ id, name, ip }),
  })
  .toMany('pets:pets.id', {
    filter: ({ id, type, name }) => ({ id, type, name }),
  })
  .fromOne('primaryCar', 'id:cars.user', {
    query: (q) => {
      q.select('`id`, `model`')
      q.where({ isPrimary: 1 })
      q.toOne('brand:brands.id', {
        filter: ({ id, name } => ({ id, name }))
      })
    },
    filter: ({ id, model }) => ({ id, model }),
  })
  .read('users')
```
Equivalent to the following SQL statement
```sql
# Master Query
SELECT * FROM `users`

# toOne Query
SELECT * FROM `computers` WHERE `id` IN (50, 51)

# toMany Query
SELECT * FROM `pets` WHERE `id` IN (20, 21, 22, 23)

# fromOne Query
SELECT `id`, `model` 
FROM `cars` 
WHERE `user` IN (1, 2, 3, 4, 5, 6)
AND isPrimary = 1

# toOne query inside fromOne query
SELECT * FROM `brand` WHERE `id` = 25
```
Result
```js
users = [
  {
    id: 1,
    name: 'Tom',
    age: 20,
    // toOne()
    computer: {
      id: 50,
      name: 'Windows 10',
      ip: '192.168.1.123',
    },
    // toMany()
    pets: [
      { id: 20, type: 'dog', name: 'Foo' },
      { id: 21, type: 'cat', name: 'Bar' },
    ],
    // fromOne()
    primaryCar: [
      {
        id: 101,
        model: 'Model S',
        // toOne()
        brand: {
          id: 25,
          name: 'Tesla',
        },
      },
    ],
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
await nsql().insert('users', newUser)
```

### Insert multiple rows in batch mode
> __🚫 Pay Attention 🚫__
> - The key length of each row must be the same
> - The order of the keys must be the same
```js
const newUsers = [
  { name: 'Foo', age: 28 },
  { name: 'Bar', age: 32 },
]
await nsql().batchInsert('users', newUsers)
```

### Insert or update when exist in batch mode
> __🚫 Pay Attention 🚫__
> - The key length of each row must be the same
> - The order of the keys must be the same
```js
const newComputers = [

  // Insert record
  { id: null, name: 'MacOS', ip: '192.168.1.125' }

  // Update record
  { id: 50, name: 'Win10', ip: '192.168.1.124' }

  /* 🚫 Will throw errors due to different key lengths 🚫
  { name: 'Win10', ip: '192.168.1.124' } */

  /* 🚫 Will update the wrong data due to different key order 🚫
  { ip: '192.168.1.124', name: 'Win10', id: 50, name } */
]
await nsql().batchInsert('computers', newComputers, {
  primaryKey: 'id',
})
```

### Insert or update when exist in batch summing mode
> __🚫 Pay Attention 🚫__
> - The key length of each row must be the same
> - The order of the keys must be the same
```js
const wallets = [
  { user: 1, cash: 50 }
  { user: 2, cash: -50 }
]
await nsql().batchInsert('wallets', wallets, {
  primaryKey: 'user',
  sumKey: ['cash']
})
```
---
### Update Row
```js
await nsql()
  .where({ id: 1 })
  .update('users', {
    name: 'Tom',
  })
```

### Update Row in summing mode
```js
await nsql()
  .where({ id: 1 })
  .update('users', {
    name: 'Tom',
    cash: 50,
  }, {
    sumKey: ['cash']
  })
```

### Update all rows of table
```js
await nsql().update('users', { wallet: 0 })
```
---

### Delete Row
```js
await nsql().where({ id: 1 }).delete('users')
```

### Delete all rows of table
```js
await nsql().delete('users')
```
---

### Transaction
- `Commit`\
  When callback return
- `Rollback`\
  When error throw
```js
// [Tom] transfers $50 to [Mary]
const tomId = 1
const maryId = 2
const amount = 50;
await nsql().transaction(async (t) => {
  // Extract $50 from Tom
  await t()
    .where({ id: tomId })
    .update(
      'users', 
      { wallet: -amount }, // <- negative number
      { sumKey: ['wallet'] },
    )

  // Read the value of Tom wallet
  const [tom] = await t()
    .where({ id: tomId })
    .read('users')
  
  // Rollback when not enough money
  if (tom.wallet < 0) {
    throw new Error('Not enough money')
  }

  // Deposit $50 into Mary
  await t()
    .where({ id: maryId })
    .update(
      'users', 
      { wallet: amount }, 
      { sumKey: ['wallet'] },
    )

  // Log into database
  const logAt = Date.now()
  await t().batchInsert('walletLogs', [
    { type: 'EXTRACT', user: tomId, change: -amount, logAt }
    { type: 'DEPOSIT', user: maryId, change: amount, logAt }
  ])
})
```
