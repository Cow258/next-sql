/** @typedef {import('../index')} xsql */
/** @typedef {import('../index').Conditions} Conditions */
/** @typedef {import('../index').State} State */
/** @typedef {import('../index').Command} Command */

/** @typedef {import('@planetscale/database')} database */
/** @typedef {import('@planetscale/database').Connection} Connection */
/** @typedef {import('@planetscale/database').ExecutedQuery} ExecutedQuery */
/** @typedef {import('sqlstring').escape} escape */
/** @typedef {import('sqlstring').escapeId} escapeId */
/** @typedef {{ [field: string] : (string|number|Date|boolean|Buffer) }} Row */

/** @typedef {(row: Row) => Row[]} Filter */
/** @typedef {Promise<Row[]|ExecutedQuery>} QueryReturn */

/**
 * @typedef {Object} HostOptions
 * @property {"database-js"} client
 * @property {string} host
 * @property {string} user
 * @property {string} password
 * @property {string} database
 */
/**
 * @typedef {Object} ConfigOptions
 * @property {boolean} isLog
 * @property {()=>{}} logger
 * @property {Object<string,HostOptions>} pools
 */

const chalk = require('chalk')
const SqlString = require('sqlstring')

const { getLastItem } = require('../lib/array')
const { TYPE } = require('../lib/builder')
const xsql = require('../lib/index')
const is = require('../lib/is')

function _timeDiff(ms) {
  return chalk.underline(`${Date.now() - ms}ms`)
}

const databaseJs = {
  /** @type {database} */
  client: require('@planetscale/database'),
  /** @type {Map<string,Connection>} */
  pool: new Map(),
  /** @type {boolean} */
  isLog: false,
  /** @type {boolean} */
  isInit: false,
  /** @type {(msg: string) => void} */
  logger: () => { },
  /** @type {escape} */
  escape(...args) {
    return SqlString.escape(...args)
  },
  /** @type {escapeId} */
  escapeId(...args) {
    return SqlString.escapeId(...args)
  },

  /** @param {ConfigOptions} config */
  init(config) {
    if (this.isInit) return
    // console.info('xsql: client init => databaseJs', config)
    const {
      isLog,
      logger,
      pools,
    } = config
    this.isLog = isLog
    this.logger = logger
    Object.keys(pools).forEach((hostId) => {
      const { host, user, password } = pools[hostId]
      this.pool.set(hostId, this.client.connect({
        cast: (field, value) => {
          if (field.type === 'INT64' || field.type === 'UINT64') {
            return is.defined(value) ? Number(value) : null
          }
          return this.client.cast(field, value)
        },
        format: SqlString.format,
        host,
        username: user,
        password,
      }))
    })
    this.isInit = true
  },

  close() {
    return null
  },

  /** @private */
  async _checkInit() {
    let count = 0
    while (!this.isInit && count < 20) {
      await new Promise(resolve => setTimeout(resolve, 100))
      count++
    }
    if (!this.isInit) throw new Error('Please run sql.init() before query')
  },


  /**
   * @param {string} hostId
   * @returns {Promise<Connection>}
   */
  async getConnection(hostId) {
    await this._checkInit()
    return this.pool.get(hostId)
  },


  /**
   * @param {Connection} conn
   * @param {string} sql
   * @param {any[]} params
   * @param {boolean} log
   * @returns {any[]}
   */
  async query(conn, sql, params, log) {
    await this._checkInit()
    const isLog = is.defined(log) ? log : this.isLog
    const self = this
    const startAt = Date.now()
    try {
      const result = await conn.execute(sql, params)
      if (isLog) self.logger(`${_timeDiff(startAt)} ${result.statement}`)
      if (sql.startsWith('SELECT')) return result.rows
      return result
    } catch (error) {
      if (isLog) self.logger(`${_timeDiff(startAt)} ${SqlString.format(sql, params)}`)
      error.stack = `${new Error('Query Error').stack}\n${error.stack}`
      throw error
    }
  },


  /**
   * @param {Connection} conn
   */
  getTransaction(conn) {
    return new Promise((resolve) => {
      conn.transaction(tx => (
        new Promise((txResolve, txReject) => {
          resolve({
            getConnection: () => (tx),
            beginTransaction: () => { },
            commit: () => txResolve(),
            rollback: () => txReject(),
            release: () => { },
          })
        })
      ))
    })
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
      having,
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
      case 'update': {
        const keys = Object.keys(data)
        const values = []
        for (const k of keys) {
          if (sumKeys.has(k)) {
            values.push(`\`${k}\` = \`${k}\` + ?`)
          } else {
            values.push(`\`${k}\` = ?`)
          }
        }
        sql.push('UPDATE')
        sql.push(table)
        sql.push('SET')
        sql.push(values.join(', '))
        params.push(...keys.map(key => data[key]))
        break
      }
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

      switch (type) {
        case TYPE.NORMAL: {
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
            // Not function field like MIN() MAX()
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
          break
        }
        case TYPE.RAW: {
          if (!isStartBracket && sql.length) sql.push(connector)
          sql.push(field)
          if (value.length) params.push(...value)
          isStartBracket = false
          break
        }
        case TYPE.BRACKET_START: {
          if (!isStartBracket && sql.length) sql.push(connector)
          isStartBracket = true
          sql.push('(')
          break
        }
        case TYPE.BRACKET_END: {
          sql.push(')')
          break
        }
      }
    })
    if (groupBy) sql.push(`GROUP BY ${groupBy}`)
    if (having) sql.push(`HAVING ${having}`)
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
    return SqlString.format(sql, params)
  },
}

xsql.clients['database-js'] = databaseJs
module.exports = databaseJs
