import fs from 'fs'
import LruCache from 'lru-cache'
import path from 'path'
import handlebars from 'handlebars'

const templateCache = new LruCache()

export async function getTemplate (name) {
  if (templateCache.has(name)) {
    return templateCache.get(name)
  }
  return new Promise((resolve, reject) => {
    const templatePath = path.resolve(__dirname, `../../templates/${name}.html`)

    if (!fs.existsSync(templatePath)) {
      reject(Error(`Template ${templatePath} does not exist`))
    }

    fs.readFile(templatePath, 'utf8', (err, contents) => {
      if (err) { return reject(err) }
      const compiledTemplate = handlebars.compile(contents)
      templateCache.set(name, compiledTemplate)
      resolve(compiledTemplate)
    })
  })
}
