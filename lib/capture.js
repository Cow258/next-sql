/** @typedef {import('./')} xsql */
/** @typedef {import('./index').OkPacket} OkPacket */

const command = require('./command')

/**
 * @typedef {Object} CaptureStatement
 * @property {string} cmd
 * @property {string} [table]
 * @property {string} sql
 * @property {any[]} params
 * @property {() => string} toRaw
 *//** @exports CaptureStatement */

/**
 * @typedef {Object} CaptureExecutorContext
 * @property {string} cmd
 * @property {string} [table]
 * @property {string} sql
 * @property {any[]} params
 * @property {() => string} toRaw
 * @property {any} [data]
 *//** @exports CaptureExecutorContext */

/**
 * @callback CaptureExecutor
 * @param {CaptureExecutorContext} ctx
 * @returns {Promise<any[]|OkPacket>|any[]|OkPacket}
 *//** @exports CaptureExecutor */

/**
 * @typedef {typeof import('./index') & { statements: CaptureStatement[] }} CaptureXsql
 *//** @exports CaptureXsql */

/**
 * @private
 * @param {xsql} xsql
 * @returns {import('../clients/mysql2')}
 */
function resolveClient(xsql) {
  const client = xsql.clients.mysql2 || xsql.clients.mysql || xsql.clients.databaseJs
  if (!client || typeof client.toStatement !== 'function') {
    throw new Error(`xsql.capture: client not found.

Please import or require client before capture.

Example:
  const xsql = require('next-sql')
  require('next-sql/clients/mysql2')
`)
  }
  return client
}

/**
 * @param {xsql} xsql
 * @param {CaptureExecutor} executor
 * @returns {CaptureXsql}
 */
function createCapture(xsql, executor) {
  const client = resolveClient(xsql)
  /** @type {CaptureStatement[]} */
  const statements = []

  /**
   * @param {CaptureExecutorContext} ctx
   */
  async function captureExecute(ctx) {
    const { cmd, table, sql, params } = ctx
    const toRaw = ctx.toRaw || (() => client.toRaw(sql, params))
    /** @type {CaptureStatement} */
    const entry = { cmd, sql, params, toRaw }
    if (table !== undefined) entry.table = table
    statements.push(entry)
    return executor({ cmd, table, sql, params, toRaw, data: ctx.data })
  }

  /**
   * @param {string} [hostId]
   * @param {boolean} [skip]
   * @returns {xsql}
   */
  function t(hostId, skip = false) {
    if (!(this instanceof t) && !skip) return new t(hostId)

    this.__captureClient = client
    this._captureExecute = captureExecute

    xsql.call(this, hostId, true)

    this._runCommand = (cmd, table, data, options) => (
      command._runCommand.call(this, cmd, table, data, options, t)
    )

    this.clone = function () {
      const cloned = t(this.hostId)
      cloned._state = {
        ...this._state,
        conditions: [...this._state.conditions],
        relation: this._state.relation.map((r) => ({ ...r })),
        pagination: (
          this._state.pagination
            ? { ...this._state.pagination }
            : null
        ),
      }
      return cloned
    }

    this.transaction = async function (callback) {
      await callback(t)
    }

    this.query = async function (sql, params) {
      const toRaw = () => this.toRaw(sql, params)
      return captureExecute({ cmd: 'query', sql, params, toRaw })
    }

    this.getConnection = async function () {
      throw new Error('xsql.capture: getConnection is disabled (no pool)')
    }

    return this
  }

  t.statements = statements
  return t
}

/**
 * @param {Record<string, object[]>} seed
 * @returns {CaptureExecutor}
 */
function createTablesExecutor(seed) {
  const tables = seed || {}
  let nextInsertId = 1

  return async function tablesExecutor({ cmd, table, data }) {
    if (cmd !== 'read' && cmd !== 'update' && cmd !== 'insert' && cmd !== 'delete' && cmd !== 'batchInsert') {
      throw new Error(`xsql.capture.tables: unhandled cmd "${cmd}"`)
    }
    if (!tables[table]) tables[table] = []
    const rows = tables[table]
    switch (cmd) {
      case 'read':
        return rows.map((row) => ({ ...row }))
      case 'update': {
        for (const row of rows) {
          Object.assign(row, data)
        }
        return {
          affectedRows: rows.length,
          changedRows: rows.length,
          insertId: 0,
          fieldCount: 0,
        }
      }
      case 'insert': {
        const row = { ...(data || {}) }
        if (row.id === undefined || row.id === null) {
          row.id = nextInsertId
        }
        const numericId = Number(row.id)
        if (!Number.isNaN(numericId)) {
          nextInsertId = Math.max(nextInsertId, numericId) + 1
        }
        rows.push(row)
        return {
          affectedRows: 1,
          changedRows: 0,
          insertId: row.id,
          fieldCount: 0,
        }
      }
      case 'batchInsert': {
        const incoming = Array.isArray(data) ? data : []
        for (const item of incoming) {
          rows.push({ ...item })
        }
        return {
          affectedRows: incoming.length,
          changedRows: 0,
          insertId: 0,
          fieldCount: 0,
        }
      }
      case 'delete': {
        const affectedRows = rows.length
        rows.length = 0
        return {
          affectedRows,
          changedRows: 0,
          insertId: 0,
          fieldCount: 0,
        }
      }
      default:
        throw new Error(`xsql.capture.tables: unhandled cmd "${cmd}"`)
    }
  }
}

module.exports = {
  createCapture,
  createTablesExecutor,
}
