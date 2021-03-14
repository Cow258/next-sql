module.exports = {
  /**
   * Convert object to JSON string
   * @param {Object} data
   * @param {string[]} jsonKeys
   */
  objectToJson(data, jsonKeys) {
    const jsonData = {}
    jsonKeys.forEach((jsonKey) => {
      jsonData[jsonKey] = JSON.stringify(data[jsonKey])
    })
    return { ...data, ...jsonData }
  },
}
