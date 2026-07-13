import type { BasketballSession, RunningSession, StrengthSession, Workout } from '@/types'
import { createId } from './id'

export interface RunningWorkoutInput {
  date: string
  durationMinutes: number
  distanceKm: number
  averageHeartRate?: number
  maxHeartRate?: number
  perceivedEffort?: number
  notes?: string
}

export interface StrengthWorkoutInput {
  date: string
  durationMinutes: number
  exerciseName: string
  muscleGroup: string
  sets: number
  reps: number
  weightKg: number
  averageHeartRate?: number
  maxHeartRate?: number
  perceivedEffort?: number
  notes?: string
}

export interface BasketballWorkoutInput {
  date: string
  durationMinutes: number
  sessionType: BasketballSession['sessionType']
  highIntensityMinutes: number
  averageHeartRate?: number
  maxHeartRate?: number
  perceivedEffort?: number
  perceivedPerformance?: number
  notes?: string
}

function createBaseWorkout(input: {
  date: string
  durationMinutes: number
  type: Workout['type']
  averageHeartRate?: number
  maxHeartRate?: number
  perceivedEffort?: number
  notes?: string
}): Workout {
  return {
    id: createId(input.type),
    type: input.type,
    date: input.date,
    durationMinutes: input.durationMinutes,
    source: 'manual',
    averageHeartRate: input.averageHeartRate,
    maxHeartRate: input.maxHeartRate,
    perceivedEffort: input.perceivedEffort,
    notes: input.notes,
  }
}

export function createRunningWorkout(input: RunningWorkoutInput): {
  workout: Workout
  session: RunningSession
} {
  const workout = createBaseWorkout({ ...input, type: 'running' })

  return {
    workout,
    session: {
      workoutId: workout.id,
      distanceKm: input.distanceKm,
      paceSecondsPerKm: input.distanceKm > 0 ? (input.durationMinutes * 60) / input.distanceKm : undefined,
      runType: 'other',
    },
  }
}

export function createStrengthWorkout(input: StrengthWorkoutInput): {
  workout: Workout
  session: StrengthSession
} {
  const workout = createBaseWorkout({ ...input, type: 'strength' })

  return {
    workout,
    session: {
      workoutId: workout.id,
      totalVolumeKg: 0,
      primaryMuscleGroups: [input.muscleGroup],
      sessionType: 'other',
      exercises: [
        {
          id: createId('exercise'),
          workoutId: workout.id,
          name: input.exerciseName.trim(),
          muscleGroup: input.muscleGroup,
          sets: Array.from({ length: input.sets }, (_, index) => ({
            id: createId('set'),
            setNumber: index + 1,
            reps: input.reps,
            weightKg: input.weightKg,
          })),
        },
      ],
    },
  }
}

export function createBasketballWorkout(input: BasketballWorkoutInput): {
  workout: Workout
  session: BasketballSession
} {
  const workout = createBaseWorkout({ ...input, type: 'basketball' })

  return {
    workout,
    session: {
      workoutId: workout.id,
      sessionType: input.sessionType,
      highIntensityMinutes: input.highIntensityMinutes,
      perceivedPerformance: input.perceivedPerformance,
      courtTimeMinutes: input.durationMinutes,
    },
  }
}
