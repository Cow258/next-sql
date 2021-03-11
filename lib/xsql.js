const defaultOptions = {
  defaultHost: '',
  hosts: {
    hostKey: {
      host: 'example2.com',
      user: 'username',
      password: 'password',
      database: 'dbname',
    },
  },
}

class nSQL {
  /**
   * @param {defaultOptions} options
   */
  constructor(options) {
    const { hosts, ...opts } = { ...defaultOptions, ...options }
    this.options = opts
    this.hosts = Object.keys(hosts).reduce((prev, hostKey) => ({
      ...prev,
      [hostKey]: {
        ...opts,
        ...hosts[hostKey],
      },
    }))
    return this
  }

  clone() {

  }
}

module.exports = nSQL
