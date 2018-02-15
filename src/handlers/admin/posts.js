import { getTemplate } from '../../helpers/templates'

export async function postEditHandler (req, res, post) {
  const context = {
    post,
    formUrl: req.path
  }
  const template = await getTemplate('admin/postEditor')
  res.send(await template.render(context))
}

export async function postEditPostHandler (req, res) {
  const submittedPost = req.body.post
  console.log(submittedPost)
  console.log(req.body)
  return postEditHandler(req, res, submittedPost)
}

export async function postCreateHandler (req, res) {
  return postEditHandler(req, res, {})
}
