import * as instagram from '../services/instagram'

export function instagramHandler (req, res) {
  instagram
    .getRecent()
    .then(recent => {
      res.send(recent
        .map(r => `<img src="${r.getThumbnail(320)}" />`)
        .join('\n'))
    })
}
