const mysql2 = require('mysql2')

const xsql = require('../lib')

require('../clients/mysql2')

function spyPool() {
  return jest.spyOn(mysql2, 'createPoolCluster')
}

function okPacket(overrides = {}) {
  return {
    affectedRows: 1,
    changedRows: 1,
    insertId: 0,
    fieldCount: 0,
    ...overrides,
  }
}

describe('capture', () => {
  it('records update sql and params without init or a pool', async () => {
    const createPoolCluster = spyPool()
    const t = xsql.capture(async ({ cmd }) => {
      if (cmd === 'update') return okPacket()
      throw new Error(`unhandled cmd ${cmd}`)
    })

    const result = await t()
      .where({ id: 1 })
      .update('users', { name: 'Ada' })

    expect(result.affectedRows).toBe(1)
    expect(t.statements).toHaveLength(1)
    expect(t.statements[0].cmd).toBe('update')
    expect(t.statements[0].table).toBe('users')
    expect(t.statements[0].sql).toBe('UPDATE users SET `name` = ? WHERE `id` = ?')
    expect(t.statements[0].params).toEqual(['Ada', 1])
    expect(createPoolCluster).not.toHaveBeenCalled()
    createPoolCluster.mockRestore()
  })

  it('records insert sql, params, and toRaw', async () => {
    const t = xsql.capture(async ({ cmd }) => {
      if (cmd === 'insert') return okPacket({ insertId: 7 })
      throw new Error(`unhandled cmd ${cmd}`)
    })

    const result = await t().insert('users', { name: 'Ada' })

    expect(result.insertId).toBe(7)
    expect(t.statements[0].sql).toBe('INSERT INTO users SET ?')
    expect(t.statements[0].params).toEqual([{ name: 'Ada' }])
    expect(t.statements[0].toRaw()).toBe('INSERT INTO users SET `name` = \'Ada\'')
  })

  it('compiles IN lists with toRaw quoting', async () => {
    const t = xsql.capture(async ({ cmd }) => {
      if (cmd === 'read') return []
      throw new Error(`unhandled cmd ${cmd}`)
    })

    await t().where('id', 'in', [1, 2]).read('users')

    expect(t.statements[0].sql).toBe('SELECT * FROM users WHERE `id` in (?,?) ')
    expect(t.statements[0].params).toEqual([1, 2])
    expect(t.statements[0].toRaw()).toBe('SELECT * FROM users WHERE `id` in (1,2) ')
  })

  it('records this.query as cmd query', async () => {
    const t = xsql.capture(async ({ cmd }) => {
      if (cmd === 'query') return [{ ok: 1 }]
      throw new Error(`unhandled cmd ${cmd}`)
    })

    const rows = await t().query('SELECT 1', [])

    expect(rows).toEqual([{ ok: 1 }])
    expect(t.statements[0].cmd).toBe('query')
    expect(t.statements[0].sql).toBe('SELECT 1')
    expect(t.statements[0].params).toEqual([])
    expect(t.statements[0].table).toBeUndefined()
  })

  it('runs transaction callback without a pool', async () => {
    const createPoolCluster = spyPool()
    const t = xsql.capture(async ({ cmd }) => {
      if (cmd === 'update') return okPacket()
      throw new Error(`unhandled cmd ${cmd}`)
    })

    await t().transaction(async (tx) => {
      await tx().where({ id: 1 }).update('users', { name: 'Bob' })
    })

    expect(t.statements[0].cmd).toBe('update')
    expect(t.statements[0].params).toEqual(['Bob', 1])
    expect(createPoolCluster).not.toHaveBeenCalled()
    createPoolCluster.mockRestore()
  })

  it('throws when the executor does not handle a cmd', async () => {
    const t = xsql.capture(async ({ cmd }) => {
      throw new Error(`unhandled cmd ${cmd}`)
    })

    await expect(t().delete('users')).rejects.toThrow('unhandled cmd delete')
  })

  describe('relation', () => {
    function seedExecutor(tables) {
      return async ({ cmd, table }) => {
        if (cmd === 'read') return (tables[table] || []).map((row) => ({ ...row }))
        throw new Error(`unhandled cmd ${cmd}`)
      }
    }

    it('toOne attaches nested rows on the same capture t', async () => {
      const createPoolCluster = spyPool()
      const t = xsql.capture(seedExecutor({
        products: [{ id: 'p1', shop: 's1', name: 'Widget' }],
        shops: [{ id: 's1', name: 'Acme' }],
      }))

      const rows = await t()
        .where({ id: 'p1' })
        .toOne('shop:shops.id')
        .read('products')

      expect(rows).toHaveLength(1)
      expect(rows[0].shop).toEqual({ id: 's1', name: 'Acme' })
      expect(t.statements.map((s) => s.cmd)).toEqual(['read', 'read'])
      expect(t.statements[0].table).toBe('products')
      expect(t.statements[1].table).toBe('shops')
      expect(t.statements[1].sql).toBe('SELECT * FROM shops WHERE `id` in (?) ')
      expect(t.statements[1].params).toEqual(['s1'])
      expect(createPoolCluster).not.toHaveBeenCalled()
      createPoolCluster.mockRestore()
    })

    it('fromOne attaches nested rows on the same capture t', async () => {
      const t = xsql.capture(seedExecutor({
        users: [{ id: 1, name: 'Ada' }],
        pets: [{ id: 10, userId: 1, name: 'Spot' }],
      }))

      const rows = await t()
        .fromOne('pets', 'id:pets.userId')
        .read('users')

      expect(rows[0].pets).toEqual([{ id: 10, userId: 1, name: 'Spot' }])
      expect(t.statements.map((s) => s.table)).toEqual(['users', 'pets'])
    })
  })

  describe('tables', () => {
    it('lets a later read see writes on the same t', async () => {
      const t = xsql.capture.tables({
        users: [{ id: 1, name: 'Ada' }],
      })

      await t().insert('users', { id: 2, name: 'Bob' })
      const rows = await t().read('users')

      expect(rows.map((row) => row.name)).toEqual(['Ada', 'Bob'])
      expect(t.statements.map((s) => s.cmd)).toEqual(['insert', 'read'])
    })

    it('merges update into seed rows', async () => {
      const t = xsql.capture.tables({
        users: [{ id: 1, name: 'Ada' }],
      })

      await t().where({ id: 1 }).update('users', { name: 'Ada Lovelace' })
      const [row] = await t().read('users')

      expect(row.name).toBe('Ada Lovelace')
    })

    it('fromOne reads the target table seed', async () => {
      const t = xsql.capture.tables({
        users: [{ id: 1, name: 'Ada' }],
        pets: [{ id: 10, userId: 1, name: 'Spot' }],
      })

      const rows = await t()
        .fromOne('pets', 'id:pets.userId')
        .read('users')

      expect(rows[0].pets).toEqual([{ id: 10, userId: 1, name: 'Spot' }])
      expect(t.statements.map((s) => s.table)).toEqual(['users', 'pets'])
    })

    it('removes seed rows on delete', async () => {
      const t = xsql.capture.tables({
        users: [{ id: 1, name: 'Ada' }],
      })

      await t().where({ id: 1 }).delete('users')
      const rows = await t().read('users')

      expect(rows).toEqual([])
      expect(t.statements[0].cmd).toBe('delete')
    })

    it('throws on an unhandled cmd', async () => {
      const t = xsql.capture.tables({ users: [{ id: 1 }] })

      await expect(t().query('SELECT 1', [])).rejects.toThrow(/unhandled cmd/)
    })
  })
})
