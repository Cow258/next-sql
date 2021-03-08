/** @typedef {import('../index')} xSQL */
/** @typedef {import('../index').Conditions} Conditions */
/** @typedef {import('../index').State} State */
/** @typedef {import('../index').Command} Command */

/** @typedef {import('mysql')} mysql */
/** @typedef {import('mysql').PoolCluster} PoolCluster */
/** @typedef {import('mysql').PoolClusterConfig} PoolClusterConfig */
/** @typedef {import('mysql').PoolConnection} PoolConnection */
/** @typedef {import('mysql').OkPacket} OkPacket */
/** @typedef {import('mysql').escape} escape */
/** @typedef {{ [field: string] : (string|number|Date|boolean|Buffer) }} Row */

/** @typedef {(row: Row) => Row[]} Filter */
/** @typedef {Promise<Row[]|OkPacket>} QueryReturn */
/** @typedef {(conn: PoolConnection, sql: string) => QueryReturn} QueryOverload1 */
/** @typedef {(conn: PoolConnection, sql: string, params: any[]) => QueryReturn} QueryOverload2 */
/** @typedef {(conn: PoolConnection, sql: string, params: any[], filter: Filter) => QueryReturn} QueryOverload3 */
/** @typedef {(conn: PoolConnection, sql: string, filter: Filter) => QueryReturn} QueryOverload4 */
/** @typedef {QueryOverload1|QueryOverload2|QueryOverload3|QueryOverload4} Query */


const { promisify } = require('util')

const chalk = require('chalk')

const { TYPE } = require('../builder')
const is = require('../is')

function _timeDiff(ms) {
  return chalk.underline(`${Date.now() - ms}ms`)
}

module.exports = {
  /** @type {mysql} */
  client: null,
  /** @type {PoolCluster} */
  pool: null,
  /** @type {boolean} */
  isLog: false,
  /** @type {boolean} */
  isInit: false,
  /** @type {(msg: string) => void} */
  logger: () => { },
  /** @type {escape} */
  escape(...args) {
    return this.client.escape(...args)
  },

  /** @param {PoolClusterConfig} config */
  init(config) {
    const {
      isLog,
      logger,
      pools,
    } = config
    this.isLog = isLog
    this.logger = logger
    this.client = require('mysql')
    this.pool = this.client.createPoolCluster()
    Object.keys(pools).forEach((hostId) => {
      this.pool.add(hostId, pools[hostId])
    })
    this.isInit = true
  },

  /** @private */
  _checkInit() {
    if (!this.isInit) throw new Error('Please run sql.init() before query')
  },


  /**
   * 
   * @param {string} hostId 
   * @returns {Promise<PoolConnection>}
   */
  getConnection(hostId) {
    this._checkInit()
    return new Promise((resolve, reject) => {
      this.pool.getConnection(hostId, (err, conn) => {
        if (err) { reject(err); return }
        resolve(conn)
      })
    })
  },


  /**
   * @type {QueryOverload1|QueryOverload2|QueryOverload3|QueryOverload4}
   * @returns {QueryReturn}
   */
  query(...args) {
    this._checkInit()
    const self = this
    /** @type {PoolConnection} */
    const conn = args.shift()
    const lastArg = args[args.length - 1]
    /** @type {Filter} */
    const filter = is.fn(lastArg) ? args.pop() : null
    /** @type {[string, any[]]} */
    const queryArgs = args

    const startAt = Date.now()

    return new Promise((resolve, reject) => {
      if (filter) {
        const rows = []
        const _query = conn.query(...queryArgs)
        _query
          .on('result', (row) => {
            const temp = filter(row)
            if (temp) row = temp
            rows.push(row)
          })
          .on('error', (err) => {
            err.stack = `${new Error('Query Error').stack}\n${err.stack}`
            reject(err)
          })
          .on('end', function queryEnd() {
            if (self.isLog) self.logger(`${_timeDiff(startAt)} ${this.sql}`)
            resolve(rows)
          })
      } else {
        conn.query(...[...queryArgs, function queryCallback(err, rows) {
          if (self.isLog) self.logger(`${_timeDiff(startAt)} ${this.sql}`)
          if (err) {
            err.stack = `${new Error('Query Error').stack}\n${err.stack}`
            reject(err)
          } else {
            resolve(rows)
          }
        }])
      }
    })
  },


  /**
   * @param {PoolConnection} conn 
   */
  async getTransaction(conn) {
    const beginTransaction = promisify(conn.beginTransaction)
    const query = promisify(conn.query)
    const commit = promisify(conn.commit)
    const rollback = promisify(conn.rollback)
    const { release } = conn
    return {
      conn,
      beginTransaction,
      query,
      commit,
      rollback,
      release,
    }
  },

  /** 
   * @param {Command} cmd
   * @param {string} table
   * @param {State} state
   * @param {*} data
   */
  getStatement(cmd, table, state, data) {
    const {
      conditions,
      select,
      groupBy,
      orderBy,
      limit,
      offset,
    } = state
    const statement = []
    const params = []
    switch (cmd) {
      case 'read':
        statement.push('SELECT')
        statement.push(select)
        statement.push('FROM')
        statement.push(table)
        break
      case 'update':
        statement.push('UPDATE')
        statement.push(table)
        statement.push('SET ?')
        params.push(data)
        break
      case 'insert':
        statement.push('INSERT INTO')
        statement.push(table)
        statement.push('SET ?')
        params.push(data)
        break
      default: throw Error(`Un-supported command "${cmd}".`)
    }
    let isStartBracket = true
    conditions.forEach(({ type, field, operator, value, connector }, i) => {
      if (i === 0) statement.push('WHERE')
      if (type === TYPE.NORMAL) {
        if (!isStartBracket && statement.length) statement.push(connector)
        switch (operator) {
          case 'find_in_set':
            statement.push(`FIND_IN_SET(?, \`${field}\`)`)
            params.push(value)
            break
          case 'between':
          case 'not between':
            statement.push(`\`${field}\` ${operator} ? AND ?`)
            params.push(...value)
            break
          case 'in':
          case 'not in':
            statement.push(`\`${field}\` ${operator} (${value.map(() => '?').join(',')}) `)
            params.push(...value)
            break
          default:
            statement.push(`\`${field}\` ${operator} ?`)
            params.push(value)
        }
        isStartBracket = false
      } else {
        if (type === TYPE.BRACKET_START) {
          if (!isStartBracket && statement.length) statement.push(connector)
          isStartBracket = true
          statement.push('(')
        }
        if (type === TYPE.BRACKET_END) {
          statement.push(')')
        }
      }
    })
    if (groupBy) statement.push(`GROUP BY ${groupBy}`)
    if (orderBy) statement.push(`ORDER BY ${orderBy}`)
    if (limit) statement.push(`LIMIT ${limit}`)
    if (offset) statement.push(`OFFSET ${offset}`)
    return [statement.join(' '), params]
  },

  getRaw(statement, params) {
    return this.client.format(statement, params)
  },
}

