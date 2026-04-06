export = xsql;
/**
 * @namespace xsql
 * @constructs xsql
 * @param {string} hostId
 * @returns {xsql}
 */
declare function xsql(hostId?: string, skip?: boolean): xsql;
declare class xsql {
    /**
     * @namespace xsql
     * @constructs xsql
     * @param {string} hostId
     * @returns {xsql}
     */
    constructor(hostId?: string, skip?: boolean);
    /** @type {HostOptions} */
    host: HostOptions;
    hostId: string | undefined;
    conn: any;
    isTransaction: boolean | undefined;
    client: any;
    isLog: any;
    /**
     * @type {State}
     */
    _state: State;
    clean: (() => this) | undefined;
    /**
     * Take a "snapshot" of the xsql instance, returning a new instance.
     * @returns {xsql}
     */
    clone: (() => xsql) | undefined;
    /** @private */
    private _addCondition;
    /** @private */
    private _addWhereClause;
    where: typeof builder.where | undefined;
    and: typeof builder.and | undefined;
    or: typeof builder.or | undefined;
    select: typeof builder.select | undefined;
    filter: typeof builder.filter | undefined;
    map: typeof builder.map | undefined;
    groupBy: typeof builder.groupBy | undefined;
    having: typeof builder.having | undefined;
    orderBy: typeof builder.orderBy | undefined;
    limit: typeof builder.limit | undefined;
    offset: typeof builder.offset | undefined;
    log: typeof builder.log | undefined;
    extend: typeof builder.extend | undefined;
    forUpdate: typeof builder.forUpdate | undefined;
    join: typeof builder.join | undefined;
    leftJoin: typeof builder.leftJoin | undefined;
    rightJoin: typeof builder.rightJoin | undefined;
    /** @private */
    private _runCommand;
    /** Read table from database */
    read: typeof command.Read | undefined;
    /** Delete rows from table */
    delete: typeof command.Delete | undefined;
    /** Update row from table */
    update: typeof command.Update | undefined;
    /** Insert a row into table */
    insert: typeof command.Insert | undefined;
    /** BatchInsert Insert a row into table */
    batchInsert: typeof command.BatchInsert | undefined;
    transaction: ((callback: (t: () => transaction.xsql) => Promise<any>) => Promise<void>) | undefined;
    pagination: typeof pagination | undefined;
    /** @private */
    private _relationFetch;
    toOne: typeof toOne | undefined;
    toMany: typeof toMany | undefined;
    fromOne: typeof fromOne | undefined;
    escape: any;
    escapeId: any;
    /** Get connection of this instance */
    getConnection: (() => Promise<any>) | undefined;
    /** Use client native query for fallback */
    query: ((sql: any, params: any) => Promise<any>) | undefined;
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
    toStatement: ((cmd: command.Command, table: string, data: any, options: any) => Statement) | undefined;
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
    toRaw: ((sql: string, params: any[]) => string) | undefined;
}
declare namespace xsql {
    export { defaultHost, options, hosts, pools, clients, init, getClient, close, State, OkPacket, HostOptions };
}
import builder = require("./builder");
import command = require("./command");
import transaction = require("./transaction");
import { pagination } from "./pagination";
import { toOne } from "./relation";
import { toMany } from "./relation";
import { fromOne } from "./relation";
import { Statement } from "./array";
declare var defaultHost: string;
declare var options: HostOptions;
declare var hosts: HostOptions;
declare var pools: {};
declare namespace clients {
    let mysql: {
        client: typeof import("mysql");
        pool: import("../clients/mysql").PoolCluster;
        isLog: boolean;
        isInit: boolean;
        logger: (msg: string) => void;
        escape(value: any, stringifyObjects?: boolean, timeZone?: string): string;
        escapeId(value: string, forbidQualified?: boolean): string;
        init(config: PoolClusterConfig): void;
        close(): Promise<any>;
        _checkInit(): Promise<void>;
        getConnection(hostId: string): Promise<PoolConnection>;
        query(conn: PoolConnection, sql: string, params: any[], log: boolean): any[];
        getTransaction(conn: PoolConnection): {
            beginTransaction(): Promise<any>;
            commit(): Promise<any>;
            rollback(): Promise<any>;
            release(): void;
        };
        toStatement(cmd: import("../clients/mysql").Command, table: string, state: import("../clients/mysql").State, data: any, options?: {
            primaryKeys: Set<any>;
            sumKeys: Set<any>;
            jsonMap: Record<string, "object" | "array">;
        }): [sql: string, params: any[]];
        toRaw(sql: string, params: any[]): string;
    };
    let mysql2: {
        client: typeof import("mysql2");
        pool: import("../clients/mysql2").PoolCluster;
        isLog: boolean;
        isInit: boolean;
        logger: (msg: string) => void;
        escape(value: any, stringifyObjects?: boolean, timeZone?: "local" | "Z" | (string & {})): string;
        escapeId(value: any, forbidQualified?: boolean): string;
        init(config: PoolClusterConfig): void;
        close(): Promise<any>;
        _checkInit(): Promise<void>;
        getConnection(hostId: string): Promise<PoolConnection>;
        query(conn: PoolConnection, sql: string, params: any[], log: boolean): any[];
        getTransaction(conn: PoolConnection): {
            beginTransaction(): Promise<any>;
            commit(): Promise<any>;
            rollback(): Promise<any>;
            release(): void;
        };
        toStatement(cmd: import("../clients/mysql2").Command, table: string, state: import("../clients/mysql2").State, data: any, options?: {
            primaryKeys: Set<any>;
            sumKeys: Set<any>;
            jsonMap: Record<string, "object" | "array">;
        }): [sql: string, params: any[]];
        toRaw(sql: string, params: any[]): string;
    };
    let databaseJs: {
        client: import("../clients/database-js").database;
        pool: Map<string, import("../clients/database-js").Connection>;
        isLog: boolean;
        isInit: boolean;
        logger: (msg: string) => void;
        init(config: ConfigOptions): void;
        close(): null;
        _checkInit(): Promise<void>;
        getConnection(hostId: string): Promise<Connection>;
        query(conn: Connection, sql: string, params: any[], log: boolean): any[];
        getTransaction(conn: Connection): Promise<any>;
        toStatement(cmd: import("../clients/database-js").Command, table: string, state: import("../clients/database-js").State, data: any, options?: {
            primaryKeys: Set<any>;
            sumKeys: Set<any>;
            jsonMap: Record<string, "object" | "array">;
        }): [sql: string, params: any[]];
        toRaw(sql: string, params: any[]): string;
    };
}
/**
 * Initializing the Library \
 * **Example:**
 * ```js
 * const xsql = require('xsql')
 * require('xsql/clients/mysql2')
 * require('xsql/clients/database-js')
 *
 * xsql.init({
 *  // Each connection is created will use the following default config
 *  port: 3306,
 *  connectionLimit: 5,
 *  waitForConnections: true,
 *  acquireTimeout: 120000,
 *  timeout: 120000,
 *  charset: 'utf8mb4',
 *  default: 'staging', // <- The default host id
 *  hosts: {
 *    // All hosts config will override default config
 *    staging: {
 *      client: 'database-js', // <- Required
 *      host: 'example.com',
 *      user: 'username',
 *      password: 'password',
 *      database: 'database',
 *    },
 *    dev: {
 *      client: 'mysql2', // <- Required
 *      host: 'example.com',
 *      user: 'username',
 *      password: 'password',
 *      database: 'database',
 *    }
 *  }
 * })
 * ```
 * @param {defaultOptions} options
 */
