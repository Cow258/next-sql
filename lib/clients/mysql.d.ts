export type xsql = import('../index');
export type Conditions = import('../index').Conditions;
export type State = import('../index').State;
export type Command = import('../index').Command;
export type mysql = typeof import("mysql");
export type PoolCluster = import('mysql').PoolCluster;
export type PoolClusterConfig = import('mysql').PoolClusterConfig;
export type PoolConnection = import('mysql').PoolConnection;
export type OkPacket = import('mysql').OkPacket;
export type Row = {
    [field: string]: string | number | boolean | Buffer | Date;
};
export type Filter = (row: Row) => Row[];
export type QueryReturn = Promise<Row[] | OkPacket>;
declare const client: mysql;
declare const pool: PoolCluster;
declare const isLog: boolean;
declare const isInit: boolean;
declare const logger: (msg: string) => void;
declare function escape(value: any, stringifyObjects?: boolean | undefined, timeZone?: string | undefined): string;
type escape = typeof import("mysql").escape;
/** @param {PoolClusterConfig} config */
declare function init(config: import("mysql").PoolClusterConfig): void;
/** @private */
declare function _checkInit(): void;
/**
 * @param {string} hostId
 * @returns {Promise<PoolConnection>}
 */
declare function getConnection(hostId: string): Promise<import("mysql").PoolConnection>;
/**
 * @param {PoolConnection} conn
 * @param {string} sql
 * @param {any[]} params
 * @param {boolean} log
 * @returns {any[]}
 */
declare function query(conn: import("mysql").PoolConnection, sql: string, params: any[], log: boolean): any[];
/**
 * @param {PoolConnection} conn
 */
declare function getTransaction(conn: import("mysql").PoolConnection): {
    beginTransaction(): Promise<any>;
    commit(): Promise<any>;
    rollback(): Promise<any>;
    release(): void;
};
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
declare function toStatement(cmd: import("../command").Command, table: string, state: import("../index").State, data: any, options?: {
    primaryKeys: Set<any>;
    sumKeys: Set<any>;
    jsonKeys: string[];
}): [sql: string, params: any[]];
/**
 * @param {string} sql
 * @param {any[]} params
 * @returns {string}
 */
declare function toRaw(sql: string, params: any[]): string;
export {};
