import config from '../../config'
import request from 'request-promise-native'

const userId = config.instagram && config.instagram.userId

export class InstagramItem {
  constructor (node) {
    this.node = node
  }
  getThumbnail (size) {
    const matching = this.node.thumbnail_resources.find(thumb => thumb.config_width === size)
    if (matching) { return matching.src }
    return this.node.thumbnail_src
  }
}

export function getRecent () {
  const url = `https://www.instagram.com/${userId}/?__a=1`
  return request({
    url,
    json: true
  }).then(response => {
    return response.user.media.nodes.map(node => new InstagramItem(node))
  }).catch(err => {
    console.error(err)
    return []
  })
}
