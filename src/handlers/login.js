import URL from 'url-parse'

import { createAuthToken } from '../helpers/authentication'
import { getTemplate } from '../helpers/templates'

import config from '../../config.json'

function doRedirect (req, res) {
  const redirectPath = req.query.r || '/admin'
  const redirectUrl = new URL(redirectPath, true)
  console.log(`Redirecting to ${redirectUrl.href}`)
  res.redirect(redirectUrl.href)
}

function doLogin (req, res, username) {
  res.clearCookie('auth')
  res.cookie('authToken', createAuthToken(username), {
    maxAge: 60 * 60 * 24 * 1000,
    httpOnly: true
  })
  return doRedirect(req, res)
}

export async function loginHandler (req, res) {
  if (res.locals.auth) {
    return doRedirect(req, res)
  }

  const context = {
    loginUrl: req.url
  }

  const template = await getTemplate('login')
  res.send(await template.render(context))
}

export async function loginPostHandler (req, res) {
  console.log(req.body)
  const user = config.users.find(u => u.username === req.body.username && u.password === req.body.password)
  if (user) {
    return doLogin(req, res, user.username)
  }
  return loginHandler(req, res)
}
