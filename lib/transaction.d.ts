export = transaction;
/**
 * @param {xsql} xsql
 * @param {hostId} hostId
 * @returns {(callback: (t: typeof xsql) => Promise<void|any>) => Promise<void>}
 */
declare function transaction(xsql: xsql, hostId: any): (callback: (t: typeof xsql) => Promise<void | any>) => Promise<void>;
declare namespace transaction {
    export { xsql, QueryError };
}
type xsql = import("./");
type QueryError = import("mysql2").QueryError;
