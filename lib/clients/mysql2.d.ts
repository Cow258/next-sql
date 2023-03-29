export type xsql = import('../index');
export type Conditions = import('../index').Conditions;
export type State = import('../index').State;
export type Command = import('../index').Command;
export type mysql2 = typeof import("mysql2");
export type PoolCluster = import('mysql2').PoolCluster;
export type PoolClusterConfig = import('mysql2').PoolClusterConfig;
export type PoolConnection = import('mysql2').PoolConnection;
export type OkPacket = import('mysql2').OkPacket;
export type Row = {
    [field: string]: string | number | boolean | Buffer | Date;
};
export type Filter = (row: Row) => Row[];
export type QueryReturn = Promise<Row[] | OkPacket>;
declare const client: mysql2;
declare const pool: PoolCluster;
declare const isLog: boolean;
declare const isInit: boolean;
declare const logger: (msg: string) => void;
declare function escape(value: any): string;
type escape = typeof import("mysql2").escape;
/** @param {PoolClusterConfig} config */
declare function init(config: any): void;
declare function close(): Promise<any>;
/** @private */
declare function _checkInit(): Promise<void>;
/**
 * @param {string} hostId
 * @returns {Promise<PoolConnection>}
 */
declare function getConnection(hostId: string): Promise<import("mysql2").PoolConnection>;
/**
 * @param {PoolConnection} conn
 * @param {string} sql
 * @param {any[]} params
 * @param {boolean} log
 * @returns {any[]}
 */
declare function query(conn: import("mysql2").PoolConnection, sql: string, params: any[], log: boolean): any[];
/**
 * @param {PoolConnection} conn
 */
declare function getTransaction(conn: import("mysql2").PoolConnection): {
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
