import { getTemplate } from '../helpers/templates'

export async function homeHandler (req, res) {
  const template = await getTemplate('home')
  res.send(await template.render())
}
