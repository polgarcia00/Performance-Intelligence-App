import { env } from '../../config/env.js'
import { transaction } from '../../database/pool.js'
import { AppError } from '../../middleware/errors.js'
import { WorkoutRepository, type WorkoutFilters } from '../../repositories/workoutRepository.js'
import { readPage, readPageSize } from '../../validation/validators.js'
import { basketballJournalStatus, runningJournalStatus, strengthJournalStatus } from '../../utils/workoutJournalStatus.js'

export class WorkoutService {
  constructor(private workoutRepository = new WorkoutRepository()) {}

  async listWorkouts(query: Record<string, unknown>, userId = env.defaultUserId): Promise<any[]> {
    const filters: WorkoutFilters = {
      sport: typeof query.sport === 'string' ? query.sport : undefined,
      status: typeof query.status === 'string' ? query.status : undefined,
      from: typeof query.from === 'string' ? query.from : undefined,
      to: typeof query.to === 'string' ? query.to : undefined,
      page: readPage(query.page),
      pageSize: readPageSize(query.pageSize),
      sort: typeof query.sort === 'string' ? query.sort : undefined,
    }

    const rows = await transaction((client) => this.workoutRepository.listWorkouts(client, userId, filters))
    const withStatus = rows.map((row) => ({ ...row, journalStatus: this.statusForRow(row) }))
    return withStatus
  }

  async getWorkoutDetail(workoutId: string, userId = env.defaultUserId): Promise<any> {
    const detail = await transaction((client) => this.workoutRepository.getWorkoutDetail(client, userId, workoutId))
    if (!detail) throw new AppError(404, 'workout_not_found', 'Workout was not found.')
    return {
      ...detail,
      journalStatus: this.statusForDetail(detail),
    }
  }

  private statusForRow(row: any) {
    if (row.sport === 'running') {
      return runningJournalStatus({
        trainingPurpose: row.training_purpose,
        perceivedEffort: row.running_effort,
        perceivedPerformance: row.running_performance,
      })
    }
    if (row.sport === 'strength') {
      const exerciseCount = Number(row.strength_exercise_count ?? 0)
      const exerciseWithSetCount = Number(row.strength_exercise_with_set_count ?? 0)
      const setCount = Number(row.strength_set_count ?? 0)
      const validSetCount = Number(row.strength_valid_set_count ?? 0)
      const hasCompleteSavedSets = exerciseCount > 0 && exerciseWithSetCount === exerciseCount && setCount > 0 && setCount === validSetCount

      return strengthJournalStatus({
        sessionType: row.strength_session_type,
        exercises: exerciseCount
          ? [
              {
                name: 'saved strength journal',
                sets: hasCompleteSavedSets ? [{ setNumber: 1, reps: 1, weightKg: 0 }] : [],
              },
            ]
          : [],
      })
    }
    if (row.sport === 'basketball') {
      return basketballJournalStatus({
        sessionType: row.basketball_session_type,
        perceivedPerformance: row.basketball_performance,
      })
    }
    return { status: 'needs_enrichment', missingFields: ['sport review'] }
  }

  private statusForDetail(detail: any) {
    const sport = detail.workout.sport
    if (sport === 'running') {
      const journal = detail.journal.running
      return runningJournalStatus({
        trainingPurpose: journal?.training_purpose,
        perceivedEffort: journal?.perceived_effort,
        perceivedPerformance: journal?.perceived_performance,
        routeType: journal?.route_type,
        notes: journal?.notes,
      })
    }
    if (sport === 'strength') {
      const journal = detail.journal.strength
      return strengthJournalStatus({
        sessionType: journal?.session_type,
        notes: journal?.notes,
        exercises: (journal?.exercises ?? []).map((exercise: any) => ({
          name: exercise.name,
          muscleGroup: exercise.muscle_group,
          sets: (exercise.sets ?? []).map((set: any) => ({
            setNumber: Number(set.set_number ?? set.setNumber ?? 0),
            reps: Number(set.reps ?? 0),
            weightKg: Number(set.weight_kg ?? set.weightKg ?? 0),
            rpe: set.rpe === undefined || set.rpe === null ? undefined : Number(set.rpe),
          })),
        })),
      })
    }
    if (sport === 'basketball') {
      const journal = detail.journal.basketball
      return basketballJournalStatus({
        sessionType: journal?.session_type,
        perceivedPerformance: journal?.perceived_performance,
        perceivedEffort: journal?.perceived_effort,
        energy: journal?.energy,
        shooting: journal?.shooting,
        defense: journal?.defense,
        role: journal?.role,
        notes: journal?.notes,
      })
    }
    return { status: 'needs_enrichment', missingFields: ['sport review'] }
  }
}
