import * as ravelry from '../services/ravelry'
import jimp from 'jimp'
import path from 'path'
import fs from 'fs'

export function patternsJsonHandler (req, res) {
  ravelry
    .getPatterns()
    .then(patterns => res.json(patterns))
}

async function createPatternImage (pattern, width, height) {
  const patternName = pattern.title.toLowerCase().replace(/\s/g, '-')
  const patternFileName = `${patternName}_${width}_${height}.jpg`

  const photo = pattern.firstPhoto

  const newPath = path.resolve(__dirname, `../../images/patterns/g/${patternFileName}`)
  const newUrl = `/images/patterns/g/${patternFileName}`

  const largePhoto = photo.sizes.find(size => size.key === 'large')
  const largePhotoUrl = largePhoto.url

  const returnValue = {
    original: largePhotoUrl,
    resized: newUrl
  }

  if (fs.existsSync(newPath)) {
    return returnValue
  }

  const offsetX = photo.photo.x_offset
  const offsetY = photo.photo.y_offset
  const [ originalWidth, originalHeight ] = largePhoto.dimensions

  const OFFSET_BASE = 170

  let cropX, cropY, cropW, cropH

  const scaledOffsetX = Math.abs((offsetX / OFFSET_BASE) * originalWidth) / 2
  const scaledOffsetY = Math.abs((offsetY / OFFSET_BASE) * originalHeight) / 2

  if (offsetX > 0) {
    cropX = 0
  } else {
    cropX = scaledOffsetX
  }

  if (offsetY > 0) {
    cropY = 0
  } else {
    cropY = scaledOffsetY
  }

  cropW = originalWidth - scaledOffsetX
  cropH = originalHeight - scaledOffsetY

  return jimp
    .read(largePhotoUrl)
    .then(original => {
      console.log(`Resizing ${largePhotoUrl} to ${newPath}`)
      console.log({ originalWidth, originalHeight, offsetX, offsetY, cropX, cropY, cropW, cropH })
      return new Promise((resolve, reject) => {
        original
          .crop(cropX, cropY, cropW, cropH)
          .cover(width, height)
          .quality(90)
          .write(newPath, (err) => {
            if (err) { return reject(err) }
            console.log(`${largePhotoUrl} resized`)
            resolve()
          })
      })
    })
    .then(() => {
      return returnValue
    })
}

export function patternIndexHandler (req, res) {
  if (req.query.json) { return patternsJsonHandler(req, res) }
  ravelry
    .getPatterns()
    .then(patterns => {
      const NEW_WIDTH = 320
      const NEW_HEIGHT = 350
      return Promise.all(patterns.products.map(pattern => createPatternImage(pattern, NEW_WIDTH, NEW_HEIGHT)))
    })
    .then(patternImgUrls => {
      res.send(patternImgUrls
        .map(url => `<a href="${url.original}" target="_blank"><img src="${url.resized}" /></a>`)
        .join('\n'))
    })
}

export function patternHandler (req, res) {
  const id = req.params.id
  ravelry
    .getPatterns()
    .then(patterns => {
      const pattern = patterns.products.find(pattern => {
        return pattern.id === +id ||
          pattern.title.toLowerCase().replace(/\s/g, '-') === `${id}`.toLowerCase()
      })
      if (!pattern) {
        return res.status(404).send('Pattern not found')
      }
      return res.json(pattern)
    })
}

export function patternImagesHandler (req, res) {
  const fileName = req.params.fileName

  if (!/^.+\.jpg$/.test(fileName)) {
    return res.status(404).send()
  }

  res.sendFile(fileName, {
    root: path.resolve(__dirname, '../../images'),
    dotfiles: 'deny'
  })
}
