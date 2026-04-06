export type Condition = {
    type: TYPE;
    field: string;
    operator: Operator;
    connector: Connector;
};
export type JoinOption = {
    mode: "JOIN" | "LEFT JOIN" | "RIGHT JOIN";
    sql: string;
    params: any[];
};
export type xsql = import("./");
export type KeyValuePair = {
    [key: string]: any;
};
export type Operator = ("=" | "<" | ">" | "<=" | "=>" | "<>" | "like" | "between" | "in" | "find_in_set" | "not" | "not like" | "not between" | "not in" | "is not");
export type Connector = ("AND" | "OR");
export type TYPE = string;
export namespace TYPE {
    let BRACKET_START: "BRACKET_START";
    let BRACKET_END: "BRACKET_END";
    let NORMAL: "NORMAL";
    let RAW: "RAW";
}
/**
 * @typedef {Object} Condition
 * @property {TYPE} type
 * @property {string} field
 * @property {Operator} operator
 * @property {Connector} connector
 */
/**
 * @this xsql
 * @param {Condition} condition
 */
export function _addCondition(this: import("./"), condition: Condition): void;
/**
 * @this xsql
 * @param {(string|KeyValuePair|(q: xsql) => {})} input
 * @param {Operator} operator
 */
export function _addWhereClause(this: import("./"), input: (string | KeyValuePair | ((q: xsql) => {})), operator: Operator, value: any, connector?: string): import("./");
/**
 * @see {@link where}
 * @overload
 * @this xsql
 * @param {KeyValuePair} input
 * @returns {xsql}
 */
export function where(this: import("./"), input: KeyValuePair): xsql;
/**
 * @see {@link where}
 * @overload
 * @this xsql
 * @param {string} input
 * @param {Array} operator
 * @returns {xsql}
 */
export function where(this: import("./"), input: string, operator: any[]): xsql;
/**
 * @see {@link where}
 * @overload
 * @this xsql
 * @param {(q: xsql) => xsql | void} input
 * @returns {xsql}
 */
export function where(this: import("./"), input: (q: xsql) => xsql | void): xsql;
/**
 * ```js
 * xsql()
 *   .where({ id: 1 })
 *   .where('id', '=', 1)
 *   .where('id', '>', 1)
 *   .where('id', 'find_in_set', 1)
 *   .where('id', 'between', [1,2])
 *   .where('id', 'in', [1,2])
 *   .where('name', 'like', '%john%')
 *   .where('id = ? AND age > ?', [1, 18])
 *   .where('money > 0', [])
 *   .where('MATCH(title, content) AGAINST(? IN NATURAL LANGUAGE MODE)', [keyword])
 * ```
 * @see {@link where}
 * @overload
 * @this xsql
 * @param {string} input
 * @param {Operator} operator
 * @param {*} value
 * @returns {xsql}
 */
export function where(this: import("./"), input: string, operator: Operator, value: any): xsql;
/** @type {typeof where} */
export function and(input: any, operator: any, value: any): any;
/** @type {typeof where} */
export function or(input: any, operator: any, value: any): any;
/**
 * @this xsql
 * @param {('*'|string|string[])} input
 */
export function select(this: import("./"), input?: ("*" | string | string[])): import("./");
/**
 * Modify the output rows before fetching relationship
 * @this xsql
 * @param { (row: any) => any } cb
 */
export function filter(this: import("./"), cb: (row: any) => any): import("./");
/**
 * Modify the output rows after fetching relationship
 * @this xsql
 * @param { (row: any) => any } cb
 */
export function map(this: import("./"), cb: (row: any) => any): import("./");
/**
 * ```sql
 * SELECT * FROM users GROUP BY {input}
 * ```
 * @this xsql
 * @param {('*'|string|string[])} input
 */
export function groupBy(this: import("./"), input: ("*" | string | string[])): import("./");
/**
 * ```sql
 * SELECT * FROM users HAVING {input}
 * ```
 * @this xsql
 * @param {('*'|string)} input
 */
export function having(this: import("./"), input: ("*" | string)): import("./");
/**
 * ```sql
 * SELECT * FROM users GROUP BY {input}
 * ```
 * @this xsql
 * @param {('*'|string|string[])} input
 */
export function orderBy(this: import("./"), input: ("*" | string | string[])): import("./");
/**
 * ```sql
 * SELECT * FROM users LIMIT {input}
 * ```
 * @this xsql
 * @param {number} input
 */
export function limit(this: import("./"), input: number): import("./");
/**
 * ```sql
 * SELECT * FROM users LIMIT 0,{input}
 * ```
 * @this xsql
 * @param {number} input
 */
export function offset(this: import("./"), input: number): import("./");
/**
 * Determine whether to enable logging
 * @this xsql
 * @param {boolean} input
 */
export function log(this: import("./"), input: boolean): import("./");
/**
 * Extend the query with a pre-set query
 *
 * Used to separate the query into multiple parts and reuse them easily
 * ### Example:
 * ```js
 * const UserModel = {
 *   Extend: {
 *     BasicInfo: (sql = xsql()) => {
 *       sql
 *         .select(['id', 'name', 'email'])
 *         .where({ status: 1 })
 *         .fromMany('cars', 'id:cars.userId', {
 *           query: (q) => {
 *             q.select(['id', 'model', 'color'])
 *             q.where({ status: 1 })
 *           }
 *         })
 *       }
 *     }
 *   }
 * }
 * const userRowsWithBasicInfo = await xsql()
 *   .extend(UserModel.Extend.BasicInfo)
 *   .where({ id: 1 })
 *   .read('users')
 * ```
 * @this xsql
 * @param {(q:xsql)=>void} extendsFn
 */
export function extend(this: import("./"), extendsFn: (q: xsql) => void): import("./");
/**
 * Add `FOR UPDATE` to the end of the query
 *
 * `Only available in transaction`
 * @this xsql
 * @param {boolean} input
 */
export function forUpdate(this: import("./"), input?: boolean): import("./");
/**
 * @typedef {Object} JoinOption
 * @property {'JOIN'|'LEFT JOIN'|'RIGHT JOIN'} mode
 * @property {string} sql
 * @property {any[]} params
 */ /** @exports JoinOption */
/**
 * Add a join to the query
 * @this xsql
 * @param {string} sql
 * @param {any[]} [params]
 */
export function join(this: import("./"), sql: string, params?: any[]): import("./");
/**
 * @this xsql
 * @param {string} sql
 * @param {any[]} [params]
 */
export function leftJoin(this: import("./"), sql: string, params?: any[]): import("./");
/**
 * @this xsql
 * @param {string} sql
 * @param {any[]} [params]
 */
export function rightJoin(this: import("./"), sql: string, params?: any[]): import("./");
