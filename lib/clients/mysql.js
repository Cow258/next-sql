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

const chalk = require('chalk')

const { getLastItem } = require('../array')
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
   * @param {PoolConnection} conn
   * @param {string} sql
   * @param {any[]} params
   * @returns {any[]}
   */
  query(conn, sql, params) {
    this._checkInit()
    const self = this
    const startAt = Date.now()
    return new Promise((resolve, reject) => {
      conn.query(sql, params, function (err, rows) {
        if (self.isLog) self.logger(`${_timeDiff(startAt)} ${this.sql}`)
        if (err) {
          err.stack = `${new Error('Query Error').stack}\n${err.stack}`
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  },


  /**
   * @param {PoolConnection} conn
   */
  getTransaction(conn) {
    return {
      beginTransaction() {
        return new Promise((res, rej) => {
          conn.beginTransaction(err => err ? rej(err) : res())
        })
      },
      commit() {
        return new Promise((res, rej) => {
          conn.commit(err => err ? rej(err) : res())
        })
      },
      rollback() {
        return new Promise((res) => {
          conn.rollback(res)
        })
      },
      release() {
        conn.release()
      },
    }
  },

  /**
   * @param {Command} cmd
   * @param {string} table
   * @param {State} state
   * @param {*} data
   * @param {Object} options
   * @param {Set} options.primaryKeys
   * @param {Set} options.sumKeys
   * @param {string[]} options.jsonKeys
   * @returns {[sql: string, params: any[]]}
   */
  toStatement(cmd, table, state, data, options = {}) {
    const {
      conditions,
      select,
      groupBy,
      orderBy,
      limit,
      offset,
    } = state
    const { primaryKeys, sumKeys } = options

    const sql = []
    const params = []
    switch (cmd) {
      case 'read':
        sql.push('SELECT')
        sql.push(select)
        sql.push('FROM')
        sql.push(table)
        break
      case 'insert':
        sql.push('INSERT INTO')
        sql.push(table)
        sql.push('SET ?')
        params.push(data)
        break
      case 'update':
        sql.push('UPDATE')
        sql.push(table)
        sql.push('SET ?')
        params.push(data)
        break
      case 'delete':
        sql.push('DELETE FROM')
        sql.push(`\`${table}\``)
        break
      case 'batchInsert': {
        const keys = Object.keys(data[0])
        const values = []
        for (const k of keys) {
          if (primaryKeys.has(k)) continue
          if (sumKeys.has(k)) {
            values.push(`\`${k}\` = \`${k}\` + VALUES(\`${k}\`)`)
          } else {
            values.push(`\`${k}\` = VALUES(\`${k}\`)`)
          }
        }

        sql.push('INSERT INTO')
        sql.push(`${table}(\`${keys.join('`, `')}\`)`)
        sql.push('VALUES ? ON DUPLICATE KEY UPDATE')
        sql.push(values.join(', '))

        const ds = data.map(d => Object.values(d))
        params.push(ds)

        return [sql.join(' '), params]
      }
      default: throw Error(`Un-supported command "${cmd}".`)
    }
    let isStartBracket = true
    conditions.forEach(({ type, field, operator, value, connector }, i) => {
      if (i === 0) sql.push('WHERE')
      if (type === TYPE.NORMAL) {
        if (!isStartBracket && sql.length) sql.push(connector)

        // JSON support
        if (field.endsWith('[]')) {
          // Handle array and covert to comma split string
          if (/\./g.test(field)) {
            // {field}.{jsonKey1}.{jsonKey2}[]
            const [first, ...keys] = field.split('.')
            keys[keys.length - 1] = getLastItem(keys).replace(/\[\]$/g, '')
            field = `${first}->>'$.${[...keys].join('.')}'`
          } else {
            // {field}[]
            field = field.replace(/\[\]$/g, '')
          }
          if (operator === 'find_in_set') {
            field = `REPLACE(${field}, '[', '')`
            field = `REPLACE(${field}, ']', '')`
            field = `REPLACE(${field}, '"', '')`
            field = `REPLACE(${field}, ', ', ',')`
          }
        } else if (/^\w+\.(.+)/g.test(field)) {
          // {field}.{jsonKey1}.{jsonKey2}
          const [first, ...keys] = field.split('.')
          field = `${first}->>'$.${keys.join('.')}'`
        } else if (!(/(\(|\)+)/g.test(field))) {
          // Not funtion field like MIN() MAX()
          field = `\`${field}\``
        }

        switch (operator) {
          case 'find_in_set':
            sql.push(`FIND_IN_SET(?, ${field})`)
            params.push(value)
            break
          case 'between':
          case 'not between':
            sql.push(`${field} ${operator} ? AND ?`)
            params.push(...value)
            break
          case 'in':
          case 'not in':
            sql.push(`${field} ${operator} (${value.map(() => '?').join(',')}) `)
            params.push(...value)
            break
          default:
            sql.push(`${field} ${operator} ?`)
            params.push(value)
        }
        isStartBracket = false
      } else {
        if (type === TYPE.BRACKET_START) {
          if (!isStartBracket && sql.length) sql.push(connector)
          isStartBracket = true
          sql.push('(')
        }
        if (type === TYPE.BRACKET_END) {
          sql.push(')')
        }
      }
    })
    if (groupBy) sql.push(`GROUP BY ${groupBy}`)
    if (orderBy) sql.push(`ORDER BY ${orderBy}`)
    if (is.defined(limit) || is.defined(offset)) {
      sql.push('LIMIT')
      sql.push(`${is.defined(offset) ? offset : 0}`)
      if (is.defined(limit)) sql.push(`, ${limit}`)
    }
    return [sql.join(' '), params]
  },

  /**
   * @param {string} sql
   * @param {any[]} params
   * @returns {string}
   */
  toRaw(sql, params) {
    return this.client.format(sql, params)
  },
}

