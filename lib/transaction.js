/** @typedef {import('./')} nSQL */
/** @typedef {import('mysql').MysqlError} MysqlError */

/** 
 * @param {nSQL} nSQL
 * @param {hostId} hostId
 */
function transaction(nSQL, hostId) {
  /** 
   * @param {(t: () => nSQL) => Promise} callback
   * @throws {MysqlError}
   */
  const result = async function (callback) {
    const host = nSQL.hosts[hostId]
    const client = nSQL.getClient(host.client)
    const conn = await client.getConnection(hostId)

    const {
      beginTransaction,
      commit,
      rollback,
      release,
    } = await client.getTransaction(conn)

    function t() {
      if (!(this instanceof t)) return new t()
      nSQL.call(this, hostId, true)
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
