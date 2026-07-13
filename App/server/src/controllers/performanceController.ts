import type { Request, Response } from 'express'
import { PerformanceService } from '../modules/performance/performanceService.js'

export class PerformanceController {
  constructor(private performanceService = new PerformanceService()) {}

  async running(_request: Request, response: Response): Promise<void> {
    response.status(200).json({ data: await this.performanceService.running() })
  }

  async strength(_request: Request, response: Response): Promise<void> {
    response.status(200).json({ data: await this.performanceService.strength() })
  }

  async basketball(_request: Request, response: Response): Promise<void> {
    response.status(200).json({ data: await this.performanceService.basketball() })
  }

  async records(_request: Request, response: Response): Promise<void> {
    response.status(200).json({ data: await this.performanceService.records() })
  }

  async trends(_request: Request, response: Response): Promise<void> {
    response.status(200).json({ data: await this.performanceService.trends() })
  }
}
