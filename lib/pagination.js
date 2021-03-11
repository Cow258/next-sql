/** @typedef {import('./')} xSQL */
/** @typedef {import('./').State} State */
/** @typedef {import('./array').ReadResult} ReadResult */

/**
 * @typedef {Object} PaginationOptions
 * @property {number} currPage [Default: 1] The current page
 * @property {number} rowStep [Default: 10] How many rows pre each page
 * @property {number} navStep [Default: 4] How many pages will shown on the navigation bar
 * @property {number} aLimit Database start index
 * @property {number} bLimit Database end index
 * @property {number} aPage Page start index
 * @property {number} bPage Page end index
 */

/**
 * @typedef {Object} PaginationNavButton
 * @property {number} page
 * @property {boolean} enable
 * @property {string} className
 */

/**
 * @typedef {Object} PaginationResult
 * @property {boolean} isOutOfRange
 * @property {number} currPage
 * @property {number} rowStep
 * @property {number} navStep
 * @property {Object} row
 * @property {number} row.from
 * @property {number} row.to
 * @property {Object} page
 * @property {number} page.from
 * @property {number} page.current
 * @property {number} page.to
 * @property {boolean} page.hasPrev
 * @property {boolean} page.hasNext
 * @property {Object} nav
 * @property {boolean} nav.hasPrev
 * @property {boolean} nav.hasNext
 * @property {PaginationNavButton[]} nav.buttons
 */

const classNames = require('classnames')

const is = require('./is')

/**
 * @memberof xSQL
 * @this xSQL
 * @param {PaginationOptions} options
 * @returns {PaginationResult}
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

/** @this xSQL */
function paginationBefore() {
  const { aLimit, bLimit } = this._state.pagination
  this.offset(aLimit)
  this.limit(bLimit)
}

/**
 * @this xSQL
 * @param {ReadResult} rows 
 * @param {State} state 
 */
function paginationAfter(rows, state) {

  const {
    pagination: {
      currPage,
      rowStep,
      navStep,
      aPage,
    },
  } = state
  const totalPages = Math.ceil(rows.length / rowStep)
  const pageStartIndex = aPage
  const pageEndIndex = aPage + totalPages - 1
  const rowStartIndex = ((currPage - 1) * rowStep) - navStep * rowStep * Math.floor((currPage - 1) / navStep)
  let rowEndIndex = rowStartIndex + rowStep - 1
  if (rowEndIndex >= rows.length) {
    rowEndIndex = rows.length - 1
  }
  const paginationRows = []
  for (let i = rowStartIndex; i <= rowEndIndex; i++) { paginationRows.push(rows[i]) }
  const navCurrent = (Math.floor((currPage - 1) / navStep) + 1)
  const pageRealEnd = Math.min(...[navCurrent * navStep, pageEndIndex])
  const paginationResult = {
    isOutOfRange: !paginationRows.length,
    currPage,
    rowStep,
    navStep,
    row: {
      from: ((currPage - 1) * rowStep) + 1,
      to: currPage * rowStep,
      fromIndex: ((currPage - 1) * rowStep),
      toIndex: (currPage * rowStep) - 1,
    },
    page: {
      from: pageStartIndex,
      current: currPage,
      to: pageRealEnd,
      hasPrev: currPage > 1,
      hasNext: currPage < pageEndIndex,
    },
    nav: {
      current: navCurrent,
      hasPrev: navCurrent > 1,
      hasNext: pageEndIndex - pageStartIndex >= navStep,
    },
  }

  const buttons = []
  buttons.push({
    value: currPage - 1,
    label: '«',
    className: classNames({
      'page-prev': true,
      disabled: !paginationResult.page.hasPrev,
    }),
  })
  if (paginationResult.nav.hasPrev) {
    buttons.push({
      value: pageStartIndex - 1,
      label: '...',
      className: classNames({
        'nav-prev': true,
      }),
    })
  }
  for (let i = pageStartIndex; i <= pageRealEnd; i++) {
    buttons.push({
      value: i,
      label: `${i}`,
      className: classNames({
        current: currPage === i,
        active: currPage === i,
      }),
    })
  }
  if (paginationResult.nav.hasNext) {
    buttons.push({
      value: pageEndIndex,
      label: '...',
      className: classNames({
        'nav-next': true,
      }),
    })
  }
  buttons.push({
    value: currPage + 1,
    label: '»',
    className: classNames({
      'page-next': true,
      disabled: !paginationResult.page.hasNext,
    }),
  })

  paginationResult.nav.buttons = buttons
  return {
    paginationRows,
    paginationResult,
  }
}

module.exports = {
  pagination,
  paginationBefore,
  paginationAfter,
}
