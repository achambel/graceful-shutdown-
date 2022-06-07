import { once } from 'node:events'
import { DEFAULT_HEADER } from './utils.js'

export const ping = {
  '/ping:post': async (request, response) => {
    const data = JSON.parse(await once(request, 'data'))
    const pong = JSON.stringify(data)

    response.writeHead(200, DEFAULT_HEADER)
    response.write(pong)

    return response.end()
  }
}
