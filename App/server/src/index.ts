import { env } from './config/env.js'
import { createApp } from './app.js'

const app = createApp()

app.listen(env.port, () => {
  console.log(`My Performance Journal backend listening on port ${env.port}`)
})
