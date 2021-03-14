/** @typedef { import('./') } xSQL */
/** @typedef { import('./clients/mysql').Row } Row */

const is = require('./is')

/** @typedef { {[key: string]: any } } KeyValuePair */
/** @typedef {("="|"<"|">"|"<="|"=>"|"<>"|"like"|"between"|"in"|"find_in_set"|"not"|"not like"|"not between"|"not in"|"is not")} Operator */
/** @typedef {("AND"|"OR")} Connector */

/** @enum {string} */
const TYPE = {
  BRACKET_START: 'BRACKET_START',
  BRACKET_END: 'BRACKET_END',
  NORMAL: 'NORMAL',
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
function _addCondition(condition) {
  this._state.conditions.push(condition)
}
/** 
 * @this xSQL 
 * @param {(string|KeyValuePair|(q: xSQL) => {})} input
 * @param {Operator} operator
 */
function _addWhereClause(input, operator, value, connector = 'AND') {
  if (is.fn(input)) {
    this._addCondition({ type: TYPE.BRACKET_START, connector })
    input(this)
    this._addCondition({ type: TYPE.BRACKET_END })
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
 * @this xSQL
 * @param {(string|KeyValuePair|(q: xSQL) => {})} input
 * @param {Operator} operator
 * @param {*} value 
 * @returns {xSQL}
 */
function where(input, operator, value) {
  return this._addWhereClause(input, operator, value)
}

/** @type {where} */
function and(input, operator, value) {
  return this._addWhereClause(input, operator, value)
}

/** @type {where} */
function or(input, operator, value) {
  return this._addWhereClause(input, operator, value, 'OR')
}

/** 
 * @this xSQL
 * @param {('*'|string|string[])} input 
 */
function select(input = '*') {
  this._state.select = is.array(input)
    ? input.join(', ')
    : input
  return this
}

/**
 * @this xSQL
 * @param { (row: Row) => Row } cb
 */
function filter(cb) {
  this._state.filter = cb
  return this
}

/**
 * @this xSQL
 * @param {('*'|string|string[])} input 
 */
function groupBy(input) {
  this._state.groupBy = is.array(input)
    ? input.join(', ')
    : input
  return this
}

/**
 * @this xSQL
 * @param {('*'|string|string[])} input 
 */
function orderBy(input) {
  this._state.orderBy = is.array(input)
    ? input.join(', ')
    : input
  return this
}

/**
 * @this xSQL
 * @param {number} input
 */
function limit(input) {
  this._state.limit = input
  return this
}

/**
 * @this xSQL
 * @param {number} input
 */
function offset(input) {
  this._state.offset = input
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
  groupBy,
  orderBy,
  limit,
  offset,
}
