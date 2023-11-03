const xsql = require('../lib')
const utils = require('./utils')

require('../clients/mysql2')
require('console.table')

describe('Read', () => {
  const favSet = [
    '1,2',
    '2,3',
    '3,4',
  ]
  const users = utils.GenArray(0, 10).map((v, i) => ({
    name: utils.GetUuid(),
    createAt: i % 5 ? Date.now() : null,
    gender: i % 2 === 0 ? 'M' : 'F',
    age: i + 20,
    amount: i * 10,
    favorites: favSet[i % 3],
    data: { notification: true },
  }))
  const names = users.map(u => u.name)
  // console.table(users)

  beforeAll(async () => {
    xsql.init(utils.sqlConfig)
    await xsql().batchInsert('users', users, {
      jsonKeys: ['data'],
    })
  })

  afterAll(async () => {
    await xsql()
      .where('name', 'in', names)
      .delete('users')
    xsql.close()
  })

  describe('operator', () => {
    it('should select', async () => {
      let rows = await xsql()
        .select(['name', 'age'])
        .where({ age: 20 })
        .read('users')
      expect(rows.length).toBe(1)
      expect(rows[0]).toEqual(expect.objectContaining({
        name: users[0].name,
        age: users[0].age,
      }))
      expect(Object.keys(rows[0])).toEqual(['name', 'age'])

      rows = await xsql()
        .select('name,age')
        .where({ age: 20 })
        .read('users')
      expect(rows.length).toBe(1)
      expect(rows[0]).toEqual(expect.objectContaining({
        name: users[0].name,
        age: users[0].age,
      }))
      expect(Object.keys(rows[0])).toEqual(['name', 'age'])
    })

    it('should correct', async () => {
      let rows = await xsql()
        .where('age', 'between', [22, 27])
        .where('name', 'in', names)
        .orderBy('age')
        .read('users')
      expect(rows.length).toBe(6)
      expect(rows[0].age).toBe(22)
      expect(rows[5].age).toBe(27)

      rows = await xsql()
        .where('age', 'not between', [22, 27])
        .where('name', 'in', names)
        .orderBy('age')
        .read('users')
      expect(rows.length).toBe(4)
      expect(rows[0].age).toBe(20)
      expect(rows[3].age).toBe(29)

      rows = await xsql()
        .where('favorites', 'find_in_set', '1')
        .where('name', 'in', names)
        .orderBy('age')
        .read('users')
      expect(rows.length).toBe(4)
      expect(rows[0].age).toBe(20)
      expect(rows[1].age).toBe(23)
      expect(rows[2].age).toBe(26)
      expect(rows[3].age).toBe(29)

      rows = await xsql()
        .where('createAt', 'is', null)
        .where('name', 'in', names)
        .orderBy('age')
        .read('users')
      expect(rows.length).toBe(2)

      rows = await xsql()
        .where('createAt', 'is not', null)
        .where('name', 'in', names)
        .orderBy('age')
        .read('users')
      expect(rows.length).toBe(8)
    })
  })

  describe('nested where', () => {
    it('should correct', async () => {
      const rows = await xsql()
        .where('age', 'between', [22, 27])
        .and(q => q
          .or({ amount: 30 })
          .or({ amount: 60 }))
        .and({ gender: 'M' })
        .read('users')
      expect(rows.length).toBe(1)
      expect(rows[0].age).toBe(26)
      expect(rows[0].amount).toBe(60)
    })
  })

  describe('filter', () => {
    it('should correct', async () => {
      const rows = await xsql()
        .where({ gender: 'M' })
        .where('name', 'in', names)
        .filter(async (row) => {
          await utils.Sleep(10)
          row.isMale = true
          return row
        })
        .read('users', {
          jsonKeys: ['data'],
        })
      expect(rows.length).toBe(5)
      expect(rows.every(row => row.isMale)).toBeTruthy()
    })
  })

  describe('map', () => {
    it('should correct', async () => {
      const rows = await xsql()
        .where({ gender: 'M' })
        .where('name', 'in', names)
        .filter(async (row) => {
          await utils.Sleep(10)
          row.isFiltered = true
          return row
        })
        .map(async (row) => {
          await utils.Sleep(10)
          expect(row.isFiltered).toBeTruthy()
          row.isMale = true
          return row
        })
        .read('users', {
          jsonKeys: ['data'],
        })
      expect(rows.length).toBe(5)
      expect(rows.every(row => row.isMale)).toBeTruthy()
      expect(rows.every(row => row.isFiltered)).toBeTruthy()
    })
  })

  describe('group by', () => {
    it('should correct', async () => {
      const rows = await xsql()
        .select('tag, count(*) as count')
        .groupBy('tag')
        .read('items')
      expect(rows.length).toBe(3)
      expect(rows[0].tag).toBe('a')
      expect(rows[0].count).toBe(33)
      expect(rows[1].tag).toBe('b')
      expect(rows[1].count).toBe(33)
      expect(rows[2].tag).toBe('c')
      expect(rows[2].count).toBe(33)
    })
  })

  describe('order by', () => {
    it('should correct', async () => {
      let rows = await xsql()
        .orderBy('id')
        .read('items')
      expect(rows[0].id).toBe(0)
      expect(rows[rows.length - 1].id).toBe(98)

      rows = await xsql()
        .orderBy('id desc')
        .read('items')
      expect(rows[0].id).toBe(98)
      expect(rows[rows.length - 1].id).toBe(0)

      rows = await xsql()
        .orderBy('tag desc')
        .read('items')
      expect(rows[0].tag).toBe('c')
    })
  })

  describe('limit & offset', () => {
    it('should correct', async () => {
      let rows = await xsql()
        .orderBy('id')
        .limit(10)
        .read('items')
      expect(rows.length).toBe(10)
      expect(rows[0].id).toBe(0)

      rows = await xsql()
        .orderBy('id')
        .limit(10)
        .offset(10)
        .read('items')
      expect(rows.length).toBe(10)
      expect(rows[0].id).toBe(10)
    })
  })

  describe('statement', () => {
    it('should correct', async () => {
      const statement = xsql()
        .select('id,name')
        .where({ name: 'foo' })
        .orderBy('age')
        .limit(2)
        .offset(3)
        .toStatement('read', 'users')
      expect(statement[0]).toBe('SELECT id,name FROM users WHERE `name` = ? ORDER BY age LIMIT 3 , 2')
      expect(statement[1]).toEqual(['foo'])
      const raw = statement.toRaw()
      expect(raw).toBe('SELECT id,name FROM users WHERE `name` = \'foo\' ORDER BY age LIMIT 3 , 2')
    })
  })

  describe('extend', () => {
    it('should correct', async () => {
      const olderUser = (sql = xsql()) => (
        sql.where('age', '>', 25)
      )

      const rows = await xsql()
        .extend(olderUser)
        .read('users')
      expect(rows.length).toBe(4)
      expect(rows.every(row => row.age > 25)).toBeTruthy()
    })
  })
})
