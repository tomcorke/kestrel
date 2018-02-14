import express from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

import { responseTime } from './middleware/response-time'
import { checkAuthentication, requireAuthentication } from './middleware/authentication'

import { patternIndexHandler, patternImagesHandler, patternHandler } from './handlers/patterns'
import { instagramHandler } from './handlers/instagram'
import { adminHandler } from './handlers/admin'
import { loginHandler, loginPostHandler } from './handlers/login'
import { postHandler, postIndexHandler } from './handlers/posts'
import { redirect } from './handlers/redirect'

const app = express()

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(responseTime)
app.use(checkAuthentication)

app.get('/patterns/images/:fileName', patternImagesHandler)
app.get('/patterns', patternIndexHandler)
app.get('/pattern/:id', requireAuthentication, patternHandler)

app.get('/instagram', instagramHandler)

app.get('/posts', postIndexHandler)
app.get('/post/create', redirect('/admin/post/create'))
app.get('/post/:postId', postHandler)

app.get('/admin/login', loginHandler)
app.post('/admin/login', loginPostHandler)

app.get('/admin', redirect('/admin/index'))
app.get('/admin/:path*', requireAuthentication, adminHandler)

app.get('/:postName', postHandler)

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.get('/operations/healthcheck', (req, res) => {
  res.send('ok')
})

const PORT = 3030

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`)
})

process.on('SIGINT', process.exit)

if (process.platform === 'win32') {
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.on('SIGINT', process.exit)
}
