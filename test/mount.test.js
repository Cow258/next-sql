const xsql = require('../lib')
const utils = require('./utils')

require('../clients/mysql2')

describe('__testHook.mount', () => {
  beforeAll(async () => {
    xsql.init(utils.sqlConfig)
    xsql.__isTesting = true
  })

  afterAll(async () => {
    xsql.__isTesting = false
    await xsql.close()
  })

  it('seed insert → WHERE update → remount read; ROLLBACK clears seed', async () => {
    const nameA = utils.GetUuid()
    const nameB = utils.GetUuid()

    await xsql.__testHook.mount(async (testId) => {
      const a = await xsql().insert('users', { name: nameA, createAt: Date.now() })
      await xsql().insert('users', { name: nameB, createAt: Date.now() })

      await xsql()
        .where({ id: a.insertId })
        .update('users', { name: `${nameA}-updated` })

      const rows = await xsql()
        .where({ name: `${nameA}-updated` })
        .read('users')

      expect(rows).toHaveLength(1)
      expect(rows[0].id).toBe(a.insertId)
      expect(xsql.__testHook.logs[testId].some((e) => e.cmd === 'update')).toBe(true)
    })

    await xsql.__testHook.mount(async () => {
      const rows = await xsql()
        .where('name', 'in', [nameA, nameB, `${nameA}-updated`])
        .read('users')
      expect(rows).toHaveLength(0)
    })
  })

  it('isolates logs and rows across parallel mounts', async () => {
    const name1 = utils.GetUuid()
    const name2 = utils.GetUuid()
    let testId1
    let testId2

    await Promise.all([
      xsql.__testHook.mount(async (testId) => {
        testId1 = testId
        await xsql().insert('users', { name: name1, createAt: Date.now() })
        const rows = await xsql().where({ name: name1 }).read('users')
        expect(rows).toHaveLength(1)
        expect(rows[0].name).toBe(name1)
        const other = await xsql().where({ name: name2 }).read('users')
        expect(other).toHaveLength(0)
      }),
      xsql.__testHook.mount(async (testId) => {
        testId2 = testId
        await xsql().insert('users', { name: name2, createAt: Date.now() })
        const rows = await xsql().where({ name: name2 }).read('users')
        expect(rows).toHaveLength(1)
        expect(rows[0].name).toBe(name2)
        const other = await xsql().where({ name: name1 }).read('users')
        expect(other).toHaveLength(0)
      }),
    ])

    expect(testId1).not.toBe(testId2)
    expect(xsql.__testHook.logs[testId1]).not.toBe(xsql.__testHook.logs[testId2])
  })

  it('joins nested transaction on the same conn and never COMMITs', async () => {
    const name = utils.GetUuid()
    const client = xsql.getClient('mysql2')
    const getConnection = jest.spyOn(client, 'getConnection')

    await xsql.__testHook.mount(async () => {
      const before = getConnection.mock.calls.length
      await xsql().transaction(async (t) => {
        await t().insert('users', { name, createAt: Date.now() })
        const rows = await t().where({ name }).read('users')
        expect(rows).toHaveLength(1)
      })
      expect(getConnection.mock.calls.length).toBe(before)
    })

    getConnection.mockRestore()

    await xsql.__testHook.mount(async () => {
      const rows = await xsql().where({ name }).read('users')
      expect(rows).toHaveLength(0)
    })
  })

  it('throws when __isTesting and outside mount callback', async () => {
    await expect(xsql().read('users')).rejects.toThrow(/__isTesting|mount/)
  })

  it('log sql/params match toStatement; toRaw round-trips', async () => {
    await xsql.__testHook.mount(async (testId) => {
      const expected = xsql()
        .where({ id: 1 })
        .toStatement('update', 'users', { name: 'Ada' })

      await xsql()
        .where({ id: 1 })
        .update('users', { name: 'Ada' })

      const entry = xsql.__testHook.logs[testId].find((e) => e.cmd === 'update')
      expect(entry.sql).toBe(expected[0])
      expect(entry.params).toEqual(expected[1])
      expect(entry.toRaw()).toBe(expected.toRaw())
    })
  })

  it('xsql.capture is absent', () => {
    expect(xsql.capture).toBeUndefined()
  })
})
