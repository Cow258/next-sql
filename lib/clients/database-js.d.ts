export type xsql = import('../index');
export type Conditions = import('../index').Conditions;
export type State = import('../index').State;
export type Command = import('../index').Command;
export type database = typeof import("@planetscale/database");
export type Connection = import('@planetscale/database').Connection;
export type ExecutedQuery = import('@planetscale/database').ExecutedQuery;
export type Row = {
    [field: string]: string | number | boolean | Buffer | Date;
};
export type Filter = (row: Row) => Row[];
export type QueryReturn = Promise<Row[] | ExecutedQuery>;
export type HostOptions = {
    client: "database-js";
    host: string;
    user: string;
    password: string;
    database: string;
};
export type ConfigOptions = {
    isLog: boolean;
    logger: () => {};
    pools: {
        [x: string]: HostOptions;
    };
};
declare const client: database;
declare const pool: Map<string, Connection>;
declare const isLog: boolean;
declare const isInit: boolean;
declare const logger: (msg: string) => void;
type escape = any;
type escapeId = any;
/** @param {ConfigOptions} config */
declare function init(config: ConfigOptions): void;
declare function close(): null;
/** @private */
declare function _checkInit(): Promise<void>;
/**
 * @param {string} hostId
 * @returns {Promise<Connection>}
 */
declare function getConnection(hostId: string): Promise<import("@planetscale/database").Connection>;
/**
 * @param {Connection} conn
 * @param {string} sql
 * @param {any[]} params
 * @param {boolean} log
 * @returns {any[]}
 */
declare function query(conn: import("@planetscale/database").Connection, sql: string, params: any[], log: boolean): any[];
/**
 * @param {Connection} conn
 */
declare function getTransaction(conn: import("@planetscale/database").Connection): Promise<any>;
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
