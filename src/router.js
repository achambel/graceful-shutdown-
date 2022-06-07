import { ping } from "./routes/ping.js"
import { DEFAULT_HEADER } from "./routes/utils.js"

export const router = {
  // ...add other routes here
  ...ping,
  // handle not found route
  default: (request, response) => {
    response.writeHead(404, DEFAULT_HEADER)
    response.write('Ops, we did not find what you are looking for!!!')
    response.end()
  }
}
