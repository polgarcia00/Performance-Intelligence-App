import type { ManualWorkoutInput, WorkoutType } from '@/types'

interface BaseWorkoutInput {
  startedAt: string
  durationMinutes: number
  calories?: number
  averageHeartRate?: number
  maxHeartRate?: number
}

export interface RunningWorkoutInput extends BaseWorkoutInput {
  distanceKm: number
}

export type StrengthWorkoutInput = BaseWorkoutInput
export type BasketballWorkoutInput = BaseWorkoutInput

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function createManualWorkout(
  sport: WorkoutType,
  input: BaseWorkoutInput,
  distanceMeters?: number,
): ManualWorkoutInput {
  return {
    sport,
    startedAt: input.startedAt,
    durationSeconds: input.durationMinutes * 60,
    distanceMeters,
    calories: optionalNumber(input.calories),
    averageHeartRate: optionalNumber(input.averageHeartRate),
    maxHeartRate: optionalNumber(input.maxHeartRate),
  }
}

export function createRunningWorkout(input: RunningWorkoutInput): ManualWorkoutInput {
  return createManualWorkout('running', input, input.distanceKm * 1000)
}

export function createStrengthWorkout(input: StrengthWorkoutInput): ManualWorkoutInput {
  return createManualWorkout('strength', input)
}

export function createBasketballWorkout(input: BasketballWorkoutInput): ManualWorkoutInput {
  return createManualWorkout('basketball', input)
}
