/** @typedef {import('./')} xsql */
/** @typedef {import('./array').ReadResult} ReadResult */

const chalk = require('chalk')

const is = require('./is')
const { parseJson, getByString } = require('./utils')

/**
 * @typedef {Object} RelationOptions
 * @property {('toOne'|'toMany'|'fromOne')} type
 * @property {string} currentKey
 * @property {string} targetTable
 * @property {string} targetKey
 * @property {string} addonKey
 * @property {string} splitter
 * @property {boolean} omitMapperKey
 * @property {(row: ReadResult) => (row: ReadResult)} filter
 * @property {(row: ReadResult) => (row: ReadResult)} map
 * @property {(q: xsql) => {}} query
 * @property {(q: xsql, targetIds: []) => {}} override
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

/** @this xsql */
function addToState(options) {
  const {
    type,
    currentKey,
    targetTable,
    targetKey,
    omitMapperKey,
    arrayMapper,
    addonKey,
    splitter,
    select,
    filter,
    map,
    query,
    override,
  } = {
    type: '',
    currentKey: '',
    targetTable: '',
    targetKey: '',
    omitMapperKey: false,
    arrayMapper: false,
    addonKey: null,
    splitter: ',',
    select: null,
    filter: null,
    map: null,
    query: null,
    override: null,
    ...options,
  }
  this._state.relation.push({
    type,
    currentKey,
    targetTable,
    targetKey,
    omitMapperKey,
    arrayMapper,
    addonKey,
    splitter,
    select,
    filter,
    map,
    query,
    override,
  })
}

/**
 * @this xsql
 * @param {'currentKey:targetTable.targetKey'} mapper
 * @param {Object} options
 * @param {string} options.addonKey
 * @param {boolean} options.omitMapperKey
 * @param {(row: ReadResult) => (row: ReadResult)} options.filter
 * @param {(row: ReadResult) => (row: ReadResult)} options.map
 * @param {(q: xsql) => {}} options.query
 * @param {(q: xsql, currentIds: any[]) => {}} options.override
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
 * @this xsql
 * @param {'currentKey:targetTable.targetKey'} mapper
 * @param {Object} options
 * @param {string} options.addonKey
 * @param {boolean} options.omitMapperKey
 * @param {string} options.splitter
 * @param {(jsonArray: []) => string[]} options.arrayMapper
 * @param {(row: ReadResult) => (row: ReadResult)} options.filter
 * @param {(row: ReadResult) => (row: ReadResult)} options.map
 * @param {(q: xsql) => {}} options.query
 * @param {(q: xsql, currentIds: any[]) => {}} options.override
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
 * @this xsql
 * @param {string} addonKey
 * @param {'currentKey:targetTable.targetKey'} mapper
 * @param {Object} options
 * @param {boolean} options.omitMapperKey
 * @param {(row: ReadResult) => (row: ReadResult)} options.filter
 * @param {(row: ReadResult) => (row: ReadResult)} options.map
 * @param {(q: xsql) => {}} options.query
 * @param {(q: xsql, currentIds: any[]) => {}} options.override
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
 * @this xsql
 * @param {ReadResult} currentRows
 * @param {xsql} xsql
 */
