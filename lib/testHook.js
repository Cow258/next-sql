const { AsyncLocalStorage } = require('async_hooks')
const crypto = require('crypto')

/** @typedef {import('./')} xsql */

/**
 * @typedef {Object} LogEntry
 * @property {number} ts
 * @property {string} cmd
 * @property {string} [table]
 * @property {any} [data]
 * @property {string} sql
 * @property {any[]} params
 * @property {() => string} toRaw
 *//** @exports LogEntry */

/**
 * @typedef {Object} TestStore
 * @property {string} testId
 * @property {any} conn
 * @property {LogEntry[]} logs
 *//** @exports TestStore */

/** @type {AsyncLocalStorage<TestStore>} */
const als = new AsyncLocalStorage()

/**
 * @type {{ [testId: string]: LogEntry[] }}
 */
const logs = {}

/**
 * @returns {TestStore|undefined}
 */
function getStore() {
  return als.getStore()
}

/**
 * Fuse: under `__isTesting`, DB work is only allowed inside `mount`.
 * Stale instance: `this.conn` set but not the current store conn.
 *
 * @param {xsql|null} instance
 * @param {typeof import('./')} xsqlFn
 */
function assertTestingAccess(instance, xsqlFn) {
  if (!xsqlFn.__isTesting) return
  const store = als.getStore()
  if (!store) {
    throw new Error(
      'xsql: __isTesting is set; run queries inside xsql.__testHook.mount(callback)'
    )
  }
  if (instance && instance.conn && store.conn !== instance.conn) {
    throw new Error('xsql: stale connection (not the current mount conn)')
  }
}

/**
 * Push a log entry onto the active mount store (array reference).
 *
 * @param {Omit<LogEntry, 'ts'> & { ts?: number }} entry
 */
function pushLog(entry) {
  const store = als.getStore()
  if (!store) return
  /** @type {LogEntry} */
  const row = {
    ts: entry.ts ?? Date.now(),
    cmd: entry.cmd,
    sql: entry.sql,
    params: entry.params,
    toRaw: entry.toRaw,
  }
  if (entry.table !== undefined) row.table = entry.table
  if (entry.data !== undefined) row.data = entry.data
  store.logs.push(row)
}

/**
 * @param {typeof import('./')} xsqlFn
 */
function createTestHook(xsqlFn) {
  /**
   * @param {(testId: string) => Promise<void>|void} callback
   * @returns {Promise<void>}
   */
  async function mount(callback) {
    const hostId = xsqlFn.options?.defaultHost || Object.keys(xsqlFn.hosts || {})[0]
    const host = hostId ? xsqlFn.hosts[hostId] : null
    if (!hostId || !host) {
      throw new Error(
        'xsql.__testHook.mount: xsql.init() required (no host). Call xsql.init(...) before mount.'
      )
    }
    const client = xsqlFn.getClient(host.client)
    if (!client || typeof client.getConnection !== 'function') {
      throw new Error(
        'xsql.__testHook.mount: xsql.init() required (client/pool missing).'
      )
    }

    const conn = await client.getConnection(hostId)
    const tx = client.getTransaction(conn)
    const testId = crypto.randomUUID()
    logs[testId] = []

    await tx.beginTransaction()
    try {
      await als.run({ testId, conn, logs: logs[testId] }, () => callback(testId))
    } finally {
      await tx.rollback()
      tx.release()
    }
  }

  return {
    logs,
    mount,
  }
}

module.exports = {
  als,
  logs,
  getStore,
  assertTestingAccess,
  pushLog,
  createTestHook,
}
