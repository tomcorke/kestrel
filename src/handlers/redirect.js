export function redirect (newPath) {
  return function redirectHandler (req, res) {
    res.redirect(newPath)
  }
}
