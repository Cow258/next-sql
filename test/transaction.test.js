const xsql = require('../lib')
const utils = require('./utils')

require('../clients/mysql2')

describe('Transaction', () => {

  beforeAll(async () => {
    xsql.init(utils.sqlConfig)
  })

  afterAll(async () => {
    xsql.close()
  })

  it('should throw error and not insert', async () => {
    const userA = utils.GetUuid()
    const userB = utils.GetUuid()
    const cb = jest.fn()

    await expect(
      xsql().transaction(async (t) => {
        await t().insert('users', {
          name: userA,
        })

        const rows = await t()
          .where({ name: userA })
          .read('users')
        expect(rows.length).toBe(1)

        await t().insert('users', {
          name: userB,
          createAt: 'A', // This will cause an error
        })
        cb()
      })
    ).rejects.toThrow()

    expect(cb).not.toBeCalled()

    const rows = await xsql()
      .where('name', 'in', [userA, userB])
      .read('users')

    expect(rows.length).toBe(0)
  })

  it('should insert', async () => {
    const userA = utils.GetUuid()
    const userB = utils.GetUuid()

    await xsql().transaction(async (t) => {
      await t().insert('users', {
        name: userA,
      })

      const rows = await t()
        .where({ name: userA })
        .read('users')
      expect(rows.length).toBe(1)

      await t().insert('users', {
        name: userB,
      })
    })

    const rows = await xsql()
      .where('name', 'in', [userA, userB])
      .read('users')

    expect(rows.length).toBe(2)

    const result = await xsql()
      .where('name', 'in', [userA, userB])
      .delete('users')

    expect(result.affectedRows).toBe(2)
  })
})
