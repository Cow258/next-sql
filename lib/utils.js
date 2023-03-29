const is = require('./is')

function parse(jsonString) {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    return null
  }
}

module.exports = {
  /**
   * Convert object to JSON string
   * @param {Object} data
   * @param {string[]} jsonKeys
   */
  objectToJson(data, jsonKeys) {
    const jsonData = {}
    jsonKeys.forEach((jsonKey) => {
      jsonData[jsonKey] = (
        is.defined(data[jsonKey]) && (is.plainObject(data[jsonKey]) || is.array(data[jsonKey]))
          ? JSON.stringify(data[jsonKey])
          : null
      )
    })
    return { ...data, ...jsonData }
  },
  /**
   * Parse JSON string to js object
   * @param {Object} data
   * @param {string[]} [jsonKeys]
   */
  parseJson(data, jsonKeys) {
    if (!is.defined(jsonKeys)) return parse(data)
    const jsonData = {}
    jsonKeys.forEach((jsonKey) => {
      if (jsonKey in data) {
        jsonData[jsonKey] = (
          is.defined(data[jsonKey]) && (is.string(data[jsonKey]))
            ? parse(data[jsonKey])
            : null
        )
      }
    })
    return { ...data, ...jsonData }
  },
  getByString(obj, path = '') {
    let result = obj
    for (const key of path.split('.')) {
      if (!result) continue
      result = result[key]
    }
    return result
  },
}