async function _relationFetch(currentRows, xsql) {
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
      if (!is.defined(currentRow[relation.currentKey])) continue
      if (relation.type === 'toOne') {
        relation.currentIds.push(currentRow[relation.currentKey])
      } else if (relation.type === 'toMany') {
        if (!is.defined(currentRow[relation.currentKey])) continue
        if (is.fn(relation.arrayMapper)) {
          const jsonArray = is.object(currentRow[relation.currentKey])
            ? currentRow[relation.currentKey]
            : parseJson(currentRow[relation.currentKey])
          relation.currentIds.push(...(relation.arrayMapper(jsonArray || []) || []))
        } else if (/^\$.*\[\]$/g.test(relation.splitter)) {
          const path = relation.splitter.replace('$', '').replace('[]', '')
          let currData = currentRow[relation.currentKey]
          if (is.string(currData)) currData = parseJson(currData)
          if (!is.defined(currData)) continue
          currData = getByString(currData, path)
          if (is.array(currData)) {
            relation.currentIds.push(...currData)
          }
        } else {
          relation.currentIds.push(
            ...`${currentRow[relation.currentKey]}`.split(relation.splitter)
          )
        }
      }
    }
    defers.push((async () => {
      /** @type {xsql} */
      const _sql = xsql(this.hostId)

      let targetResult = null
      console.log('🚀 ~ relation:', relation)
      if (relation.override) {
        if (relation.type === 'fromOne') {
          targetResult = await relation.override(_sql, currentRows.map(currentRow => currentRow[relation.currentKey]))
        } else {
          const targetIds = [...new Set(relation.currentIds)]
          if (!targetIds.length) return
          _sql.where(relation.targetKey, 'in', targetIds)
          targetResult = await relation.override(_sql, targetIds)
        }
      } else {
        if (relation.select) {
          _sql.select(relation.select)
        }
        if (is.fn(relation.query)) {
          relation.query(_sql)
        }
        if (is.fn(relation.filter) || is.async(relation.filter)) {
          _sql.filter(relation.filter)
        }
        if (is.fn(relation.map) || is.async(relation.map)) {
          _sql.map(relation.map)
        }
        if (relation.type === 'fromOne') {
          _sql.where(relation.targetKey, 'in', currentRows.map(currentRow => currentRow[relation.currentKey]))
        } else {
          const targetIds = [...new Set(relation.currentIds)]
          if (!targetIds.length) return
          _sql.where(relation.targetKey, 'in', targetIds)
        }
        targetResult = await _sql.read(relation.targetTable)
      }

      targetResult.forEach((targetRow) => {
        if (relation.type === 'fromOne') {
          const key = targetRow[relation.targetKey]
          if (relation.targetRows[key]) {
            relation.targetRows[key].push(targetRow)
          } else {
            relation.targetRows[key] = [targetRow]
          }
        } else if (relation.type === 'toMany') {
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
        const target = relation.targetRows[currentRow[relation.currentKey]]
        if (is.defined(target) && relation.omitMapperKey && relation.targetKey in target) {
          delete target[relation.targetKey]
        }
        if (is.string(relation.addonKey)) {
          currentRow[relation.addonKey] = target
        } else {
          currentRow[relation.currentKey] = target
        }
      } else if (relation.type === 'toMany') {
        const finalResults = []
        const targetIds = is.fn(relation.arrayMapper)
          ? (relation.arrayMapper(currentRow[relation.currentKey] || []) || [])
          : `${currentRow[relation.currentKey]}`.split(relation.splitter)

        for (const id of targetIds) {
          const target = relation.targetRows[id]
          if (is.defined(target)) {
            for (const tRow of target) {
              if (is.defined(tRow)) {
                if (relation.omitMapperKey && relation.targetKey in tRow) {
                  delete tRow[relation.targetKey]
                }
                finalResults.push(tRow)
              }
            }
          }
        }

        if (is.string(relation.addonKey)) {
          currentRow[relation.addonKey] = finalResults
        } else {
          currentRow[relation.currentKey] = finalResults
        }
      } else if (relation.type === 'fromOne') {
        const target = relation.targetRows[currentRow[relation.currentKey]]
        if (is.defined(target) && relation.omitMapperKey) {
          for (const i in target) {
            if (relation.targetKey in target[i]) {
              delete target[i][relation.targetKey]
            }
          }
        }
        currentRow[relation.addonKey] = target || []
      }
    }
  }
  if (xsql.isLog) {
    xsql.logger(`${chalk.underline(`${Date.now() - startAt}ms`)} xsql._relationFetch()`)
  }
  return errList
}

module.exports = {
  _relationFetch,
  toOne,
  toMany,
  fromOne,
}
