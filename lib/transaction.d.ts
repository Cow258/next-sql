export = transaction;
/** @typedef {import('./')} xsql */
/** @typedef {import('mysql').MysqlError} MysqlError */
/**
 * @param {xsql} xsql
 * @param {hostId} hostId
 */
declare function transaction(xsql: xsql, hostId: any): (callback: (t: () => import("./")) => Promise<any>) => Promise<void>;
declare namespace transaction {
    export { xsql, MysqlError };
}
type xsql = import('./');
type MysqlError = import('mysql').MysqlError;
