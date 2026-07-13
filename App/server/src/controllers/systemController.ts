import type { Request, Response } from 'express'
import { checkDatabase } from '../database/pool.js'

export class SystemController {
  async health(_request: Request, response: Response): Promise<void> {
    const database = await checkDatabase()
    response.status(database.ok ? 200 : 500).json({
      status: database.ok ? 'ok' : 'error',
      database,
    })
  }
}
