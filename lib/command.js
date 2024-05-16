/** @typedef { import('./') } xsql */
/** @typedef {("read"|"update"|"insert"|"delete"|"batchInsert")} Command */
/** @typedef {import('mysql').OkPacket} OkPacket */

const { ReadResult } = require('./array')
const is = require('./is')
const { paginationBefore, paginationAfter } = require('./pagination')
const { objectToJson, parseJson } = require('./utils')

/**
   * @private
   * @this xsql
   * @param {Command} cmd
   * @returns {Promise<ReadResult>}
   */
async function _runCommand(cmd, table, data, options, xsql) {
  if (this._state.pagination) paginationBefore.call(this)

  let { primaryKeys = [], sumKeys = [], jsonKeys = [] } = (options || {})

  if (is.string(primaryKeys)) primaryKeys = primaryKeys.split(',')
  if (!is.array(primaryKeys)) throw new Error('primaryKeys only accept string or array')
  primaryKeys = new Set(primaryKeys)

  if (is.string(sumKeys)) sumKeys = sumKeys.split(',')
  if (!is.array(sumKeys)) throw new Error('sumKeys only accept string or array')
  sumKeys = new Set(sumKeys)

  if (is.string(jsonKeys)) jsonKeys = jsonKeys.split(',')
  if (!is.array(jsonKeys)) throw new Error('jsonKeys only accept string or array')
  if (is.notEmpty(jsonKeys) && is.defined(data)) {
    if (is.plainObject(data)) {
      data = objectToJson(data, jsonKeys)
    }
    if (is.array(data)) {
      data = data.map((d) => objectToJson(d, jsonKeys))
    }
  }

  const [sql, params] = this.client.toStatement(cmd, table, this._state, data, {
    primaryKeys,
    sumKeys,
    jsonKeys,
  })
  const conn = await this.getConnection()
  /** @type {PaginationResult} */
  let paginationResult = null
  /** @type {ReadResult} */
  let readResult = null
  let err = null
  try {
    readResult = await this.client.query(conn, sql, params, this._state.log)
  } catch (error) {
    error.stack = `${new Error(`${cmd} error`).stack}\n${error.stack}`
    err = error
  } finally {
    if (!this.isTransaction) conn?.release?.()
  }
  if (err) throw err

  const originFilter = this._state.filter
  if (is.array(readResult)) {
    // Pagination
    if (is.plainObject(this._state.pagination)) {
      const p = paginationAfter.call(this, readResult, this._state)
      readResult = p.paginationRows
      paginationResult = p.paginationResult
    }
    // JSON support
    if (is.notEmpty(jsonKeys)) {
      if (is.defined(originFilter)) {
        this.filter((row) => originFilter(parseJson(row, jsonKeys)))
      } else {
        this.filter((row) => parseJson(row, jsonKeys))
      }
    }
    // Filter & Plain object convert
    if (is.async(originFilter)) {
      const defers = readResult.map((row) => ((async () => {
        let filtered = this._state.filter(row)
        if (is.promise(filtered)) filtered = await filtered
        return { ...(filtered || row) }
      })()))
      readResult = await Promise.all(defers)
    } else if (is.fn(this._state.filter)) {
      readResult = readResult.map((row) => ({ ...this._state.filter(row) }))
    } else {
      readResult = readResult.map((row) => ({ ...row }))
    }
    // Relationship
    if (is.notEmpty(this._state.relation)) {
      await this._relationFetch(readResult, xsql)
    }
    // Map
    if (is.defined(this._state.map)) {
      const defers = readResult.map((row) => ((async () => {
        let mapped = this._state.map(row)
        if (is.promise(mapped)) mapped = await mapped
        return mapped || row
      })()))
      readResult = await Promise.all(defers)
    }
    // Return Result
    readResult = new ReadResult({
      array: readResult,
      eof: !readResult.length,
      pagination: paginationResult,
    })
  }

  return readResult
}

/**
 * Read table from database
 * @this xsql
 * @template T
 * @param {string} table
 * @param {Object} options
 * @param {string[]} options.jsonKeys
 * @returns {Promise<ReadResult<T>>}
 */
function Read(table, options) {
  return this._runCommand('read', table, null, options)
}
/**
 * Delete rows from table
 * @this xsql
 * @param {string} table
 * @returns {Promise<OkPacket>}
 */
function Delete(table) {
  return this._runCommand('delete', table)
}
/**
 * Update row from table
 * @this xsql
 * @param {string} table
 * @param {Object} options
 * @param {string[]} options.sumKeys
 * @param {string[]} options.jsonKeys
 * @returns {Promise<OkPacket>}
 */
function Update(table, data, options) {
  return this._runCommand('update', table, data, options)
}
/**
 * Insert a row into table
 * @this xsql
 * @param {string} table
 * @param {Object} options
 * @param {string[]} options.jsonKeys
 * @returns {Promise<OkPacket>}
 */
function Insert(table, data, options) {
  return this._runCommand('insert', table, data, options)
}

/**
 * BatchInsert Insert a row into table
 * @this xsql
 * @param {string} table
 * @param {Object} options
 * @param {string[]} options.primaryKeys
 * @param {string[]} options.sumKeys
 * @param {string[]} options.jsonKeys
 * @returns {Promise<void>}
 */
function BatchInsert(table, data, options) {
  return this._runCommand('batchInsert', table, data, options)
}

module.exports = {
  _runCommand,
  Read,
  Delete,
  Update,
  Insert,
  BatchInsert,
}
