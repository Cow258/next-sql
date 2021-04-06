
# next-sql
> ### ⚠️⚠️⚠️ Attention ⚠️⚠️⚠️
> The project is still in the pre-alpha stage\
> 🏃🏻‍♂️ We are working in progress now... 💪🏻

For more detail, please [see v1.0.0 roadmap](https://github.com/Cow258/next-sql/projects/1)

# Table of content
- [🎉 Introduction](#introduction)
- [🚀 Getting Start](#getting-start)
- [⚙️ Configuration](#configuration)
- [💖 Basic](#basic)
    + [Import](#import)
    + [Standard Query](#standard-query)
    + [Fallback Query](#fallback-query)
    + [Fetch from multiple host](#fetch-from-multiple-host)
    + [Load module](#load-module)
- [📚 Examples](#examples)
    + [Read all rows from users table](#read-all-rows-from-users-table)
    + [Read single user](#read-single-user)
    + [Advanced query](#advanced-query)
    + [JSON Support](#json-support)
    + [Row filter](#row-filter)
    + [Group by and Order by](#group-by-and-order-by)
    + [Limit and Offset](#limit-and-offset)
    + [Pagination](#pagination)
    + [Relationship](#relationship)
      - [Mapper syntax](#mapper-syntax)
      - [toOne(mapper, options)](#toone)
      - [toMany(mapper, options)](#tomany)
      - [fromOne(addonKey, mapper, options)](#fromone)
      - [fromMany()](#frommany)
      - [Example](#relationship-example)
    + [Insert Row](#insert-row)
    + [Insert multiple rows in batch mode](#insert-multiple-rows-in-batch-mode)
    + [Insert or update when exist in batch mode](#insert-or-update-when-exist-in-batch-mode)
    + [Insert or update when exist in batch summing mode](#insert-or-update-when-exist-in-batch-summing-mode)
    + [Update Row](#update-row)
    + [Update Single Row in summing mode](#update-single-sum)
    + [Update all rows of table](#update-all-rows-of-table)
    + [Delete Row](#delete-row)
    + [Delete all rows of table](#delete-all-rows-of-table)
    + [Transaction](#transaction)

# 🎉 Introduction <a name="introduction"></a>
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
> [See our roadmap](https://github.com/Cow258/next-sql/projects)
> - Module customization
> - To support more databases in the future, such as Postgres, MSSQL, MariaDB, SQLite3, Oracle, Amazon Redshift
> - To support One from Many

# 🚀 Getting Start <a name="getting-start"></a>
```sh
npm i -S next-sql
```
OR
```sh
yarn add next-sql
```

# ⚙️ Configuration <a name="configuration"></a>
We will pass your config into `mysql` directly.\
You can find more detail from the following link

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
const xsql = require('next-sql')
// It will create PoolCluster for each hosts.
xsql.init({
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
# 💖 Basic <a name="basic"></a>
### Import

```js
const xsql = require('next-sql')
```
### Standard Query

```js
const rows = await xsql().read('table')
```

### Fallback Query
```js
// Will return the origin raw data from mysql node module
const result = await xsql().query('SELECT * FROM `user` WHERE id = ?', [5])
```

### Fetch from multiple host
```js
const hostA_tableA_rows = await xsql('hostA').read('tableA')
const hostB_tableB_rows = await xsql('hostB').read('tableB')
```

### Load module
> ⚠️ Not yet support in this moment

> 🏃🏻‍♂️ Working on progress...
```js
const thirdPartyModule = require('thirdPartyModule')
xsql.loadModule(thirdPartyModule)
```

# 📚 Examples <a name="examples"></a>

### Read all rows from users table
```js
const users = await xsql().read('users')
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
const [ user ] = await xsql()
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
const users = await xsql()
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

### JSON Support
We also provide JSON support

__Syntax:__
- `{fieldName}.{jsonKey}.{jsonKey}`\
  Extract value of JSON object that should be `string`, `number`, `boolean`, `null`
- `{fieldName}[]` || `{fieldName}.{jsonKey}[]`\
  Extract JSON array that should be `string[]`, `number[]`, `null`

```js
// Only return the match records
const users = await xsql()
  .where({ 'notificationSetting.enable': true })
  .and('joinedGroups.id', 'in', [56, 57, 58])
  .or('joinedChannel[]', 'find_in_set', 101)
  .read('users')


// Auto parse into javascript object
const [user] = await xsql()
  .read('users', {
    jsonKeys: ['notificationSetting']
  })
// Output
user.notificationSetting = {
  enable: true,
  promotion: true,
}


// Extract JSON value
const [user] = await xsql()
  .select('notificationSetting.enable as notifyEnable')
  .read('users')
// Output
user.notifyEnable = true


// Insert or Update or BatchInsert
// Will auto apply JSON.stringify
const [user] = await xsql().insert('table', data, {
  jsonKeys: ['fieldName']
})
const [user] = await xsql().update('table', data, {
  jsonKeys: ['fieldName']
})
const [user] = await xsql().batchInsert('table', data, {
  jsonKeys: ['fieldName']
})
```

---

### Row filter
__Example:__
```js
const users = await xsql()
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
const users = await xsql()
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
const users = await xsql()
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
- Next.js (React) `🏃🏻‍♂️ Working on progress...`
- Node.js + Express `🏃🏻‍♂️ Working on progress...`

> Will override the `limit()` and `offset()` settings!

> Only can use with `read()`

__Example:__
```js
const users = await xsql()
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
    Current Page : 6
     Total users : 100
Range of user id : 51 to 60
*/
users.pagination = {
  isOutOfRange: false,
  currPage: 6,
  rowStep: 10,
  navStep: 4,
  row: {
    record: { from: 51, to: 60 },
    index: { from: 50, to: 59 }
    },
  page: {
    from: 5,
    current: 6,
    to: 8,
    hasPrev: true,
    hasNext: true,
  },
  nav: {
    current: 2,
    hasPrev: true,
    hasNext: true,
    buttons: [
      { value: 5, label: '«', className: 'page-prev' },
      { value: 4, label: '...', className: 'nav-prev' },
      { value: 5, label: '5', className: '' },
      { value: 6, label: '6', className: 'current active' },
      { value: 7, label: '7', className: '' },
      { value: 8, label: '8', className: '' },
      { value: 9, label: '...', className: 'nav-next' },
      { value: 7, label: '»', className: 'page-next' }
    ]
  }
}

/*
Case 2: Out of range
    Current Page : 11
     Total users : 100
Range of user id : ---
*/
users.pagination = {
  isOutOfRange: true,
  currPage: 11,
  rowStep: 10,
  navStep: 4,
  row: {
    record: { from: 101, to: 110 },
    index: { from: 100, to: 109 },
  },
  page: {
    from: 9,
    current: 11,
    to: 10,
    hasPrev: true,
    hasNext: false,
  },
  nav: {
    current: 3,
    hasPrev: true,
    hasNext: false,
    buttons: [
      { value: 10, label: '«', className: 'page-prev' },
      { value: 8, label: '...', className: 'nav-prev' },
      { value: 9, label: '9', className: '' },
      { value: 10, label: '10', className: '' },
      { value: 12, label: '»', className: 'page-next disabled' }
    ]
  }
}
```

---
### Relationship
- Use RDS like No-SQL
- No longer need to use JOIN TABLE
- Construct the data model directly from the query
- Non-blocking asynchronous table rows mapper

#### Mapper syntax
`{currentField}`__:__`{targetTable}`__.__`{targetField}`
- `currentField`: The field name of current table you want to map
- `targetTable`: Which table do you want to map?
- `targetField`: The field name of the targer table

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
await xsql()
  .toOne('computer:computers.id')
  .read('users')
```

#### toOne(mapper, options) <a name="toone"></a>
Each row linked to one foreign item

Parameters:
- `mapper`: The mapper string
- `options`: The options for this relationship mapping
  - `filter`: `(row) => (row)`\
    Each incoming row will be replaced by this function,\
    async function is not allowed.
  - `query`: `(q) => {}`\
    The `q` of the callback is a new instance of `xsql()`,\
    you can do any addition query you want,\
    also you can do unlimited layer relationship.
  - `addonKey`\
    You can provide the key for store all incoming data, this key will add to the end of current row object
  - `omitMapperKey`: `[default=false]`\
    Auto remove the mapping key from fetched rows.

#### toMany(mapper, options) <a name="tomany"></a>
Each row linked to many foreign items

Parameters:
- `mapper`: The mapper string
- `options`: The options for this relationship mapping
  - `splitter`: `','` || `'$[]'` || `'$.key.key[]'`\
    You can customize the separation character,\
    or using `JSON` to provide the mapping data.\
    `JSON` must eventually return `string[]` or `number[]` or `null`
    - `'$[]'`\
      The current field is JSON array
    - `'$.key.key[]'`\
      The current field is JSON object and find the specify array by provided key\
      e.g. `$.too[]` the `too` is JSON array\
      e.g. `$.foo.bar[]` the `bar` is JSON array
  - `filter`: `(row) => (row)`\
    Each incoming row will be replaced by this function,\
    async function is not allowed.
  - `query`: `(q) => {}`\
    The `q` of the callback is a new instance of `xsql()`,\
    you can do any addition query you want,\
    also you can do unlimited layer relationship.
  - `addonKey`\
    You can provide the key for store all incoming data, this key will add to the end of current row object
  - `omitMapperKey`: `[default=false]`\
    Auto remove the mapping key from fetched rows.

#### fromOne(addonKey, mapper, options) <a name="fromone"></a>
Each foreign items linked to one current row

Parameters:
- `addonKey`: You must provide the key for store all incoming data, this key will add to the end of current row object
- `mapper`: The mapper string
- `options`: The options for this relationship mapping
  - `filter`: `(row) => (row)`\
    Each incoming row will be replaced by this function,\
    async function is not allowed.
  - `query`: `(q) => {}`\
    The `q` of the callback is a new instance of `xsql()`,\
    you can do any addition query you want,\
    also you can do unlimited layer relationship.
  - `omitMapperKey`: `[default=false]`\
    Auto remove the mapping key from fetched rows.

#### fromMany() <a name="frommany"></a>
> __🔄 Coming Soon...__\
> Based on performance considerations temporarily not supported.\
> Maybe it will be supported in some days of the future.

#### Example <a name="relationship-example"></a>
```js
const users = await xsql()
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
await xsql().insert('users', newUser)
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
await xsql().batchInsert('users', newUsers)
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
await xsql().batchInsert('computers', newComputers, {
  primaryKeys: 'id',
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
await xsql().batchInsert('wallets', wallets, {
  primaryKeys: 'user',
  sumKeys: ['cash']
})
```
---
### Update Row
```js
await xsql()
  .where({ id: 1 })
  .update('users', {
    name: 'Tom',
  })
```

### Update Single Row in summing mode <a name="update-single-sum"></a>
> ⚠️ Not yet support in this moment

> 🏃🏻‍♂️ Working on progress...
```js
await xsql()
  .where({ id: 1 })
  .update('users', {
    name: 'Tom',
    cash: 50,
  }, {
    sumKeys: ['cash']
  })
```

### Update all rows of table
```js
await xsql().update('users', { wallet: 0 })
```
---

### Delete Row
```js
await xsql().where({ id: 1 }).delete('users')
```

### Delete all rows of table
```js
await xsql().delete('users')
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
await xsql().transaction(async (t) => {
  // Extract $50 from Tom
  await t()
    .where({ id: tomId })
    .update(
      'users', 
      { wallet: -amount }, // <- negative number
      { sumKeys: ['wallet'] },
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
      { sumKeys: ['wallet'] },
    )

  // Log into database
  const logAt = Date.now()
  await t().batchInsert('walletLogs', [
    { type: 'EXTRACT', user: tomId, change: -amount, logAt }
    { type: 'DEPOSIT', user: maryId, change: amount, logAt }
  ])
})
```
