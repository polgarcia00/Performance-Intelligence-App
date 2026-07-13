import type { Request, Response } from 'express'
import { DashboardService } from '../modules/dashboard/dashboardService.js'

export class DashboardController {
  constructor(private dashboardService = new DashboardService()) {}

  async summary(_request: Request, response: Response): Promise<void> {
    const result = await this.dashboardService.summary()
    response.status(200).json({ data: result })
  }
}
