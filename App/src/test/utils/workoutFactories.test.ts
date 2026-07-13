import { describe, expect, it } from 'vitest'
import {
  createBasketballWorkout,
  createRunningWorkout,
  createStrengthWorkout,
} from '@/utils/workoutFactories'

describe('workoutFactories', () => {
  it('creates linked running workout and session records', () => {
    const { workout, session } = createRunningWorkout({
      date: '2026-07-07',
      durationMinutes: 30,
      distanceKm: 5,
    })

    expect(workout.type).toBe('running')
    expect(session.workoutId).toBe(workout.id)
    expect(session.paceSecondsPerKm).toBe(360)
  })

  it('creates strength sets linked to the generated workout', () => {
    const { workout, session } = createStrengthWorkout({
      date: '2026-07-07',
      durationMinutes: 45,
      exerciseName: 'Squat',
      muscleGroup: 'Legs',
      sets: 3,
      reps: 5,
      weightKg: 80,
    })

    expect(workout.type).toBe('strength')
    expect(session.exercises[0]?.workoutId).toBe(workout.id)
    expect(session.exercises[0]?.sets).toHaveLength(3)
  })

  it('creates basketball sessions linked to the generated workout', () => {
    const { workout, session } = createBasketballWorkout({
      date: '2026-07-07',
      durationMinutes: 70,
      sessionType: 'pickup',
      highIntensityMinutes: 20,
      perceivedPerformance: 8,
    })

    expect(workout.type).toBe('basketball')
    expect(session.workoutId).toBe(workout.id)
    expect(session.courtTimeMinutes).toBe(70)
  })
})
