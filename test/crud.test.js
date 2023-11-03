const xsql = require('../lib')
const utils = require('./utils')

require('../lib/clients/mysql2')

describe('CRUD', () => {
  const user = {
    name: utils.GetUuid(),
    favorites: null,
    createAt: Date.now(),
  }
  const users = []
  for (let i = 0; i < 10; i++) {
    users.push({
      name: utils.GetUuid(),
      favorites: null,
      createAt: Date.now(),
      amount: 10,
      data: { notification: true },
    })
  }
  const userMap = new Map()
  users.forEach((row) => userMap.set(row.name, row))
  const idMap = new Map()

  beforeAll(async () => {
    xsql.init(utils.sqlConfig)
  })

  afterAll(async () => {
    await xsql()
      .where('name', 'in', [...users.map(u => u.name), user.name])
      .delete('users')
    xsql.close()
  })

  describe('create', () => {
    it('should insert', async () => {
      const result = await xsql().insert('users', user)
      expect(result.insertId).toBeGreaterThan(0)
      expect(result.affectedRows).toBe(1)
      user.id = result.insertId
    })
  })

  describe('read', () => {
    it('should select', async () => {
      const rows = await xsql()
        .where({ id: user.id })
        .read('users')
      expect(rows.length).toBe(1)
      expect(rows[0].id).toBeGreaterThan(0)
      expect(rows[0].name).toBe(user.name)
      expect(rows[0].favorites).toBeNull()
      expect(rows[0].createAt).toBe(user.createAt)
    })
    it('should be Array', async () => {
      const rows = await xsql()
        .where({ id: user.id })
        .read('users')
      expect(rows instanceof Array).toBeTruthy()
      const newRows = rows.map((row) => row)
      expect(newRows instanceof Array).toBeTruthy()
    })
    it('should log when config truthy', async () => {
      const consoleSpy = jest.spyOn(console, 'log')

      await xsql()
        .log(true)
        .where({ id: user.id })
        .read('users')

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()

      await xsql()
        .log(false)
        .where({ id: user.id })
        .read('users')
      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('update', () => {
    it('should submit', async () => {
      user.name = utils.GetUuid()
      const result = await xsql()
        .where({ id: user.id })
        .update('users', { name: user.name })
      expect(result.affectedRows).toBe(1)
      expect(result.changedRows).toBe(1)
    })

    it('should verify', async () => {
      const rows = await xsql()
        .where({ id: user.id })
        .read('users')
      expect(rows.length).toBe(1)
      expect(rows[0].id).toBe(user.id)
      expect(rows[0].name).toBe(user.name)
      expect(rows[0].favorites).toBeNull()
      expect(rows[0].createAt).toBe(user.createAt)
    })
  })

  describe('delete', () => {
    it('should submit', async () => {
      const result = await xsql()
        .where({ id: user.id })
        .delete('users')
      expect(result.affectedRows).toBe(1)
    })

    it('should verify', async () => {
      const rows = await xsql()
        .where({ id: user.id })
        .read('users')
      expect(rows.length).toBe(0)
    })
  })

  describe('batchInsert', () => {

    it('should insert', async () => {
      const result = await xsql().batchInsert('users', users, {
        jsonKeys: ['data'],
      })
      expect(result.affectedRows).toBe(10)
      expect(result.insertId).toBeGreaterThan(0)
    })

    it('should verify', async () => {
      const rows = await xsql()
        .where('name', 'in', users.map((r) => r.name))
        .read('users', {
          jsonKeys: ['data'],
        })
      expect(rows.length).toBe(10)

      rows.forEach((row) => {
        const u = userMap.get(row.name)
        u.id = row.id
        idMap.set(row.id, u)
        expect(u).toBeDefined()
        expect(u).not.toBeNull()
        expect(row.id).toBeGreaterThan(0)
        expect(row.name).toBe(u.name)
        expect(row.favorites).toBeNull()
        expect(row.createAt).toBe(u.createAt)
        expect(row.amount).toBe(10)
        expect(row.data?.notification).toBe(true)
      })
    })

    it('should partially updated', async () => {
      const updateUsers = users
        .filter((u, i) => (i % 2 === 0))
        .map((u) => {
          u.name = utils.GetUuid()
          u.amount = 5
          return u
        })
      const updateUserNames = updateUsers.map(u => u.name)

      const result = await xsql().batchInsert('users', updateUsers, {
        primaryKeys: 'id',
        sumKeys: 'amount',
        jsonKeys: 'data',
      })

      expect(result.info.startsWith('Records: 5  Duplicates: 5')).toBeTruthy()

      const rows = await xsql()
        .where('name', 'in', users.map((r) => r.name))
        .read('users', {
          jsonKeys: ['data'],
        })
      expect(rows.length).toBe(10)

      rows.forEach((row) => {
        const u = idMap.get(row.id)
        expect(u).toBeDefined()
        expect(u).not.toBeNull()
        expect(row.id).toBeGreaterThan(0)
        expect(row.name).toBe(u.name)
        expect(row.favorites).toBeNull()
        expect(row.createAt).toBe(u.createAt)
        expect(row.amount).toEqual(updateUserNames.includes(u.name) ? 15 : 10)
        expect(row.data?.notification).toBe(true)
      })
    })

    it('should throw error', async () => {
      await expect(
        xsql().batchInsert('users', users, { primaryKeys: {} })
      ).rejects.toThrow()

      await expect(
        xsql().batchInsert('users', users, { sumKeys: {} })
      ).rejects.toThrow()

      await expect(
        xsql().batchInsert('users', users, { jsonKeys: {} })
      ).rejects.toThrow()
    })

    it('should delete', async () => {
      const result = await xsql()
        .where('id', 'in', users.map((u) => u.id))
        .delete('users')
      expect(result.affectedRows).toBe(10)
    })
  })
})
