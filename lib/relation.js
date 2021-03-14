/** @typedef {import('./')} xSQL */
/** @typedef {import('./array').ReadResult} ReadResult */

const chalk = require('chalk')

const is = require('./is')

/**
 * @typedef {Object} RelationOptions
 * @property {('toOne'|'toMany'|'fromOne')} type
 * @property {string} currentKey
 * @property {string} targetTable
 * @property {string} targetKey
 * @property {string} addonKey
 * @property {string} splitter
 * @property {(row: ReadResult) => (row: ReadResult)} filter
 * @property {(q: xSQL) => {}} query
 */

/** @param {string} input */
function mapHelper(input) {
  const [
    ,
    currentKey,
    targetTable,
    targetKey,
  ] = /^(.+):(.+)\.(.+)$/g.exec(input)
  return {
    currentKey,
    targetTable,
    targetKey,
  }
}

/** @this xSQL */
function addToState(options) {
  const {
    type,
    currentKey,
    targetTable,
    targetKey,
    addonKey,
    splitter,
    select,
    filter,
    query,
  } = {
    type: '',
    currentKey: '',
    targetTable: '',
    targetKey: '',
    addonKey: null,
    splitter: ',',
    select: null,
    filter: null,
    query: null,
    ...options,
  }
  this._state.relation.push({
    type,
    currentKey,
    targetTable,
    targetKey,
    addonKey,
    splitter,
    select,
    filter,
    query,
  })
}

/**
 * @this xSQL
 * @param {'currentKey:targetTable.targetKey'} mapper 
 * @param {Object} options 
 * @param {string} options.addonKey
 * @param {(row: ReadResult) => (row: ReadResult)} options.filter
 * @param {(q: xSQL) => {}} options.query
 */
function toOne(mapper, options = {}) {
  addToState.call(this, {
    type: 'toOne',
    ...mapHelper(mapper),
    ...options,
  })
  return this
}

/**
 * @this xSQL
 * @param {'currentKey:targetTable.targetKey'} mapper 
 * @param {Object} options 
 * @param {string} options.addonKey
 * @param {string} options.splitter
 * @param {(row: ReadResult) => (row: ReadResult)} options.filter
 * @param {(q: xSQL) => {}} options.query
 */
function toMany(mapper, options = {}) {
  addToState.call(this, {
    type: 'toMany',
    ...mapHelper(mapper),
    ...options,
  })
  return this
}

/**
 * @this xSQL
 * @param {string} addonKey 
 * @param {'currentKey:targetTable.targetKey'} mapper 
 * @param {Object} options 
 * @param {(row: ReadResult) => (row: ReadResult)} options.filter
 * @param {(q: xSQL) => {}} options.query
 */
function fromOne(addonKey, mapper, options = {}) {
  addToState.call(this, {
    type: 'fromOne',
    ...mapHelper(mapper),
    addonKey,
    ...options,
  })
  return this
}

/**
 * @this xSQL
 * @param {ReadResult} currentRows
 * @param {xSQL} xSQL
 */
async function _relationFetch(currentRows, xSQL) {
  let { relation: relationOptions } = this._state
  if (!relationOptions.length) return
  if (!currentRows.length) return

  relationOptions = relationOptions.map((r) => ({
    ...r,
    currentIds: [],
    targetRows: [],
  }))

  const errList = []
  const startAt = Date.now()
  // Fetch relation table
  const defers = []
  for (const relation of relationOptions) {
    for (const currentRow of currentRows) {
      if (!currentRow[relation.currentKey]) continue
      if (relation.type === 'toOne') {
        relation.currentIds.push(currentRow[relation.currentKey])
      } else if (relation.type === 'toMany') {
        if (!currentRow[relation.currentKey]) continue
        relation.currentIds.push(
          ...`${currentRow[relation.currentKey]}`.split(relation.splitter)
        )
      }
    }
    defers.push((async () => {
      /** @type {xSQL} */
      const xsql = xSQL(this.hostId)

      if (relation.select) {
        xsql.select(relation.select)
      }
      if (is.fn(relation.query)) {
        relation.query(xsql)
      }
      if (is.fn(relation.filter) || is.async(relation.filter)) {
        xsql.filter(relation.filter)
      }
      if (relation.type === 'fromOne') {
        xsql.where(relation.targetKey, 'in', currentRows.map(currentRow => currentRow[relation.currentKey]))
      } else {
        const targetIds = [...new Set(relation.currentIds)]
        if (!targetIds.length) return
        xsql.where(relation.targetKey, 'in', targetIds)
      }

      const targetResult = await xsql.read(relation.targetTable)
      targetResult.forEach((targetRow) => {
        if (relation.type === 'fromOne') {
          const key = targetRow[relation.targetKey]
          if (relation.targetRows[key]) {
            relation.targetRows[key].push(targetRow)
          } else {
            relation.targetRows[key] = [targetRow]
          }
        } else {
          const key = targetRow[relation.targetKey]
          relation.targetRows[`${key}`] = targetRow
        }
      })
    })())
  }
  await Promise.all(defers)

  // Map to result
  for (const currentRow of currentRows) {
    for (const relation of relationOptions) {
      if (relation.type === 'toOne') {
        if (is.string(relation.addonKey)) {
          currentRow[relation.addonKey] = relation.targetRows[currentRow[relation.currentKey]]
        } else {
          currentRow[relation.currentKey] = relation.targetRows[currentRow[relation.currentKey]]
        }
      } else if (relation.type === 'toMany') {
        const ary = []
        for (const s of `${currentRow[relation.currentKey]}`.split(relation.splitter)) {
          const target = relation.targetRows[s]
          if (is.defined(target)) {
            ary.push(target)
          }
        }
        if (is.string(relation.addonKey)) {
          currentRow[relation.addonKey] = ary
        } else {
          currentRow[relation.currentKey] = ary
        }
      } else if (relation.type === 'fromOne') {
        currentRow[relation.addonKey] = relation.targetRows[currentRow[relation.currentKey]] || []
      }
    }
  }
  if (xSQL.isLog) {
    xSQL.logger(`${chalk.underline(`${Date.now() - startAt}ms`)} xSQL._relationFetch()`)
  }
  return errList
}

module.exports = {
  _relationFetch,
  toOne,
  toMany,
  fromOne,
}
