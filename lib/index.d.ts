export = xsql
/**
 * @namespace xsql
 * @constructs xsql
 * @param {string} hostId
 * @returns {xsql}
 */
declare function xsql(hostId?: string, skip?: boolean): xsql
declare class xsql {
  /**
   * @namespace xsql
   * @constructs xsql
   * @param {string} hostId
   * @returns {xsql}
   */
  constructor(hostId?: string, skip?: boolean)
  /** @type {HostOptions} */
  host: HostOptions
  hostId: string | undefined
  conn: any
  isTransaction: boolean | undefined
  client:
    | {
        client: any
        pool: any
        isLog: boolean
        isInit: boolean
        logger: (msg: string) => void
        init(config: any): void
        _checkInit(): void
        getConnection(hostId: string): Promise<any>
        query(conn: any, sql: string, params: any[], log: boolean): any[]
        getTransaction(conn: any): {
          beginTransaction(): Promise<any>
          commit(): Promise<any>
          rollback(): Promise<any>
          release(): void
        }
        toStatement(
          cmd: command.Command,
          table: string,
          state: State,
          data: any,
          options?: {
            primaryKeys: Set<any>
            sumKeys: Set<any>
            jsonKeys: string[]
          }
        ): [sql: string, params: any[]]
        toRaw(sql: string, params: any[]): string
      }
    | undefined
  isLog: boolean | undefined
  /**
   * @private
   * @type {State}
   */
  private _state
  clean: (() => xsql) | undefined
  /**
   * Take a "snapshot" of the xsql instance, returning a new instance.
   * @returns {xsql}
   */
  clone: (() => xsql) | undefined
  /** @private */
  private _addCondition
  /** @private */
  private _addWhereClause
  where: typeof builder.where | undefined
  and: typeof builder.and | undefined
  or: typeof builder.or | undefined
  select: typeof builder.select | undefined
  filter: typeof builder.filter | undefined
  groupBy: typeof builder.groupBy | undefined
  having: typeof builder.having | undefined
  orderBy: typeof builder.orderBy | undefined
  limit: typeof builder.limit | undefined
  offset: typeof builder.offset | undefined
  log: typeof builder.log | undefined
  /** @private */
  private _runCommand
  /** Read table from database */
  read: typeof command.Read | undefined
  /** Delete rows from table */
  delete: typeof command.Delete | undefined
  /** Update row from table */
  update: typeof command.Update | undefined
  /** Insert a row into table */
  insert: typeof command.Insert | undefined
  /** BatchInsert Insert a row into table */
  batchInsert: typeof command.BatchInsert | undefined
  transaction:
    | ((callback: (t: () => xsql) => Promise<any>) => Promise<void>)
    | undefined
  pagination: typeof pagination | undefined
  /** @private */
  private _relationFetch
  toOne: typeof toOne | undefined
  toMany: typeof toMany | undefined
  fromOne: typeof fromOne | undefined
  escape: any
  /** Get connection of this instance */
  getConnection: (() => Promise<any>) | undefined
  /** Use client native query for fallback */
  query: ((sql: any, params: any) => Promise<any[]>) | undefined
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
  toStatement:
    | ((cmd: Command, table: string, data: any) => Statement)
    | undefined
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
  toRaw: ((sql: string, params: any[]) => string) | undefined
}
declare namespace xsql {
  export {
    defaultHost,
    options,
    hosts,
    pools,
    clients,
    init,
    getClient,
    CLIENTS,
    PaginationOptions,
    PaginationResult,
    RelationOptions,
    Command,
    Condition,
    Conditions,
    State,
    OkPacket,
    HostOptions,
  }
}
type HostOptions = {
  client: 'mysql'
  host: string
  user: string
  password: string
  database: string
}
import command = require('./command')
type State = {
  conditions: Conditions
  select: any
  filter: Function
  groupBy: string
  having: string
  orderBy: string
  limit: number
  offset: number
  log: boolean
  pagination: PaginationOptions
  relation: RelationOptions[]
}
import builder = require('./builder')
import { pagination } from './pagination'
import { toOne } from './relation'
import { toMany } from './relation'
import { fromOne } from './relation'
type Command = import('./command').Command
import { Statement } from './array'
declare var defaultHost: string
declare var options: HostOptions
declare var hosts: HostOptions
declare var pools: {}
import clients = require('./clients')
/**
 * Initializing the Library
 * @param {defaultOptions} options
 */
declare function init(options: {
  isLog: boolean
  logger: (...args: any[]) => void
  /** @type {string} */
  defaultHost: string
  /** @type {{[hostId: string]: HostOptions}} */
  hosts: {
    [hostId: string]: HostOptions
  }
}): void
/** @param {CLIENTS} client */
declare function getClient(client: CLIENTS): {
  client: any
  pool: any
  isLog: boolean
  isInit: boolean
  logger: (msg: string) => void
  init(config: any): void
  _checkInit(): void
  getConnection(hostId: string): Promise<any>
  query(conn: any, sql: string, params: any[], log: boolean): any[]
  getTransaction(conn: any): {
    beginTransaction(): Promise<any>
    commit(): Promise<any>
    rollback(): Promise<any>
    release(): void
  }
  toStatement(
    cmd: command.Command,
    table: string,
    state: State,
    data: any,
    options?: {
      primaryKeys: Set<any>
      sumKeys: Set<any>
      jsonKeys: string[]
    }
  ): [sql: string, params: any[]]
  toRaw(sql: string, params: any[]): string
}
type CLIENTS = import('./clients/constance').CLIENTS
type PaginationOptions = import('./pagination').PaginationOptions
type PaginationResult = import('./pagination').PaginationResult
type RelationOptions = import('./relation').RelationOptions
type Condition = import('./builder').Condition
type Conditions = Condition[]
type OkPacket = {
  /**
   * The insert id after inserting a row into a table with an auto increment primary key.
   */
  insertId: number
  fieldCount: number
  /**
   * The number of affected rows from an insert, update, or delete statement.
   */
  affectedRows: number
  /**
   * The number of changed rows from an update statement. "changedRows" differs from "affectedRows" in that it does not count updated rows whose values were not changed.
   */
  changedRows: number
}
