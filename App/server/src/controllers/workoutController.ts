import type { Request, Response } from 'express'
import { WorkoutService } from '../modules/workouts/workoutService.js'

export class WorkoutController {
  constructor(private workoutService = new WorkoutService()) {}

  async inbox(request: Request, response: Response): Promise<void> {
    const result = await this.workoutService.listWorkouts({ ...request.query, status: request.query.status ?? 'needs_enrichment' })
    response.status(200).json({ data: result })
  }

  async list(request: Request, response: Response): Promise<void> {
    const result = await this.workoutService.listWorkouts(request.query)
    response.status(200).json({ data: result })
  }

  async detail(request: Request, response: Response): Promise<void> {
    const result = await this.workoutService.getWorkoutDetail(String(request.params.id))
    response.status(200).json({ data: result })
  }
}
