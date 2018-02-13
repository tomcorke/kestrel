import jwt from 'jsonwebtoken'

const AUTH_SECRET = Buffer.from(`kestrel-auth-secret-${Date.now().toString(16)}`).toString('base64')

export function createAuthToken (username) {
  return jwt.sign({ user: username }, AUTH_SECRET, { expiresIn: '1d' })
}

export function verifyAuthToken (token) {
  try {
    return token && jwt.verify(token, AUTH_SECRET)
  } catch (e) {
    return false
  }
}
