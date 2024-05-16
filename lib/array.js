/** @typedef {import('./pagination').PaginationResult} PaginationResult */

class Statement extends Array {
  constructor({ array, toRaw }) {
    super(...array)
    Object.defineProperty(this, '_toRaw', {
      value: toRaw,
      enumerable: false,
      writable: false,
    })
  }

  /** @returns {string} */
  toRaw() {
    return this._toRaw()
  }
}

/**
 * @template T
 */
class ReadResult extends Array {
  /**
   * @param {{ array: T[], eof: boolean, pagination: PaginationResult }} param0
   */
  constructor({ array, eof, pagination }) {
    super(...array)
    /** @type {boolean} */
    this.eof = eof
    /** @type {PaginationResult} */
    this.pagination = pagination
    Object.defineProperty(this, 'eof', { value: eof, enumerable: false, writable: false })
    Object.defineProperty(this, 'pagination', { value: pagination, enumerable: false, writable: false })
  }

  static get [Symbol.species]() {
    return Array
  }
}

/** @param {any[]} ary */
function getLastItem(ary) {
  return ary[ary.length - 1]
}

module.exports = {
  Statement,
  ReadResult,
  getLastItem,
}
