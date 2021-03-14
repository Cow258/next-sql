const is = require("./is")

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
}
