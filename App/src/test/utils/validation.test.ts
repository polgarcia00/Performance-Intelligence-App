import { describe, expect, it } from 'vitest'
import {
  isPositiveNumber,
  isValidDuration,
  isValidHeartRate,
  isValidName,
  isValidRpe,
  isValidWorkoutDate,
  validateBasketballWorkout,
  validateRunningWorkout,
} from '@/utils/validation'

describe('validation utilities', () => {
  it('exposes small reusable validation helpers', () => {
    expect(isPositiveNumber(1)).toBe(true)
    expect(isValidWorkoutDate('2026-07-07')).toBe(true)
    expect(isValidHeartRate(180)).toBe(true)
    expect(isValidRpe(8)).toBe(true)
    expect(isValidDuration(45)).toBe(true)
    expect(isValidName('Back squat')).toBe(true)
  })

  it('rejects impossible running heart-rate values', () => {
    const result = validateRunningWorkout({
      startedAt: '2026-07-07T10:00',
      durationMinutes: 30,
      distanceKm: 5,
      averageHeartRate: 190,
      maxHeartRate: 150,
    })

    expect(result.valid).toBe(false)
    expect(result.errors.join(' ')).toContain('Average heart rate cannot be higher')
  })

  it('rejects negative calories for a manual basketball workout', () => {
    const result = validateBasketballWorkout({
      startedAt: '2026-07-07T18:00',
      durationMinutes: 20,
      calories: -1,
    })

    expect(result.valid).toBe(false)
    expect(result.errors.join(' ')).toContain('Calories cannot be negative')
  })

  it('accepts a valid running workout fallback entry', () => {
    const result = validateRunningWorkout({
      startedAt: '2026-07-07T10:00',
      durationMinutes: 30,
      distanceKm: 5,
      averageHeartRate: 142,
    })

    expect(result.valid).toBe(true)
  })
})
