import fs from 'fs'
import LruCache from 'lru-cache'
import path from 'path'
import { getTemplate } from '../helpers/templates'
import postIndex from '../../posts/index.json'

const postIndexArray = Object.keys(postIndex)
  .map(id => postIndex[id])

const postCache = new LruCache()
const postLoaders = {}

function loadPost (post) {
  const loader = postLoaders[post.id] || new Promise((resolve, reject) => {
    const postPath = path.resolve(__dirname, '../../posts/', post.path || `${post.id}.json`)
    fs.readFile(postPath, 'utf8', (err, contents) => {
      if (err) { reject(err) }
      resolve(JSON.parse(contents))
    })
  })
  postLoaders[post.id] = loader
  return loader
}

async function renderPost (req, res, post) {
  const context = {
    title: post.post_title,
    body: post.post_content
  }
  const template = await getTemplate('post')
  res.send(await template.render(context))
}

function getPostMeta (postIndexData) {
  if (!postIndexData) { return }
  return {
    ...postIndexData,
    canonicalPath: `/post/${postIndexData.name}`,
    permaPath: `/post/${postIndexData.id}`
  }
}

function getPostById (id) {
  return getPostMeta(postIndex[id])
}

function getPostByName (name) {
  return getPostMeta(postIndexArray.find(post => post.name.toLowerCase() === name.toLowerCase()))
}

export async function postHandler (req, res) {
  const id = req.params.postId
  const name = req.params.postName || id

  if (postCache.has(id)) {
    return renderPost(req, res, postCache.get(id))
  }

  let loader
  const post = getPostById(id)
  if (post) {
    return res.redirect(post.canonicalPath)
  } else {
    const postByName = getPostByName(name)
    if (postByName) {
      if (req.path !== postByName.canonicalPath) {
        return res.redirect(postByName.canonicalPath)
      }
      loader = loadPost(postByName)
    }
  }

  if (!loader) {
    return res.status(404).send('post not found')
  }
  const postData = await loader
  return renderPost(req, res, postData)
}

export function postIndexHandler (req, res) {
  res.send(`<html><body>
  ${postIndexArray
    .map(post => `<a href="/post/${post.name}">${post.title}</a><br />`).join('\n')}
  </body></html>`)
}
