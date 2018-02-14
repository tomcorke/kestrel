export function adminHandler (req, res) {
  const cmdPath = req.path.split('/').slice(2)
  res.send(`admin path: "${cmdPath}" - auth: ${JSON.stringify(res.locals.auth)}`)
}
