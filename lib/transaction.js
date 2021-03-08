/** @typedef {import('./')} xSQL */
/** @typedef {import('mysql').MysqlError} MysqlError */

/** 
 * @param {xSQL} xSQL
 * @param {hostId} hostId
 */
function transaction(xSQL, hostId) {
  /** 
   * @param {(t: () => xSQL) => Promise} callback
   * @throws {MysqlError}
   */
  const result = async function (callback) {
    const host = xSQL.hosts[hostId]
    const client = xSQL.getClient(host.client)
    const conn = await client.getConnection(hostId)

    const {
      beginTransaction,
      commit,
      rollback,
      release,
    } = await client.getTransaction(conn)

    function t() {
      if (!(this instanceof t)) return new t()
      xSQL.call(this, hostId, true)
      this.conn = conn
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
