import { createServer } from 'node:http'
import { parse } from 'node:url'

import { router } from './router.js'
import { DEFAULT_HEADER } from './routes/utils.js'

const PORT = process.env.PORT || 3000

// it's important to keep the node process alive
// handle global uncaughtException
process.on('uncaughtException', (error, origin) => {
  console.warn(`\n${origin} detected!\n${error}`)
})

// handle global unhandledRejection
process.on('unhandledRejection', (error) => {
  console.warn(`\nunhandledRejection detected!\n${error}`)
})

process.on('SIGINT', gracefulShutdown('SIGINT'))
process.on('SIGTERM', gracefulShutdown('SIGTERM'))
process.on('exit', (code) => console.log(`exit SIGNAL received with code ${code}`))

function handler(request, response) {
  const { url, method } = request
  const { pathname } = parse(url, true)

  const matcher = `${pathname}:${method.toLowerCase()}`
  const route = router[matcher] || router.default

  return Promise.resolve(route(request, response))
                .catch(errorHandler(response))  
}

function errorHandler(response) {
  return error => {
    console.error('Something went wrong', error.stack)

    response.writeHead(500, DEFAULT_HEADER)
    response.write(JSON.stringify({
      error: 'Internal Error'
    }))

    return response.end()
  }
}

const server = createServer(handler)
                  .listen(PORT)
                  .setTimeout(30000)
                  .on('listening', () => console.log(`server running at port ${PORT}`))


function gracefulShutdown(event) {
  return code => {
    console.log('Graceful shutdown starting...')
    console.log(`${event} received with code ${code}`)
    
    // make sure no new clients will be connected to this process.
    server.close(() => {
      console.log('webserver has been closed!')
      // do something else before exit
      console.log('database connection has been closed!')
      
      console.log('Graceful shutdown completed!')
      
      process.exit(code)
    })
  }
}
