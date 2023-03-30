/** @typedef {import('./')} xsql */
/** @typedef {import('mysql').MysqlError} MysqlError */

/**
 * @param {xsql} xsql
 * @param {hostId} hostId
 */
function transaction(xsql, hostId) {
  /**
   * @param {(t: () => xsql) => Promise} callback
   * @throws {MysqlError}
   */
  const result = async function (callback) {
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

    try {
      await beginTransaction()
      try {
        await callback(t)
        await commit()
      } catch (err) {
        await rollback()
        throw err
      }
    } catch (err) {
      err.stack = `${new Error('Transaction Error').stack}\n${err.stack}`
      throw err
    } finally {
      release()
    }
  }
  return result
}

module.exports = transaction
