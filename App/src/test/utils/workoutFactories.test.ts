import { describe, expect, it } from 'vitest'
import {
  createBasketballWorkout,
  createRunningWorkout,
  createStrengthWorkout,
} from '@/utils/workoutFactories'

describe('workoutFactories', () => {
  it('creates a manual running API payload in backend units', () => {
    const workout = createRunningWorkout({
      startedAt: '2026-07-07T10:00',
      durationMinutes: 30,
      distanceKm: 5,
      calories: 452,
    })

    expect(workout).toEqual({
      sport: 'running',
      startedAt: '2026-07-07T10:00',
      durationSeconds: 1800,
      distanceMeters: 5000,
      calories: 452,
      averageHeartRate: undefined,
      maxHeartRate: undefined,
    })
  })

  it('creates a manual strength API payload without Zepp-only fields', () => {
    const workout = createStrengthWorkout({
      startedAt: '2026-07-07T18:00',
      durationMinutes: 45,
      averageHeartRate: 112,
    })

    expect(workout).toMatchObject({
      sport: 'strength',
      durationSeconds: 2700,
      averageHeartRate: 112,
    })
    expect(workout).not.toHaveProperty('sourceRowFingerprint')
    expect(workout).not.toHaveProperty('importBatchId')
  })

  it('creates a manual basketball API payload', () => {
    const workout = createBasketballWorkout({
      startedAt: '2026-07-07T19:00',
      durationMinutes: 70,
      calories: 640,
      maxHeartRate: 184,
    })

    expect(workout).toMatchObject({
      sport: 'basketball',
      durationSeconds: 4200,
      calories: 640,
      maxHeartRate: 184,
    })
  })
})
