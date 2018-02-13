import { performance } from 'perf_hooks'

export function responseTime (req, res, next) {
  const start = performance.now()

  res.on('finish', () => {
    const time = performance.now() - start
    console.log(`${res.statusCode} ${Math.round(time)}ms ${req.url}`)
  })

  next()
}
