const builder = require('./builder')
const clients = require('./clients')
const transaction = require('./transaction')

/** @typedef {import('./clients/constance').CLIENTS} CLIENTS */

/** @typedef {import('./builder').Condition} Condition */
/** @typedef {Condition[]} Conditions */

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
  logger: () => console.log,
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
  this.client = xSQL.getClient(this.host.client)

  /** @private */
  this._state = { ...defaultState }

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

  this.clean = function () {
    this._state = { ...defaultState }
    return this
  }
  /**
   * Take a "snapshot" of the xSQL instance, returning a new instance.
   * @returns {xSQL}
   */
  this.clone = function () {
    const clone = xSQL(this.hostId)
    clone._state = { ...this._state }
    return clone
  }

  // Transaction
  this.transaction = transaction(xSQL, hostId)

  // Client
  this.escape = this.client.escape
  this.query = async function (sql, params) {
    const conn = this.conn || await this.client.getConn(this.hostId)
    return this.client.query(conn, sql, params)
  }
  this.getStatement = function () {
    return this.client.getStatement(this._state)
  }



  return this
}

/** @type {string} */
xSQL.defaultHost = ''

/** @type {HostOptions} */
xSQL.options = {}

/** @type {HostOptions} */
xSQL.hosts = {}

xSQL.pools = {}

xSQL.clients = clients

/**
 * Initializing the Library
 * @param {defaultOptions} options
 */
xSQL.init = function (options) {
  const { hosts, isLog, logger, ...opts } = { ...defaultOptions, ...options }
  this.options = opts
  this.hosts = Object.keys(hosts).reduce((prev, hostId) => {
    const host = {
      ...opts,
      ...hosts[hostId],
    }

    if (!this.pools[host.client]) {
      this.pools[host.client] = {
        isLog,
        logger,
        pools: {},
      }
    }
    this.pools[host.client].pools[hostId] = host

    return {
      ...prev,
      [hostId]: host,
    }
  }, {})
  Object.keys(this.pools).forEach((client) => {
    this.clients[client].init(this.pools[client])
  })
}

/** @param {CLIENTS} client */
xSQL.getClient = function (client) {
  return xSQL.clients[client]
}

module.exports = xSQL
