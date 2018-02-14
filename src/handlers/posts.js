import fs from 'fs'
import LruCache from 'lru-cache'
import path from 'path'

import postIndex from '../../posts/index.json'

const postIndexArray = Object.keys(postIndex)
  .map(id => postIndex[id])

const postCache = new LruCache()
const postLoaders = {}

function loadPostById (id) {
  const loader = postLoaders[id] || new Promise((resolve, reject) => {
    const postPath = path.resolve(__dirname, `../../posts/${id}.json`)
    fs.readFile(postPath, 'utf8', (err, contents) => {
      if (err) { reject(err) }
      resolve(JSON.parse(contents))
    })
  })
  postLoaders[id] = loader
  return loader
}

function renderPost (req, res, post) {
  res.send(`<html><head><title>${post.post_title}</title></head><body><div class="post">${post.post_content}</div></body></html>`)
}

export async function postHandler (req, res) {
  const id = req.params.id

  if (postCache.has(id)) {
    return renderPost(req, res, postCache.get(id))
  }

  let loader
  if (postIndex[id]) {
    loader = loadPostById(id)
  } else {
    const postByName = postIndexArray.find(post => post.name.toLowerCase() === id.toLowerCase())
    if (postByName) {
      const postId = postByName.id
      loader = loadPostById(postId)
    }
  }

  if (!loader) {
    return res.status(404).send('post not found')
  }
  const post = await loader
  renderPost(req, res, post)
}

export function postIndexHandler (req, res) {
  res.send(`<html><body>
  ${postIndexArray
    .map(post => `<a href="/post/${post.name}">${post.title}</a><br />`).join('\n')}
  </body></html>`)
}
