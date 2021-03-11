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

class ReadResult extends Array {
  constructor({ array, eof, pagination }) {
    super(...array)
    /** @type {boolean} */
    this.eof = eof
    /** @type {PaginationResult} */
    this.pagination = pagination
    Object.defineProperty(this, 'eof', { value: eof, enumerable: false, writable: false })
    Object.defineProperty(this, 'pagination', { value: pagination, enumerable: false, writable: false })
  }
}

module.exports = {
  Statement,
  ReadResult,
}
