export type xsql = import('../index')
export type Conditions = import('../index').Conditions
export type State = import('../index').State
export type Command = import('../index').Command
export type mysql = any
export type PoolCluster = any
export type PoolClusterConfig = any
export type PoolConnection = any
export type OkPacket = any
export type Row = {
  [field: string]: string | number | boolean | Buffer | Date
}
export type Filter = (row: Row) => Row[]
export type QueryReturn = Promise<Row[] | OkPacket>
declare const client: any
declare const pool: any
declare const isLog: boolean
declare const isInit: boolean
declare const logger: (msg: string) => void
type escape = any
/** @param {PoolClusterConfig} config */
declare function init(config: any): void
/** @private */
declare function _checkInit(): void
/**
 * @param {string} hostId
 * @returns {Promise<PoolConnection>}
 */
declare function getConnection(hostId: string): Promise<any>
/**
 * @param {PoolConnection} conn
 * @param {string} sql
 * @param {any[]} params
 * @param {boolean} log
 * @returns {any[]}
 */
declare function query(
  conn: any,
  sql: string,
  params: any[],
  log: boolean
): any[]
/**
 * @param {PoolConnection} conn
 */
declare function getTransaction(conn: any): {
  beginTransaction(): Promise<any>
  commit(): Promise<any>
  rollback(): Promise<any>
  release(): void
}
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
declare function toStatement(
  cmd: import('../command').Command,
  table: string,
  state: import('../index').State,
  data: any,
  options?: {
    primaryKeys: Set<any>
    sumKeys: Set<any>
    jsonKeys: string[]
  }
): [sql: string, params: any[]]
/**
 * @param {string} sql
 * @param {any[]} params
 * @returns {string}
 */
declare function toRaw(sql: string, params: any[]): string
export {}
