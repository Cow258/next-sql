const array = require('./array')
const builder = require('./builder')
const clients = require('./clients')
const is = require('./is')
const transaction = require('./transaction')

/** @typedef {import('./clients/constance').CLIENTS} CLIENTS */

/** @typedef {import('./builder').Condition} Condition */
/** @typedef {Condition[]} Conditions */
/** @typedef {("read"|"update"|"insert"|"delete")} Command */

/** 
 * @typedef {Object} OkPacket
 * @property {number} insertId The insert id after inserting a row into a table with an auto increment primary key.
 * @property {number} fieldCount
 * @property {number} affectedRows The number of affected rows from an insert, update, or delete statement.
 * @property {number} changedRows The number of changed rows from an update statement. "changedRows" differs from "affectedRows" in that it does not count updated rows whose values were not changed.
 */

/**
 * @typedef {Object} HostOptions
 * @property {"mysql"} client
 * @property {string} host
 * @property {string} user
 * @property {string} password
 * @property {string} database
 */

const defaultOptions = {
  isLog: true,
  logger: (...args) => console.log(...args),
  /** @type {string} */
  defaultHost: '',
  /** @type {{[hostId: string]: HostOptions}} */
  hosts: {},
}

const defaultState = {
  /** @type {Conditions} */
  conditions: [],
  select: '*',
  filter: null,
  filterDefer: null,
  groupBy: null,
  orderBy: null,
  limit: null,
  offset: null,
  pagination: null,
  relation: null,
}
/** @typedef {defaultState} State */

/**
 * @namespace xSQL
 * @constructs xSQL
 * @param {string} hostId
 * @returns {xSQL}
 */
