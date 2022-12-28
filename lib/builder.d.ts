export type Condition = {
    type: TYPE;
    field: string;
    operator: Operator;
    connector: Connector;
};
export type xSQL = import('./');
export type Row = import('./clients/mysql').Row;
export type KeyValuePair = {
    [key: string]: any;
};
export type Operator = ("=" | "<" | ">" | "<=" | "=>" | "<>" | "like" | "between" | "in" | "find_in_set" | "not" | "not like" | "not between" | "not in" | "is not");
export type Connector = ("AND" | "OR");
export type TYPE = string;
export namespace TYPE {
    const BRACKET_START: string;
    const BRACKET_END: string;
    const NORMAL: string;
}
/**
 * @typedef {Object} Condition
 * @property {TYPE} type
 * @property {string} field
 * @property {Operator} operator
 * @property {Connector} connector
 */
/**
 * @this xSQL
 * @param {Condition} condition
 */
export function _addCondition(this: import("./"), condition: Condition): void;
/**
 * @this xSQL
 * @param {(string|KeyValuePair|(q: xSQL) => {})} input
 * @param {Operator} operator
 */
export function _addWhereClause(this: import("./"), input: string | KeyValuePair | ((q: xSQL) => {}), operator: Operator, value: any, connector?: string): import("./");
/**
 * @this xSQL
 * @param {(string|KeyValuePair|(q: xSQL) => {})} input
 * @param {Operator} operator
 * @param {*} value
 * @returns {xSQL}
 */
export function where(this: import("./"), input: string | KeyValuePair | ((q: xSQL) => {}), operator: Operator, value: any): xSQL;
/**
 * @this xSQL
 * @param {(string|KeyValuePair|(q: xSQL) => {})} input
 * @param {Operator} operator
 * @param {*} value
 * @returns {xSQL}
 */
export function and(this: import("./"), input: string | KeyValuePair | ((q: xSQL) => {}), operator: Operator, value: any): xSQL;
/**
 * @this xSQL
 * @param {(string|KeyValuePair|(q: xSQL) => {})} input
 * @param {Operator} operator
 * @param {*} value
 * @returns {xSQL}
 */
export function or(this: import("./"), input: string | KeyValuePair | ((q: xSQL) => {}), operator: Operator, value: any): xSQL;
/**
 * @this xSQL
 * @param {('*'|string|string[])} input
 */
export function select(this: import("./"), input?: ('*' | string | string[])): import("./");
/**
 * @this xSQL
 * @param { (row: Row) => Row } cb
 */
export function filter(this: import("./"), cb: (row: Row) => Row): import("./");
/**
 * @this xSQL
 * @param {('*'|string|string[])} input
 */
export function groupBy(this: import("./"), input: ('*' | string | string[])): import("./");
/**
 * @this xSQL
 * @param {('*'|string)} input
 */
export function having(this: import("./"), input: ('*' | string)): import("./");
/**
 * @this xSQL
 * @param {('*'|string|string[])} input
 */
export function orderBy(this: import("./"), input: ('*' | string | string[])): import("./");
/**
 * @this xSQL
 * @param {number} input
 */
export function limit(this: import("./"), input: number): import("./");
/**
 * @this xSQL
 * @param {number} input
 */
export function offset(this: import("./"), input: number): import("./");
/**
 * @this xSQL
 * @param {boolean} input
 */
export function log(this: import("./"), input: boolean): import("./");