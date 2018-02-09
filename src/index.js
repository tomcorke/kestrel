const express = require('express')
const { performance } = require('perf_hooks')

const app = express()

app.use((req, res, next) => {
  const start = performance.now()

  res.on('finish', () => {
    const time = performance.now() - start
    console.log(`${res.statusCode} ${Math.round(time)}ms ${req.url}`)
  })

  next()
})

app.get('/operations/healthcheck', (req, res) => {
  res.send('ok')
})

app.listen(3000, () => {
  console.log('Server listening...')
})

process.on('SIGINT', process.exit)

if (process.platform === 'win32') {
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.on('SIGINT', process.exit)
}
