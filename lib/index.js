const defaultHost = {
  host: 'example2.com',
  user: 'username',
  password: 'password',
  database: 'dbname',
}
const defaultOptions = {
  defaultHost: '',
  /** @type {Object<string,defaultHost>} */
  hosts: {},
}


// const xSQL = {
//   defaultHost: '',
//   hosts: {},
//   /**
//    * @param {defaultOptions} options
//    */
//   init(options) {
//     const { defaultHost, hosts, ...opts } = { ...defaultOptions, ...options }
//     this.defaultHost = defaultHost
//     this.hosts = Object.keys(hosts).reduce((prev, hostKey) => ({
//       ...prev,
//       [hostKey]: {
//         ...opts,
//         ...hosts[hostKey],
//       },
//     }))
//   },
// }



/**
 * @constructs xSQL
 * @param {string} hostKey
 * @returns {xSQL}
 */
const xSQL = function (hostKey = xSQL.options.defaultHost) {
  if (!(this instanceof xSQL)) {
    return new xSQL(hostKey)
  }
  this.host = xSQL.hosts[hostKey]
  this.querys = []

  /** @param {whereCallback} key */
  this.where = function (key, op, val) {
    if (typeof key === 'function') {
      // (() => {
      //   args[0]()
      // })()
      // args[0]()
      // args[0].call(this)
      key(this)
      return this
    }
    return this
  }
  return this
}


// const options = {}
// const hosts = {}


xSQL.defaultHost = ''
xSQL.options = {}
xSQL.hosts = {}

/**
 * @param {defaultOptions} options
 */
xSQL.init = function (options) {
  const { hosts, ...opts } = { ...defaultOptions, ...options }
  // console.log({ hosts, ...options })
  this.options = opts
  this.hosts = Object.keys(hosts).reduce((prev, hostKey) => ({
    ...prev,
    [hostKey]: {
      ...opts,
      ...hosts[hostKey],
    },
  }), {})
  // console.log('hosts =>', this.hosts)
}
// Object.assign(xSQL.prototype, { init })
// xSQL.init = init

// class xSQL {
//   /** @param {string} hostKey */
//   constructor(hostKey) {
//     this.host = xSQL.hosts[hostKey]
//     return this
//   }

//   querys = []

//   where(...args) {
//     if (typeof args[0] === 'function') {
//       (() => {
//         args[0].call()
//       })()
//       return this
//     }
//   }

//   static defaultHost = ''

//   /** @type {defaultOptions['hosts']} */
//   static hosts = {}

//   static init() {

//   }
// }

/**
 * @callback whereCallback
 * @param {xSQL()} q
 */

module.exports = xSQL
