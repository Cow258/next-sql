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
    if (this.array(val) && val.length === 0) return true
    if (this.plainObject(val) && Object.keys.length === 0) return true
    if (this.buffer(val) && val.byteLength === 0) return true
    return false
  },
}
