import { redirect } from '../handlers/redirect'
import { verifyAuthToken } from '../helpers/authentication'
import querystring from 'querystring'

export function checkAuthentication (req, res, next) {
  res.locals.auth = verifyAuthToken(req.cookies.authToken)
  next()
}

export function requireAuthentication (req, res, next) {
  if (!res.locals.auth) {
    const loginUrl = `/admin/login?${querystring.stringify({
      r: req.url
    })}`
    console.log(`Not authenticated - redirecting to ${loginUrl}`)
    return redirect(loginUrl)(req, res)
  }

  next()
}
