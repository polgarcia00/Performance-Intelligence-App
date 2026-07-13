import type { Request, Response } from 'express'
import { JournalService } from '../modules/journals/journalService.js'

export class JournalController {
  constructor(private journalService = new JournalService()) {}

  async saveRunning(request: Request, response: Response): Promise<void> {
    const result = await this.journalService.saveRunningJournal(String(request.params.id), request.body ?? {})
    response.status(200).json({ data: result })
  }

  async saveStrength(request: Request, response: Response): Promise<void> {
    const result = await this.journalService.saveStrengthJournal(String(request.params.id), request.body ?? {})
    response.status(200).json({ data: result })
  }

  async saveBasketball(request: Request, response: Response): Promise<void> {
    const result = await this.journalService.saveBasketballJournal(String(request.params.id), request.body ?? {})
    response.status(200).json({ data: result })
  }
}
