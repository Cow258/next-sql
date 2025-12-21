/** @typedef { import('./') } xsql */
/** @typedef { import('../clients/mysql').Row } Row */

const is = require('./is')

/** @typedef { {[key: string]: any } } KeyValuePair */
/** @typedef {("="|"<"|">"|"<="|"=>"|"<>"|"like"|"between"|"in"|"find_in_set"|"not"|"not like"|"not between"|"not in"|"is not")} Operator */
/** @typedef {("AND"|"OR")} Connector */

/** @enum {string} */
const TYPE = {
  BRACKET_START: 'BRACKET_START',
  BRACKET_END: 'BRACKET_END',
  NORMAL: 'NORMAL',
  RAW: 'RAW',
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
function _addCondition(condition) {
  this._state.conditions.push(condition)
}
/**
 * @this xsql
 * @param {(string|KeyValuePair|(q: xsql) => {})} input
 * @param {Operator} operator
 */
function _addWhereClause(input, operator, value, connector = 'AND') {
  if (is.fn(input)) {
    this._addCondition({ type: TYPE.BRACKET_START, connector })
    input(this)
    this._addCondition({ type: TYPE.BRACKET_END })
    return this
  }
  if (is.string(input) && is.array(operator)) {
    this._addCondition({
      type: TYPE.RAW,
      field: input,
      value: operator,
      connector,
    })
    return this
  }
  if (is.plainObject(input)) {
    Object.keys(input).forEach((key) => {
      this._addCondition({
        type: TYPE.NORMAL,
        field: key,
        operator: '=',
        value: input[key],
        connector,
      })
    })
    return this
  }
  this._addCondition({
    type: TYPE.NORMAL,
    field: input,
    operator: operator.toLowerCase(),
    value,
    connector,
  })
  return this
}

/**
 * @see {@link where}
 * @overload
 * @this xsql
 * @param {KeyValuePair} input
 * @returns {xsql}
 */
/**
 * @see {@link where}
 * @overload
 * @this xsql
 * @param {string} input
 * @param {Array} operator
 * @returns {xsql}
 */
/**
 * @see {@link where}
 * @overload
 * @this xsql
 * @param {(q: xsql) => xsql | void} input
 * @returns {xsql}
 */
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
function where(input, operator, value) {
  return this._addWhereClause(input, operator, value)
}

/** @type {typeof where} */
function and(input, operator, value) {
  return this._addWhereClause(input, operator, value)
}

/** @type {typeof where} */
function or(input, operator, value) {
  return this._addWhereClause(input, operator, value, 'OR')
}

/**
 * @this xsql
 * @param {('*'|string|string[])} input
 */
function select(input = '*') {
  this._state.select = is.array(input)
    ? input.join(', ')
    : input
  return this
}

/**
 * Modify the output rows before fetching relationship
 * @this xsql
 * @param { (row: Row) => Row } cb
 */
function filter(cb) {
  this._state.filter = cb
  return this
}

/**
 * Modify the output rows after fetching relationship
 * @this xsql
 * @param { (row: Row) => Row } cb
 */
function map(cb) {
  this._state.map = cb
  return this
}

/**
 * ```sql
 * SELECT * FROM users GROUP BY {input}
 * ```
 * @this xsql
 * @param {('*'|string|string[])} input
 */
function groupBy(input) {
  this._state.groupBy = is.array(input)
    ? input.join(', ')
    : input
  return this
}

/**
 * ```sql
 * SELECT * FROM users HAVING {input}
 * ```
 * @this xsql
 * @param {('*'|string)} input
 */
function having(input) {
  this._state.having = input
  return this
}

/**
 * ```sql
 * SELECT * FROM users GROUP BY {input}
 * ```
 * @this xsql
 * @param {('*'|string|string[])} input
 */
function orderBy(input) {
  this._state.orderBy = is.array(input)
    ? input.join(', ')
    : input
  return this
}

/**
 * ```sql
 * SELECT * FROM users LIMIT {input}
 * ```
 * @this xsql
 * @param {number} input
 */
function limit(input) {
  this._state.limit = input
  return this
}

/**
 * ```sql
 * SELECT * FROM users LIMIT 0,{input}
 * ```
 * @this xsql
 * @param {number} input
 */
function offset(input) {
  this._state.offset = input
  return this
}

/**
 * Determine whether to enable logging
 * @this xsql
 * @param {boolean} input
 */
function log(input) {
  this._state.log = input
  return this
}

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
function extend(extendsFn) {
  extendsFn(this)
  return this
}

/**
 * Add `FOR UPDATE` to the end of the query
 *
 * `Only available in transaction`
 * @this xsql
 * @param {boolean} input
 */
function forUpdate(input = true) {
  if (!this.isTransaction) return this
  this._state.forUpdate = input
  return this
}

module.exports = {
  TYPE,
  _addCondition,
  _addWhereClause,
  where,
  and,
  or,
  select,
  filter,
  map,
  groupBy,
  having,
  orderBy,
  limit,
  offset,
  log,
  extend,
  forUpdate,
}
