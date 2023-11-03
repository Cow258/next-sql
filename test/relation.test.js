const xsql = require('../lib')
const utils = require('./utils')

require('../lib/clients/mysql2')

require('console.table')

describe('Relation', () => {
  const shops = utils.GenArray(0, 3).map((i) => ({
    id: utils.GetUuid(),
    index: i,
    name: `shop${utils.GetLetter(i)}`,
    createAt: Date.now(),
  }))
  const categories = utils.GenArray(0, 3).map((i) => ({
    id: utils.GetUuid(),
    name: `category${utils.GetLetter(i)}`,
  }))
  const products = utils.GenArray(0, 9).map((i) => ({
    id: utils.GetUuid(),
    index: i,
    name: `product${utils.GetLetter(i)}`,
    shop: shops[i % 3].id,
    category: categories[i % 3].id,
    tags: [i, i + 1, i + 2].join(','),
    createAt: Date.now(),
  }))
  const users = utils.GenArray(0, 9).map((i) => ({
    name: utils.GetUuid(),
    favorites: [products[i].id, products[i === 8 ? 0 : i + 1].id].join(','),
    createAt: Date.now(),
    data: { bookmarks: [products[i].id] },
  }))
  // console.table(shops)
  // console.table(categories)
  // console.table(products)
  // console.table(users)


  beforeAll(async () => {
    xsql.init(utils.sqlConfig)
    await xsql().transaction(async (t) => {
      await t().batchInsert('shops', shops)
      await t().batchInsert('categories', categories)
      await t().batchInsert('products', products)
      await t().batchInsert('users', users, { jsonKeys: ['data'] })
    })
  })

  afterAll(async () => {
    await xsql().transaction(async (t) => {
      await t().where('id', 'in', shops.map(s => s.id)).delete('shops')
      await t().where('id', 'in', categories.map(c => c.id)).delete('categories')
      await t().where('id', 'in', products.map(p => p.id)).delete('products')
      await t().where('name', 'in', users.map(u => u.name)).delete('users')
    })
    xsql.close()
  })

  it('toOne', async () => {
    let rows = await xsql()
      .where({ id: products[0].id })
      .toOne('shop:shops.id')
      .toOne('category:categories.id')
      .read('products')
    expect(rows.length).toBe(1)
    expect(rows[0].shop.id).toBe(shops[0].id)
    expect(rows[0].shop.name).toBe(shops[0].name)
    expect(rows[0].category.id).toBe(categories[0].id)
    expect(rows[0].category.name).toBe(categories[0].name)

    rows = await xsql()
      .where({ id: products[1].id })
      .toOne('shop:shops.id', {
        select: ['id', 'createAt'],
      })
      .toOne('category:categories.id', {
        query: q => q
          .select('id'),
        filter: row => {
          row.foo = 'bar'
          return row
        },
        map: row => {
          row.name = 'testing'
          return row
        },
      })
      .read('products')
    expect(rows.length).toBe(1)
    expect(rows[0].shop.id).toBe(shops[1].id)
    expect(Object.keys(rows[0].shop)).toEqual(['id', 'createAt'])
    expect(Object.keys(rows[0].category)).toEqual(['id', 'foo', 'name'])
    expect(rows[0].category.id).toBe(categories[1].id)
    expect(rows[0].category.foo).toBe('bar')
    expect(rows[0].category.name).toBe('testing')

    rows = await xsql()
      .where({ id: products[2].id })
      .toOne('shop:shops.id', {
        query: q => q
          .select(['id', 'name']),
        addonKey: 'data',
        omitMapperKey: true,
      })
      .read('products')
    expect(rows.length).toBe(1)
    expect(rows[0].shop).toBe(shops[2].id)
    expect(Object.keys(rows[0].data)).toEqual(['name'])
    expect(rows[0].data).toEqual({
      name: shops[2].name,
    })
  })

  it('toMany', async () => {
    const consoleSpy = jest.spyOn(console, 'log')

    let rows = await xsql()
      .log(true)
      .where({ id: products[1].id })
      .toMany('tags:items.id')
      .read('products')
    expect(rows.length).toBe(1)
    expect(rows[0].tags.length).toBe(3)
    expect(Object.keys(rows[0].tags[0])).toEqual(['id', 'tag'])
    expect(rows[0].tags.map(t => t.id)).toEqual([1, 2, 3])

    expect(consoleSpy).toHaveBeenCalledTimes(2)
    consoleSpy.mockRestore()

    rows = await xsql()
      .log(true)
      .where('id', 'in', [products[1].id, products[2].id])
      .orderBy('`index`')
      .toMany('tags:items.id', {
        omitMapperKey: true,
        addonKey: 'items',
      })
      .read('products')
    expect(rows.length).toBe(2)
    expect(rows[0].tags).toBe('1,2,3')
    expect(rows[0].items.length).toBe(3)
    expect(Object.keys(rows[0].items[0])).toEqual(['tag'])
    expect(rows[0].items.map(t => t.tag)).toEqual(['b', 'c', 'a'])
  })

  it('fromOne', async () => {
    let rows = await xsql()
      .where('id', 'in', shops.map(s => s.id))
      .orderBy('`index`')
      .fromOne('products', 'id:products.shop')
      .fromOne('omitProducts', 'id:products.shop', {
        select: ['id', 'name', 'shop'],
        omitMapperKey: true,
      })
      .read('shops')
    expect(rows.length).toBe(3)
    expect(rows[0].products.length).toBe(3)

    const targetProductIds = products
      .filter(p => p.shop === shops[0].id)
      .map(p => p.id)
    expect(rows[0].products.every(p => targetProductIds.includes(p.id))).toBe(true)

    expect(rows[0].omitProducts.length).toBe(3)
    expect(Object.keys(rows[0].omitProducts[0])).toEqual(['id', 'name'])

    rows = await xsql()
      .where('id', 'in', shops.map(s => s.id))
      .orderBy('`index`')
      .fromOne('products', 'id:products.shop', {
        override: async (sql, ids, cRows) => {
          expect(cRows.length).toBe(3)
          expect(Object.keys(cRows[0])).toEqual(['id', 'index', 'name', 'createAt'])
          const results = await sql
            .where('shop', 'in', ids)
            .select(['id', 'name', 'shop'])
            .map(row => {
              row.foo = 'bar'
              return row
            })
            .read('products')
          return results
        },
      })
      .read('shops')
    expect(rows.length).toBe(3)
    expect(rows[0].products.length).toBe(3)
    expect(Object.keys(rows[0].products[0])).toEqual(['id', 'name', 'shop', 'foo'])

  })

  it('Nested & Mixed', async () => {
    const rows = await xsql()
      .where('name', 'in', users.map(u => u.name))
      .toMany('favorites:products.id', {
        query: q => q
          .toOne('shop:shops.id', {
            query: qq => qq
              .select(['id', 'name']),
          })
          .toMany('tags:items.id')
          .toOne('category:categories.id', {
            addonKey: 'categoryDetail',
          })
          .fromOne('sameCategoryProducts', 'category:products.category', {
            query: qq => qq
              .select(['id', '`index`', 'name', 'shop', 'category'])
              .toOne('shop:shops.id', {
                select: ['id', 'name'],
              }),
          }),
      })
      .read('users')
    expect(rows.length).toBe(9)
    rows.forEach((row) => {
      expect(row.favorites.length).toBe(2)
      expect(row.favorites[0].shop.id).toBe(shops[row.favorites[0].index % 3].id)
      expect(row.favorites[0].shop.name).toBe(shops[row.favorites[0].index % 3].name)
      expect(Object.keys(row.favorites[0].categoryDetail)).toEqual(['id', 'name'])
      expect(row.favorites[0].categoryDetail.id).toBe(categories[row.favorites[0].index % 3].id)
      expect(row.favorites[0].tags.length).toBe(3)
      expect(row.favorites[0].tags.map(t => t.id)).toEqual([row.favorites[0].index, row.favorites[0].index + 1, row.favorites[0].index + 2])
      expect(row.favorites[0].sameCategoryProducts.length).toBe(3)
      expect(Object.keys(row.favorites[0].sameCategoryProducts[0])).toEqual(['id', 'index', 'name', 'shop', 'category'])
      expect(Object.keys(row.favorites[0].sameCategoryProducts[0].shop)).toEqual(['id', 'name'])
    })
  })
})
