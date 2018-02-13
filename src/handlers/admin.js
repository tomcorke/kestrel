export function adminHandler (req, res) {
  const path = req.params.path
  console.log(`admin path: ${path}`)
  res.send(`admin path: ${path}, auth: ${JSON.stringify(res.locals.auth)}`)
}
