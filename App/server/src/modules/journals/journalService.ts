import { env } from '../../config/env.js'
import { transaction } from '../../database/pool.js'
import { AppError } from '../../middleware/errors.js'
import { JournalRepository } from '../../repositories/journalRepository.js'
import { WorkoutRepository } from '../../repositories/workoutRepository.js'
import type { BasketballJournalInput, RunningJournalInput, StrengthJournalInput } from '../../types/domain.js'
import { optionalRating, optionalString, requireString } from '../../validation/validators.js'

function requiredFiniteNumber(value: unknown, field: string): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new AppError(422, 'validation_failed', 'Journal payload is invalid.', {
      fieldErrors: { [field]: ['Enter a valid number.'] },
    })
  }
  return parsed
}

export class JournalService {
  constructor(
    private journalRepository = new JournalRepository(),
    private workoutRepository = new WorkoutRepository(),
  ) {}

  async saveRunningJournal(workoutId: string, body: Record<string, unknown>, userId = env.defaultUserId): Promise<{ ok: true }> {
    const input: RunningJournalInput = {
      trainingPurpose: optionalString(body.trainingPurpose),
      perceivedEffort: optionalRating(body.perceivedEffort, 'perceivedEffort'),
      perceivedPerformance: optionalRating(body.perceivedPerformance, 'perceivedPerformance'),
      routeType: optionalString(body.routeType),
      feltStrong: typeof body.feltStrong === 'boolean' ? body.feltStrong : undefined,
      notes: optionalString(body.notes),
    }

    await transaction(async (client) => {
      const workout = await this.workoutRepository.getWorkoutById(client, userId, workoutId)
      if (!workout) throw new AppError(404, 'workout_not_found', 'Workout was not found.')
      if (workout.sport !== 'running') throw new AppError(409, 'wrong_sport', 'Running journal can only be saved for running workouts.')
      await this.journalRepository.upsertRunningJournal(client, workoutId, input)
    })

    return { ok: true }
  }

  async saveBasketballJournal(workoutId: string, body: Record<string, unknown>, userId = env.defaultUserId): Promise<{ ok: true }> {
    const input: BasketballJournalInput = {
      sessionType: optionalString(body.sessionType),
      perceivedPerformance: optionalRating(body.perceivedPerformance, 'perceivedPerformance'),
      perceivedEffort: optionalRating(body.perceivedEffort, 'perceivedEffort'),
      energy: optionalRating(body.energy, 'energy'),
      explosiveness: optionalRating(body.explosiveness, 'explosiveness'),
      shooting: optionalRating(body.shooting, 'shooting'),
      defense: optionalRating(body.defense, 'defense'),
      role: optionalString(body.role),
      outcome: optionalString(body.outcome),
      notes: optionalString(body.notes),
    }

    await transaction(async (client) => {
      const workout = await this.workoutRepository.getWorkoutById(client, userId, workoutId)
      if (!workout) throw new AppError(404, 'workout_not_found', 'Workout was not found.')
      if (workout.sport !== 'basketball') throw new AppError(409, 'wrong_sport', 'Basketball journal can only be saved for basketball workouts.')
      await this.journalRepository.upsertBasketballJournal(client, workoutId, input)
    })

    return { ok: true }
  }

  async saveStrengthJournal(workoutId: string, body: Record<string, unknown>, userId = env.defaultUserId): Promise<{ ok: true }> {
    const exercises = Array.isArray(body.exercises) ? body.exercises : []
    const input: StrengthJournalInput = {
      sessionType: optionalString(body.sessionType),
      notes: optionalString(body.notes),
      exercises: exercises.map((exercise, exerciseIndex) => {
        const item = exercise as Record<string, unknown>
        const sets = Array.isArray(item.sets) ? item.sets : []
        return {
          name: requireString(item.name, `exercises.${exerciseIndex}.name`),
          muscleGroup: optionalString(item.muscleGroup),
          sets: sets.map((set, setIndex) => {
            const setItem = set as Record<string, unknown>
            return {
              setNumber: requiredFiniteNumber(setItem.setNumber ?? setIndex + 1, `exercises.${exerciseIndex}.sets.${setIndex}.setNumber`),
              reps: requiredFiniteNumber(setItem.reps, `exercises.${exerciseIndex}.sets.${setIndex}.reps`),
              weightKg: requiredFiniteNumber(setItem.weightKg, `exercises.${exerciseIndex}.sets.${setIndex}.weightKg`),
              rpe: optionalRating(setItem.rpe, `exercises.${exerciseIndex}.sets.${setIndex}.rpe`),
            }
          }),
        }
      }),
    }

    await transaction(async (client) => {
      const workout = await this.workoutRepository.getWorkoutById(client, userId, workoutId)
      if (!workout) throw new AppError(404, 'workout_not_found', 'Workout was not found.')
      if (workout.sport !== 'strength') throw new AppError(409, 'wrong_sport', 'Strength journal can only be saved for strength workouts.')
      await this.journalRepository.replaceStrengthJournal(client, workoutId, input)
    })

    return { ok: true }
  }
}
