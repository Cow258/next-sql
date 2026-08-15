/* eslint-disable no-inner-declarations */

/** @typedef {import('./')} xsql */
/** @typedef {import('mysql2').QueryError} QueryError */

const { getStore, assertTestingAccess } = require('./testHook')

/**
 * @param {xsql} xsql
 * @param {hostId} hostId
 * @returns {(callback: (t: typeof xsql) => Promise<void|any>) => Promise<void>}
 */
function transaction(xsql, hostId) {
  /**
   * @param {(t: typeof xsql) => Promise<void|any>} callback
   * @throws {QueryError}
   */
  const result = async function (callback) {
    const store = getStore()

    // Inside mount: join the test connection — no second BEGIN/COMMIT/ROLLBACK.
    if (store) {
      // eslint-disable-next-line no-shadow
      function t() {
        if (!(this instanceof t)) return new t()
        xsql.call(this, hostId, true)
        return this
      }
      await callback(t)
      return
    }

    assertTestingAccess(null, xsql)

    const host = xsql.hosts[hostId]
    const client = xsql.getClient(host.client)
    const conn = await client.getConnection(hostId)

    const {
      getConnection,
      beginTransaction,
      commit,
      rollback,
      release,
    } = await client.getTransaction(conn)

    const transactionConn = getConnection?.() ?? conn

    function t() {
      if (!(this instanceof t)) return new t()
      xsql.call(this, hostId, true)
      this.conn = transactionConn
      this.isTransaction = true
      return this
    }

    await beginTransaction()
    try {
      await callback(t)
      await commit()
    } catch (err) {
      await rollback()
      throw err
    } finally {
      release()
    }
  }
  return result
}

module.exports = transaction
