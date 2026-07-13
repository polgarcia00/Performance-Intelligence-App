import express from 'express'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errors.js'
import { createRouter } from './routes/index.js'

export function createApp() {
  const app = express()

  app.use((request: any, response: any, next: any) => {
    response.setHeader('Access-Control-Allow-Origin', env.frontendOrigin)
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    if (request.method === 'OPTIONS') {
      response.status(204).end()
      return
    }
    next()
  })

  app.use(express.json({ limit: env.uploadSizeLimit }))
  app.use('/api', createRouter())
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
