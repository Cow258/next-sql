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

class xSQL {
  /** @param {string} hostKey */
  constructor(hostKey) {
    this.host = xSQL.hosts[hostKey]
  }

  static defaultHost = ''

  /** @type {defaultOptions['hosts']} */
  static hosts = {}

  static init() {

  }
}

module.exports = xSQL
