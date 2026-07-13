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
      date: '2026-07-07',
      durationMinutes: 30,
      distanceKm: 5,
      averageHeartRate: 190,
      maxHeartRate: 150,
    })

    expect(result.valid).toBe(false)
    expect(result.errors.join(' ')).toContain('Average heart rate cannot be higher')
  })

  it('rejects basketball intensity above session duration', () => {
    const result = validateBasketballWorkout({
      date: '2026-07-07',
      durationMinutes: 20,
      sessionType: 'pickup',
      highIntensityMinutes: 25,
    })

    expect(result.valid).toBe(false)
    expect(result.errors.join(' ')).toContain('cannot exceed duration')
  })

  it('accepts a valid running workout fallback entry', () => {
    const result = validateRunningWorkout({
      date: '2026-07-07',
      durationMinutes: 30,
      distanceKm: 5,
      averageHeartRate: 142,
    })

    expect(result.valid).toBe(true)
  })
})
