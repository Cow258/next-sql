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

module.exports = {
  Statement,
}
