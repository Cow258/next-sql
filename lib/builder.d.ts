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
export function _addCondition(this: xsql, condition: Condition): void;
/**
 * @this xsql
 * @param {(string|KeyValuePair|(q: xsql) => {})} input
 * @param {Operator} operator
 */
export function _addWhereClause(this: xsql, input: (string | KeyValuePair | ((q: xsql) => {})), operator: Operator, value: any, connector?: string): xsql;
/**
 * @see {@link where}
 * @overload
 * @this xsql
 * @param {KeyValuePair} input
 * @returns {xsql}
 */
export function where(this: xsql, input: KeyValuePair): xsql;
/**
 * @see {@link where}
 * @overload
 * @this xsql
 * @param {string} input
 * @param {Array} operator
 * @returns {xsql}
 */
export function where(this: xsql, input: string, operator: any[]): xsql;
/**
 * @see {@link where}
 * @overload
 * @this xsql
 * @param {(q: xsql) => xsql | void} input
 * @returns {xsql}
 */
export function where(this: xsql, input: (q: xsql) => xsql | void): xsql;
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
export function where(this: xsql, input: string, operator: Operator, value: any): xsql;
/** @type {typeof where} */
export function and(input: any, operator: any, value: any): any;
/** @type {typeof where} */
export function or(input: any, operator: any, value: any): any;
/**
 * @this xsql
 * @param {('*'|string|string[])} input
 */
export function select(this: xsql, input?: ("*" | string | string[])): xsql;
/**
 * Modify the output rows before fetching relationship
 * @this xsql
 * @param { (row: any) => any } cb
 */
export function filter(this: xsql, cb: (row: any) => any): xsql;
/**
 * Modify the output rows after fetching relationship
 * @this xsql
 * @param { (row: any) => any } cb
 */
export function map(this: xsql, cb: (row: any) => any): xsql;
/**
 * ```sql
 * SELECT * FROM users GROUP BY {input}
 * ```
 * @this xsql
 * @param {('*'|string|string[])} input
 */
export function groupBy(this: xsql, input: ("*" | string | string[])): xsql;
/**
 * ```sql
 * SELECT * FROM users HAVING {input}
 * ```
 * @this xsql
 * @param {('*'|string)} input
 */
export function having(this: xsql, input: ("*" | string)): xsql;
/**
 * ```sql
 * SELECT * FROM users GROUP BY {input}
 * ```
 * @this xsql
 * @param {('*'|string|string[])} input
 */
export function orderBy(this: xsql, input: ("*" | string | string[])): xsql;
/**
 * ```sql
 * SELECT * FROM users LIMIT {input}
 * ```
 * @this xsql
 * @param {number} input
 */
export function limit(this: xsql, input: number): xsql;
/**
 * ```sql
 * SELECT * FROM users LIMIT 0,{input}
 * ```
 * @this xsql
 * @param {number} input
 */
export function offset(this: xsql, input: number): xsql;
/**
 * Determine whether to enable logging
 * @this xsql
 * @param {boolean} input
 */
export function log(this: xsql, input: boolean): xsql;
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
export function extend(this: xsql, extendsFn: (q: xsql) => void): xsql;
/**
 * Add `FOR UPDATE` to the end of the query
 *
 * `Only available in transaction`
 * @this xsql
 * @param {boolean} input
 */
export function forUpdate(this: xsql, input?: boolean): xsql;
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
export function join(this: xsql, sql: string, params?: any[]): xsql;
/**
 * @this xsql
 * @param {string} sql
 * @param {any[]} [params]
 */
export function leftJoin(this: xsql, sql: string, params?: any[]): xsql;
/**
 * @this xsql
 * @param {string} sql
 * @param {any[]} [params]
 */
export function rightJoin(this: xsql, sql: string, params?: any[]): xsql;