declare function init(options: {
    isLog: boolean;
    logger: (...args: any[]) => void;
    /** @type {string} */
    defaultHost: string;
    /** @type {{[hostId: string]: HostOptions}} */
    hosts: {
        [hostId: string]: HostOptions;
    };
}): void;
/** @param {CLIENTS} client */
declare function getClient(client: string): any;
declare function close(): Promise<any[]>;
type State = {
    conditions: builder.Condition[];
    select: string;
    filter: Function;
    groupBy: string;
    having: string;
    orderBy: string;
    limit: number;
    offset: number;
    log: boolean;
    pagination: PaginationOptions;
    relation: RelationOptions[];
    forUpdate: boolean;
    joins: builder.JoinOption[];
};
type OkPacket = {
    /**
     * The insert id after inserting a row into a table with an auto increment primary key.
     */
    insertId: number;
    fieldCount: number;
    /**
     * The number of affected rows from an insert, update, or delete statement.
     */
    affectedRows: number;
    /**
     * The number of changed rows from an update statement. "changedRows" differs from "affectedRows" in that it does not count updated rows whose values were not changed.
     */
    changedRows: number;
};
type HostOptions = {
    client: "mysql" | "mysql2" | "database-js";
    host: string;
    user: string;
    password: string;
    database: string;
};
import type { PaginationOptions } from './pagination';
import type { RelationOptions } from './relation';
