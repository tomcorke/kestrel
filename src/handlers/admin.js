import { postCreateHandler, postEditPostHandler } from './admin/posts'

function pathMatches (path, ...testPath) {
  return testPath.every((test, i) => new RegExp(test).test(path[i]))
}

export function adminHandler (req, res) {
  const cmdPath = req.path.split('/').slice(2)

  if (pathMatches(cmdPath, 'post', 'create')) {
    return postCreateHandler(req, res)
  }

  res.send(`admin path: "${cmdPath}" - auth: ${JSON.stringify(res.locals.auth)}`)
}

export function adminPostHandler (req, res) {
  const cmdPath = req.path.split('/').slice(2)

  if (pathMatches(cmdPath, 'post', 'create') ||
      pathMatches(cmdPath, 'post', 'edit')) {
    return postEditPostHandler(req, res)
  }

  res.send(`admin POST path: "${cmdPath}" - auth: ${JSON.stringify(res.locals.auth)}`)
}
