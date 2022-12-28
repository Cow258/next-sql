

const { Statement } = require('./array')
const builder = require('./builder')
const clients = require('./clients')
const command = require('./command')
const { pagination } = require('./pagination')
const { _relationFetch, toOne, toMany, fromOne } = require('./relation')
const transaction = require('./transaction')

/** @typedef {import('./clients/constance').CLIENTS} CLIENTS */
/** @typedef {import('./pagination').PaginationOptions} PaginationOptions */
/** @typedef {import('./pagination').PaginationResult} PaginationResult */
/** @typedef {import('./relation').RelationOptions} RelationOptions */
/** @typedef {import('./command').Command} Command */

/** @typedef {import('./builder').Condition} Condition */
/** @typedef {Condition[]} Conditions */

/**
 * @typedef {Object} State
 * @property {Conditions} conditions
 * @property {*} select
 * @property {Function} filter
 * @property {string} groupBy
 * @property {string} having
 * @property {string} orderBy
 * @property {number} limit
 * @property {number} offset
 * @property {boolean} log
 * @property {PaginationOptions} pagination
 * @property {RelationOptions[]} relation
 */

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
  this.isLog = this.client.isLog

  /**
   * @private
   * @type {State}
   */
  this._state = null

  /** Clean all state of current instance */
  const clean = () => {
    this._state = {
      conditions: [],
      select: '*',
      filter: null,
      groupBy: null,
      having: null,
      orderBy: null,
      limit: null,
      offset: null,
      log: this.isLog,
      pagination: null,
      relation: [],
    }
  }
  this.clean = function () {
    clean()
    return this
  }
  clean()

  /**
   * Take a "snapshot" of the xSQL instance, returning a new instance.
   * @returns {xSQL}
   */
  this.clone = function () {
    const clone = xSQL(this.hostId)
    clone._state = {
      ...this._state,
      conditions: [...this._state.conditions],
      relation: this._state.relation.map(r => ({ ...r })),
      pagination: (
        this._state.pagination
          ? { ...this._state.pagination }
          : null
      ),
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
  this.groupBy = builder.groupBy
  this.having = builder.having
  this.orderBy = builder.orderBy
  this.limit = builder.limit
  this.offset = builder.offset
  this.log = builder.log

  // Command
  /** @private */
  this._runCommand = (cmd, table, data, options) => command._runCommand.call(this, cmd, table, data, options, xSQL)
  /** Read table from database */
  this.read = command.Read
  /** Delete rows from table */
  this.delete = command.Delete
  /** Update row from table */
  this.update = command.Update
  /** Insert a row into table */
  this.insert = command.Insert
  /** BatchInsert Insert a row into table */
  this.batchInsert = command.BatchInsert

  // Transaction
  this.transaction = transaction(xSQL, hostId)

  // Pagination
  this.pagination = pagination

  // Relationship
  /** @private */
  this._relationFetch = _relationFetch
  this.toOne = toOne
  this.toMany = toMany
  this.fromOne = fromOne

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
    const result = this.client.query(conn, sql, params)
    if (!this.isTransaction) conn.release()
    return result
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
    return new Statement({
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
