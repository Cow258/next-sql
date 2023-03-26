const fs = require('fs')

const glob = require('glob')

const xGlob = (pattern, options = {}) => {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err)
      } else {
        resolve(files)
      }
    })
  })
}

module.exports = async (mode) => {
  if (mode === 'clean') {
    const files = await xGlob('**/*.d.ts', {
      ignore: ['**/node_modules/**'],
    })
    Promise.all(files.map(filePath => fs.promises.unlink(filePath)))
    console.log(`🚀 ~ Cleaning ${files.length} files...\n`)
  }

}
