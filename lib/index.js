

const { Statement } = require('./array')
const builder = require('./builder')
const clients = require('./clients')
const command = require('./command')
const is = require('./is')
const { pagination } = require('./pagination')
const { _relationFetch, toOne, toMany, fromOne } = require('./relation')
const transaction = require('./transaction')
const { objectToJson } = require('./utils')

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
 * @property {string} select
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
 * @property {"mysql"|"mysql2"|"database-js"} client
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
 * @namespace xsql
 * @constructs xsql
 * @param {string} hostId
 * @returns {xsql}
 */
function xsql(hostId = xsql.options.defaultHost, skip = false) {
  // Return new instance automatically
  if (!(this instanceof xsql) && !skip) return new xsql(hostId)

  /** @type {HostOptions} */
  this.host = xsql.hosts[hostId]
  this.hostId = hostId
  this.conn = null
  this.isTransaction = false
  this.client = xsql.getClient(this.host.client)
  this.isLog = this.client.isLog

  /**
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
   * Take a "snapshot" of the xsql instance, returning a new instance.
   * @returns {xsql}
   */
  this.clone = function () {
    const clone = xsql(this.hostId)
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
  this.map = builder.map
  this.groupBy = builder.groupBy
  this.having = builder.having
  this.orderBy = builder.orderBy
  this.limit = builder.limit
  this.offset = builder.offset
  this.log = builder.log
  this.extend = builder.extend

  // Command
  /** @private */
  this._runCommand = (cmd, table, data, options) => command._runCommand.call(this, cmd, table, data, options, xsql)
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
  this.transaction = transaction(xsql, hostId)

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
  this.escapeId = this.client.escapeId

  /** Get connection of this instance */
  this.getConnection = async function () {
    const conn = this.conn || await this.client.getConnection(this.hostId)
    return conn
  }

  /** Use client native query for fallback */
  this.query = async function (sql, params) {
    const conn = await this.getConnection()
    const result = this.client.query(conn, sql, params)
    if (!this.isTransaction) conn?.release?.()
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
  this.toStatement = function (cmd, table, data, options) {
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

    const result = this.client.toStatement(cmd, table, this._state, data, {
      primaryKeys,
      sumKeys,
      jsonKeys,
    })
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
xsql.defaultHost = ''

/** @type {HostOptions} */
xsql.options = {}

/** @type {HostOptions} */
xsql.hosts = {}

/** Pool Seting */
xsql.pools = {}

/** All suppported clients */
xsql.clients = clients

/**
 * Initializing the Library
 * @param {defaultOptions} options
 */
xsql.init = (options) => {
  const { hosts, isLog, logger, ...opts } = { ...defaultOptions, ...options }
  xsql.options = opts

  Object.keys(hosts).forEach((hostId) => {
    if (!xsql.hosts[hostId]) {
      xsql.hosts[hostId] = hosts[hostId]
    }

    const host = xsql.hosts[hostId]

    // Save pool setting
    if (!xsql.pools[host.client]) {
      xsql.pools[host.client] = {
        isLog,
        logger,
        pools: {},
      }
    }
    if (!xsql.pools[host.client].pools[hostId]) {
      // console.info(`xsql: init => ${host.client} => ${hostId}`)
      xsql.pools[host.client].pools[hostId] = host
    }
  }, {})

  // Init Client
  Object.keys(xsql.pools).forEach((client) => {
    xsql.clients[client].init(xsql.pools[client])
  })
}

/** @param {CLIENTS} client */
xsql.getClient = function (client) {
  return xsql.clients[client]
}

xsql.close = async function () {
  return Promise.all(
    Object.keys(xsql.pools).map(
      key => xsql.clients[key].close()
    )
  )
}

module.exports = xsql
