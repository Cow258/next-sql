const xsql = require('../lib')
const utils = require('./utils')

require('../clients/mysql2')

describe('Pagination', () => {
  beforeAll(async () => {
    xsql.init(utils.sqlConfig)
  })

  afterAll(async () => {
    xsql.close()
  })

  it('should correct: page 1 | nav 4 | row 10', async () => {
    const rows = await xsql()
      .orderBy('id')
      .pagination({
        currPage: 1,
        navStep: 4,
        rowStep: 10,
      })
      .read('items')
    expect(rows.length).toBe(10)
    expect(rows[0].id).toBe(0)
    expect(rows[9].id).toBe(9)
    expect(rows.pagination.isOutOfRange).toBeFalsy()
    expect(rows.pagination.currPage).toBe(1)
    expect(rows.pagination.page.current).toBe(1)
    expect(rows.pagination.page.hasPrev).toBeFalsy()
    expect(rows.pagination.page.hasNext).toBeTruthy()
    expect(rows.pagination.nav.hasPrev).toBeFalsy()
    expect(rows.pagination.nav.hasNext).toBeTruthy()
  })

  it('should correct: page 2 | nav 4 | row 10', async () => {
    const rows = await xsql()
      .orderBy('id')
      .pagination({
        currPage: 2,
        navStep: 4,
        rowStep: 10,
      })
      .read('items')
    expect(rows.length).toBe(10)
    expect(rows[0].id).toBe(10)
    expect(rows[9].id).toBe(19)
    expect(rows.pagination.isOutOfRange).toBeFalsy()
    expect(rows.pagination.currPage).toBe(2)
    expect(rows.pagination.page.current).toBe(2)
    expect(rows.pagination.page.hasPrev).toBeTruthy()
    expect(rows.pagination.page.hasNext).toBeTruthy()
    expect(rows.pagination.nav.hasPrev).toBeFalsy()
    expect(rows.pagination.nav.hasNext).toBeTruthy()
  })

  it('should correct: page 9 | nav 4 | row 10', async () => {
    const rows = await xsql()
      .orderBy('id')
      .pagination({
        currPage: 9,
        navStep: 4,
        rowStep: 10,
      })
      .read('items')
    expect(rows.length).toBe(10)
    expect(rows[0].id).toBe(80)
    expect(rows[9].id).toBe(89)
    expect(rows.pagination.isOutOfRange).toBeFalsy()
    expect(rows.pagination.currPage).toBe(9)
    expect(rows.pagination.page.current).toBe(9)
    expect(rows.pagination.page.hasPrev).toBeTruthy()
    expect(rows.pagination.page.hasNext).toBeTruthy()
    expect(rows.pagination.nav.hasPrev).toBeTruthy()
    expect(rows.pagination.nav.hasNext).toBeFalsy()
  })

  it('should EOF: page 12 | nav 4 | row 10', async () => {
    const rows = await xsql()
      .pagination({
        currPage: 12,
        navStep: 4,
        rowStep: 10,
      })
      .read('items')
    expect(rows.length).toBe(0)
    expect(rows.pagination.isOutOfRange).toBeTruthy()
    expect(rows.pagination.currPage).toBe(12)
    expect(rows.pagination.page.current).toBe(12)
    expect(rows.pagination.page.hasPrev).toBeTruthy()
    expect(rows.pagination.page.hasNext).toBeFalsy()
    expect(rows.pagination.nav.hasPrev).toBeTruthy()
    expect(rows.pagination.nav.hasNext).toBeFalsy()

  })
})