function xSQL(hostId = xSQL.options.defaultHost, skip = false) {
  // Return new instance automatically
  if (!(this instanceof xSQL) && !skip) return new xSQL(hostId)

  /** @type {HostOptions} */
  this.host = xSQL.hosts[hostId]
  this.hostId = hostId
  this.conn = null
  this.isTransaction = false
  this.client = xSQL.getClient(this.host.client)
  // const self = this

  /**
   * @private 
   * @type {State}
   */
  this._state = null

  /** Clean all state of current instance */
  this.clean = function () {
    this._state = {
      ...defaultState,
      conditions: [],
      pagination: null,
    }
    return this
  }
  this.clean()

  /**
   * Take a "snapshot" of the xSQL instance, returning a new instance.
   * @returns {xSQL}
   */
  this.clone = function () {
    const clone = xSQL(this.hostId)
    clone._state = {
      ...this._state,
      conditions: [...this._state.conditions],
      pagination: this._state.pagination
        ? { ...this._state.pagination }
        : null,
    }
    return clone
  }

  // Builder
  /** @private */
  this._addCondition = builder._addCondition
  /** @private */
  this._addWhereClause = builder._addWhereClause
  this.where = builder.where
  this.and = builder.and
  this.or = builder.or
  this.select = builder.select
  this.filter = builder.filter
  this.filterDefer = builder.filterDefer
  this.groupBy = builder.groupBy
  this.orderBy = builder.orderBy
  this.limit = builder.limit
  this.offset = builder.offset

  // Transaction
  this.transaction = transaction(xSQL, hostId)

  // Client
  this.escape = this.client.escape

  /** Get connection of this instance */
  this.getConnection = async function () {
    const conn = this.conn || await this.client.getConnection(this.hostId)
    return conn
  }

  /** Use client native query for fallback */
  this.query = async function (sql, params) {
    const conn = await this.getConnection()
    return this.client.query(conn, sql, params)
  }

  /**
   * Render from current state info pre-query SQL statement.\
   * Read Example:
   * ```js
   * const [sql, params] = xsql()
   *   .where({ id: 1 })
   *   .toStatement('read', 'users')
   * ```
   * Update Example:
   * ```js
   * const [sql, params] = xsql()
   *   .where({ id: 1 })
   *   .toStatement('update', 'users', { name: 'newName' })
   * ```
   * toRaw Example:
   * ```js
   * const raw = xsql()
   *   .where({ id: 1 })
   *   .toStatement('update', 'users', { name: 'newName' })
   *   .toRaw()
   * ```
   * @param {Command} cmd 
   * @param {string} table 
   */
  this.toStatement = function (cmd, table, data) {
    const result = this.client.toStatement(cmd, table, this._state, data)
    return new array.Statement({
      array: result,
      toRaw: () => this.toRaw(...result),
    })
  }

  /**
   * Render raw SQL statement string
   * 
   * ---
   * Custom Example:
   * ```js
   * const raw = xsql('someHost')
   *  .toRaw('SELECT * FROM user WHERE id = ?', [1])
   * ```
   * ---
   * Chain Example:
   * ```js
   * const raw = xsql()
   *   .where({ id: 1 })
   *   .toStatement('read', 'users')
   *   .toRaw()
   * ```
   * ---
   * Split Example:
   * ```js
   * const instance = xsql().where({ id: 1 })
   * const [sql, params] = instance.toStatement('read', 'users')
   * const raw = instance.toRaw(sql, params)
   * ```
   * ---
   * @param {string} sql 
   * @param {any[]} params 
   * @returns {string}
   */
  this.toRaw = function (sql, params) {
    return this.client.toRaw(sql, params)
  }


  /** @private */
  this._runCommand = async function (cmd, table, data) {
    const [sql, params] = this.client.toStatement(cmd, table, this._state, data)
    const conn = await this.getConnection()
    let result = null
    let err = null
    try {
      result = await this.client.query(conn, sql, params, this._state.filter)
      if (is.fn(this._state.filterDefer)) {
        result = result.map(this._state.filterDefer)
      }
    } catch (error) {
      error.stack = `${new Error(`${cmd} error`).stack}\n${error.stack}`
      err = error
    } finally {
      if (!this.isTransaction) conn.release()
    }
    if (err) throw err
    return result
  }

  /**
   * Read table from database
   * @param {string} table 
   * @returns {any[]}
   */
  this.read = function (table) {
    return this._runCommand('read', table)
  }
  /**
   * Delete rows from table
   * @param {string} table 
   * @returns {OkPacket}
   */
  this.delete = function (table) {
    return this._runCommand('delete', table)
  }
  /**
   * Update row from table
   * @param {string} table 
   * @returns {OkPacket}
   */
  this.update = function (table, data) {
    return this._runCommand('update', table, data)
  }
  /**
   * Insert a row into table
   * @param {string} table 
   * @returns {OkPacket}
   */
  this.insert = function (table, data) {
    return this._runCommand('insert', table, data)
  }

}

/** @type {string} */
xSQL.defaultHost = ''

/** @type {HostOptions} */
xSQL.options = {}

/** @type {HostOptions} */
xSQL.hosts = {}

/** Pool Seting */
xSQL.pools = {}

/** All suppported clients */
xSQL.clients = clients

/**
 * Initializing the Library
 * @param {defaultOptions} options
 */
xSQL.init = function (options) {
  const { hosts, isLog, logger, ...opts } = { ...defaultOptions, ...options }
  this.options = opts
  this.hosts = Object.keys(hosts).reduce((prev, hostId) => {
    // Get host setting
    const host = {
      ...opts,
      ...hosts[hostId],
    }

    // Save pool setting
    if (!this.pools[host.client]) {
      this.pools[host.client] = {
        isLog,
        logger,
        pools: {},
      }
    }
    this.pools[host.client].pools[hostId] = host

    // Save host setting
    return {
      ...prev,
      [hostId]: host,
    }
  }, {})

  // Init Client
  Object.keys(this.pools).forEach((client) => {
    this.clients[client].init(this.pools[client])
  })
}

/** @param {CLIENTS} client */
xSQL.getClient = function (client) {
  return xSQL.clients[client]
}

module.exports = xSQL
