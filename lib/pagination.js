/** @typedef {import('./')} xSQL */

const is = require('./is')

/**
 * @this xSQL
 * @param {Object} options
 * @param {number} options.currPage Default: 1
 * @param {number} options.rowStep Default: 10
 * @param {number} options.navStep Default: 4
 */
function pagination(options) {
  if (is.plainObject(options)) {
    let { currPage, rowStep, navStep } = {
      currPage: 1,
      rowStep: 10,
      navStep: 4,
      ...options,
    }
    currPage = Number(currPage)
    rowStep = Number(rowStep)
    navStep = Number(navStep)
    let aLimit = 0 // Database start index
    let bLimit = 0 // Database end index
    let aPage = 0 // Page start index
    let bPage = 0 // Page end index

    if (currPage <= navStep) {
      aLimit = 0
      bLimit = rowStep * (navStep + 1)
      aPage = 1
      bPage = navStep
    } else {
      // p=13: 13/8=1.625 => floor=1
      // p=25: 25/8=3.125 => floor=3
      // floor=1: 1*8*10+10=90
      // floor=3: 3*8*10+10=250
      aLimit = (Math.floor((currPage - 1) / navStep) * navStep * rowStep)
      // 8*10+10*1=90
      bLimit = navStep * rowStep + rowStep * 1
      // p=13: 13/8=1.625 => floor=1
      // p=25: 25/8=3.125 => floor=3
      // floor=1: 1*8+1=9
      // floor=3: 3*8+1=25
      aPage = (Math.floor((currPage - 1) / navStep) * navStep) + 1
      // 9: 9+8-1=16
      // 25: 25+8-1=32
      bPage = aPage + navStep - 1
    }

    this._state.pagination = {
      currPage,
      rowStep,
      navStep,
      aLimit,
      bLimit,
      aPage,
      bPage,
    }
  } else {
    this._state.pagination = null
  }
  return this
}

module.exports = pagination
