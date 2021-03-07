const is = require('../lib/is')

describe('is', () => {
  it('bool', () => {
    expect(is.bool(false)).toBe(true)
    expect(is.bool(true)).toBe(true)
    expect(is.bool(0)).toBe(false)
    expect(is.bool('')).toBe(false)
    expect(is.bool({})).toBe(false)
  })
  it('string', () => {
    expect(is.string(false)).toBe(false)
    expect(is.string(true)).toBe(false)
    expect(is.string(0)).toBe(false)
    expect(is.string('')).toBe(true)
    expect(is.string({})).toBe(false)
  })
  it('object', () => {
    expect(is.object(false)).toBe(false)
    expect(is.object(true)).toBe(false)
    expect(is.object(0)).toBe(false)
    expect(is.object('')).toBe(false)
    expect(is.object([])).toBe(true)
    expect(is.object({})).toBe(true)
  })
})
