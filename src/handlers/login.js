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

export async function loginHandler (req, res, { message }) {
  if (res.locals.auth) {
    return doRedirect(req, res)
  }

  const context = {
    message,
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

  // Delay login by random time to prevent spamming
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200))

  return loginHandler(req, res, { message: 'Incorrect login details' })
}

export function logoutHandler (req, res) {
  res.clearCookie('authToken')
  res.redirect('/')
}
