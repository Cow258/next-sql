/** @typedef { import('./') } xSQL */
/** @typedef {("read"|"update"|"insert"|"delete"|"batchInsert")} Command */

const { ReadResult } = require('./array')
const is = require('./is')
const { paginationBefore, paginationAfter } = require('./pagination')

/**
   * @private
   * @this xSQL
   * @param {Command} cmd
   * @returns {Promise<ReadResult>}
   */
async function _runCommand(cmd, table, data, options, xSQL) {
  if (this._state.pagination) paginationBefore.call(this)
  const [sql, params] = this.client.toStatement(cmd, table, this._state, data, options)
  const conn = await this.getConnection()
  /** @type {PaginationResult} */
  let paginationResult = null
  /** @type {ReadResult} */
  let readResult = null
  let err = null
  try {
    readResult = await this.client.query(conn, sql, params)
    if (is.array(readResult)) {
      // Pagination
      if (is.plainObject(this._state.pagination)) {
        const p = paginationAfter.call(this, readResult, this._state)
        readResult = p.paginationRows
        paginationResult = p.paginationResult
      }
      // Filter
      if (is.fn(this._state.filter)) {
        if (is.async(this._state.filter)) {
          const defers = readResult.map((row) => ((async () => {
            const filtered = await this._state.filter(row)
            return filtered || row
          })()))
          readResult = await Promise.all(defers)
        } else {
          readResult = readResult.map((row) => {
            const filtered = this._state.filter(row)
            return filtered || row
          })
        }
      }
      // Relationshop
      if (is.notEmpty(this._state.relation)) {
        await this._relationFetch(readResult, xSQL)
      }
      // Return Result
      readResult = new ReadResult({
        array: readResult,
        eof: !readResult.length,
        pagination: paginationResult,
      })
    }
  } catch (error) {
    error.stack = `${new Error(`${cmd} error`).stack}\n${error.stack}`
    err = error
  } finally {
    if (!this.isTransaction) conn.release()
  }
  if (err) throw err
  return readResult
}

/**
 * Read table from database
 * @this xSQL
 * @param {string} table
 * @returns {Promise<ReadResult>}
 */
function Read(table) {
  return this._runCommand('read', table)
}
/**
 * Delete rows from table
 * @this xSQL
 * @param {string} table
 * @returns {Promise<OkPacket>}
 */
function Delete(table) {
  return this._runCommand('delete', table)
}
/**
 * Update row from table
 * @this xSQL
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
 * @this xSQL
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
 * @this xSQL
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
