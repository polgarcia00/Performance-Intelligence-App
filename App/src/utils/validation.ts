import {
  MAX_PERCEIVED_EFFORT,
  MAX_REASONABLE_HEART_RATE,
  MIN_PERCEIVED_EFFORT,
  MIN_REASONABLE_HEART_RATE,
} from '@/constants/performance'
import type {
  BasketballWorkoutInput,
  RunningWorkoutInput,
  StrengthWorkoutInput,
} from './workoutFactories'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

function result(errors: string[]): ValidationResult {
  return {
    valid: errors.length === 0,
    errors,
  }
}

export function isPositiveNumber(value: number | undefined): boolean {
  return value !== undefined && Number.isFinite(value) && value > 0
}

export function isValidWorkoutDate(date: string): boolean {
  return Boolean(date && !Number.isNaN(Date.parse(`${date}T00:00:00`)))
}

export function isValidHeartRate(value: number | undefined): boolean {
  if (value === undefined) return true
  return value >= MIN_REASONABLE_HEART_RATE && value <= MAX_REASONABLE_HEART_RATE
}

export function isValidRpe(value: number | undefined): boolean {
  if (value === undefined) return true
  return value >= MIN_PERCEIVED_EFFORT && value <= MAX_PERCEIVED_EFFORT
}

export function isValidDuration(value: number | undefined): boolean {
  return isPositiveNumber(value)
}

export function isValidName(value: string): boolean {
  return value.trim().length > 0
}

function requirePositive(value: number | undefined, label: string, errors: string[]) {
  if (!isPositiveNumber(value)) {
    errors.push(`${label} must be greater than 0.`)
  }
}

function validateHeartRate(averageHeartRate: number | undefined, maxHeartRate: number | undefined, errors: string[]) {
  const heartRates = [
    { label: 'Average heart rate', value: averageHeartRate },
    { label: 'Max heart rate', value: maxHeartRate },
  ]

  heartRates.forEach(({ label, value }) => {
    if (value === undefined) return
    if (!isValidHeartRate(value)) {
      errors.push(`${label} must be between ${MIN_REASONABLE_HEART_RATE} and ${MAX_REASONABLE_HEART_RATE}.`)
    }
  })

  if (averageHeartRate !== undefined && maxHeartRate !== undefined && averageHeartRate > maxHeartRate) {
    errors.push('Average heart rate cannot be higher than max heart rate.')
  }
}

function validateEffort(value: number | undefined, label: string, errors: string[]) {
  if (value === undefined) return
  if (!isValidRpe(value)) {
    errors.push(`${label} must be between ${MIN_PERCEIVED_EFFORT} and ${MAX_PERCEIVED_EFFORT}.`)
  }
}

function validateDate(date: string, errors: string[]) {
  if (!isValidWorkoutDate(date)) {
    errors.push('Date is required.')
  }
}

export function validateRunningWorkout(input: RunningWorkoutInput): ValidationResult {
  const errors: string[] = []
  validateDate(input.date, errors)
  requirePositive(input.durationMinutes, 'Duration', errors)
  requirePositive(input.distanceKm, 'Distance', errors)
  validateHeartRate(input.averageHeartRate, input.maxHeartRate, errors)
  validateEffort(input.perceivedEffort, 'Effort', errors)
  return result(errors)
}

export function validateStrengthWorkout(input: StrengthWorkoutInput): ValidationResult {
  const errors: string[] = []
  validateDate(input.date, errors)
  requirePositive(input.durationMinutes, 'Duration', errors)
  requirePositive(input.sets, 'Sets', errors)
  requirePositive(input.reps, 'Reps', errors)
  requirePositive(input.weightKg, 'Weight', errors)

  if (!isValidName(input.exerciseName)) {
    errors.push('Exercise name is required.')
  }

  if (!isValidName(input.muscleGroup)) {
    errors.push('Muscle group is required.')
  }

  validateHeartRate(input.averageHeartRate, input.maxHeartRate, errors)
  validateEffort(input.perceivedEffort, 'Effort', errors)
  return result(errors)
}

export function validateBasketballWorkout(input: BasketballWorkoutInput): ValidationResult {
  const errors: string[] = []
  validateDate(input.date, errors)
  requirePositive(input.durationMinutes, 'Duration', errors)

  if (input.highIntensityMinutes < 0) {
    errors.push('High intensity minutes cannot be negative.')
  }

  if (input.highIntensityMinutes > input.durationMinutes) {
    errors.push('High intensity minutes cannot exceed duration.')
  }

  validateHeartRate(input.averageHeartRate, input.maxHeartRate, errors)
  validateEffort(input.perceivedEffort, 'Effort', errors)
  validateEffort(input.perceivedPerformance, 'Performance', errors)
  return result(errors)
}

export function throwIfInvalid(validation: ValidationResult): void {
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '))
  }
}
