import * as ravelry from '../services/ravelry'

export function patternsHandler (req, res) {
  ravelry
    .getPatterns()
    .then(patterns => res.json(patterns))
}
