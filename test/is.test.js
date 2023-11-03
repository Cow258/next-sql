const is = require('../lib/is')

describe('is', () => {
  it('should correctly identify types', () => {
    expect(is.defined(null)).toBe(false)
    expect(is.defined(undefined)).toBe(false)
    expect(is.defined(0)).toBe(true)

    expect(is.bool(false)).toBe(true)
    expect(is.bool('false')).toBe(false)

    expect(is.number(1)).toBe(true)
    expect(is.number('1')).toBe(false)
    expect(is.number(NaN)).toBe(false)

    expect(is.nan(NaN)).toBe(true)
    expect(is.nan(1)).toBe(false)

    expect(is.string('')).toBe(true)
    expect(is.string(1)).toBe(false)

    expect(is.fn(() => { })).toBe(true)
    expect(is.fn({})).toBe(false)

    expect(is.async(async () => { })).toBe(true)
    expect(is.async(() => { })).toBe(false)

    expect(is.promise(new Promise(() => { }))).toBe(true)
    expect(is.promise(() => { })).toBe(false)

    expect(is.buffer(Buffer.from(''))).toBe(true)
    expect(is.buffer('')).toBe(false)

    expect(is.array([])).toBe(true)
    expect(is.array({})).toBe(false)

    expect(is.object({})).toBe(true)
    expect(is.object([])).toBe(true)
    expect(is.object('')).toBe(false)

    expect(is.plainObject({})).toBe(true)
    expect(is.plainObject([])).toBe(false)

    expect(is.empty('')).toBe(true)
    expect(is.empty([])).toBe(true)
    expect(is.empty({})).toBe(true)
    expect(is.empty({ a: 1 })).toBe(false)
    expect(is.empty(Buffer.from(''))).toBe(true)
    expect(is.empty('not empty')).toBe(false)

    expect(is.notEmpty('')).toBe(false)
    expect(is.notEmpty([])).toBe(false)
    expect(is.notEmpty({})).toBe(false)
    expect(is.notEmpty({ a: 1 })).toBe(true)
    expect(is.notEmpty(Buffer.from(''))).toBe(false)
    expect(is.notEmpty('not empty')).toBe(true)
  })
})
