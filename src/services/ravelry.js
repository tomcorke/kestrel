import config from '../../config'
import request from 'request-promise-native'
import LruCache from 'lru-cache'

const username = config.ravelry && config.ravelry.username
const password = config.ravelry && config.ravelry.password
const storeId = config.ravelry && config.ravelry.storeId

const cache = LruCache()
async function cacheGet (url) {
  if (cache.has(url)) {
    return cache.get(url)
  }
  console.log(`Fetching ${url}`)
  const result = await request({
    url,
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
    },
    json: true
  })
  cache.set(url, result)
  return result
}

async function getPatternDetails (ids) {
  if (!Array.isArray(ids)) { ids = [ids] }
  const url = `https://api.ravelry.com/patterns.json?ids=${ids.join('+')}`
  return cacheGet(url)
}

async function getPhotoSizes (id) {
  const url = `https://api.ravelry.com/photos/${id}/sizes.json`
  return cacheGet(url)
}

export async function getPatterns () {
  const url = `https://api.ravelry.com/stores/${storeId}/products.json`

  const products = await cacheGet(url)

  await Promise.all(products.products.map(async pattern => {
    const patternId = pattern.sku.substr(3)
    const details = await getPatternDetails(patternId)
    pattern.details = details.patterns[patternId]
    const firstPhoto = pattern.details.photos.sort((a, b) => a.sort_order - b.sort_order)[0]
    pattern.firstPhoto = await getPhotoSizes(firstPhoto.id)
  }))

  return products
}
