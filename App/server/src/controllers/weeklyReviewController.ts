import type { Request, Response } from 'express'
import { WeeklyReviewService } from '../modules/weekly-reviews/weeklyReviewService.js'

export class WeeklyReviewController {
  constructor(private weeklyReviewService = new WeeklyReviewService()) {}

  async current(_request: Request, response: Response): Promise<void> {
    response.status(200).json({ data: await this.weeklyReviewService.getCurrent() })
  }

  async getByWeek(request: Request, response: Response): Promise<void> {
    response.status(200).json({ data: await this.weeklyReviewService.getByWeek(String(request.params.weekStart)) })
  }

  async save(request: Request, response: Response): Promise<void> {
    response.status(201).json({ data: await this.weeklyReviewService.save(String(request.params.weekStart), request.body ?? {}) })
  }

  async update(request: Request, response: Response): Promise<void> {
    response.status(200).json({ data: await this.weeklyReviewService.update(String(request.params.id), request.body ?? {}) })
  }
}
