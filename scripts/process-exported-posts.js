const posts = require('../posts.json')
const writeFile = require('write')
const path = require('path')

const postsById = {}
posts.forEach(post => {
  const id = post.ID
  postsById[id] = post
  if (post.post_type === 'revision') {
    const parentId = post.post_parent
    const parent = postsById[parentId]
    if (parent) {
      parent.revisions = parent.revisions || []
      parent.revisions.push(id)
    } else {
      console.warn(`Could not find post ID ${parentId} from revision ID ${id}`)
    }
  }
})


const postIds = Object.keys(postsById).map(id => +id).slice()
postIds.forEach(id => {
  const post = postsById[id]

  // Remove all but latest revision of posts
  if (post && post.revisions) {
    const lastRevisionId = Math.max(...post.revisions)
    const lastRevision = postsById[lastRevisionId]
    console.log(`Deleting ${post.revisions.length - 1} revisions from ID ${id}`)
    post.revisions.forEach(r => {
      if (r !== lastRevisionId) {
        console.log(`Deleting revision ID: ${r} from post ${id}`)
        delete postsById[r]
      }
    })
    console.log(`Deleting original ID: ${id} in favour of revision ID ${lastRevisionId}`)
    delete postsById[id]
    lastRevision.post_type = 'post'
    lastRevision.post_status = post.post_status
    lastRevision.post_name = post.post_name
  }

  // Remove all non-posts
  if (post && post.post_type !== 'post') {
    console.log(`Deleting non-post ID: ${id}`)
    delete postsById[id]
  }

  // Remove non-published posts
  if (post && post.post_status !== 'publish') {
    console.log(`Deleting unpublished ID: ${id}`)
    delete postsById[id]
  }

})

const remainingPostIds = Object.keys(postsById).map(id => +id).slice()

// Write to files!

remainingPostIds.forEach(id => {
  const post = {
    ...postsById[id],
    format: 'wordpress-exported'
  }
  const filePath = path.resolve(__dirname, `../posts/exported/${id}.json`)
  writeFile(filePath, JSON.stringify(post, null, 2))
})

// Write index file

const postIndex = remainingPostIds.reduce((index, id) => {
  const post = postsById[id]
  return {
    ...index,
    [id]: {
      id,
      title: post.post_title,
      name: post.post_name,
      date: post.post_date,
      path: `exported/${id}.json`
    }
  }
}, {})

writeFile(path.resolve(__dirname, '../posts/index.json'), JSON.stringify(postIndex, null, 2))