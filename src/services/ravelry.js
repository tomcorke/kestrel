import config from '../../config'
import request from 'request-promise-native'

const username = config.ravelry && config.ravelry.username
const password = config.ravelry && config.ravelry.password
const storeId = config.ravelry && config.ravelry.storeId

function getAuthorizationHeader () {
  return {
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
  }
}

function getPatternDetails (ids) {
  const url = `https://api.ravelry.com/patterns.json?ids=${ids.join('+')}`
  const headers = getAuthorizationHeader()
  return request({
    url,
    headers,
    json: true
  })
}

export function getPatterns () {
  const url = `https://api.ravelry.com/stores/${storeId}/products.json`
  const headers = getAuthorizationHeader()
  return request({
    url,
    headers,
    json: true
  }).then(products => {
    const ids = products.products.map(product => product.sku.substr(3))
    return getPatternDetails(ids)
      .then(details => {
        Object.keys(details.patterns).forEach(id => {
          const product = products.products.find(p => p.sku.substr(3) === id)
          product.details = details.patterns[id]
        })
        return products
      })
  })
}
