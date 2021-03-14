module.exports = {
  defined: val => typeof val !== 'undefined' && val !== null,
  bool: val => typeof val === 'boolean',
  number: val => typeof val === 'number' && !Number.isNaN(val),
  nan: val => typeof val === 'number' && Number.isNaN(val),
  string: val => typeof val === 'string',
  fn: val => typeof val === 'function',
  async: val => typeof val === 'function' && !!val.constructor && val.constructor.name === 'AsyncFunction',
  buffer: val => val instanceof Buffer,
  array: val => Array.isArray(val),
  object: val => typeof val === 'object',
  plainObject: val => Object.prototype.toString.call(val) === '[object Object]',
  empty(val) {
    if (!val) return true
    if (this.array(val)) return val.length === 0
    if (this.plainObject(val)) return Object.keys.length === 0
    if (this.buffer(val)) return val.byteLength === 0
    return false
  },
  notEmpty(val) {
    return !this.empty(val)
  },
}
