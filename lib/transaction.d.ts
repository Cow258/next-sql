export = transaction;
/** @typedef {import('./')} xSQL */
/** @typedef {import('mysql').MysqlError} MysqlError */
/**
 * @param {xSQL} xSQL
 * @param {hostId} hostId
 */
declare function transaction(xSQL: xSQL, hostId: any): (callback: (t: () => import("./")) => Promise<any>) => Promise<void>;
declare namespace transaction {
    export { xSQL, MysqlError };
}
type xSQL = import('./');
type MysqlError = any;
