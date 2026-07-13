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
  return Boolean(date && !Number.isNaN(Date.parse(date)))
}

export function isValidHeartRate(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  return typeof value === 'number' && Number.isFinite(value) && value >= MIN_REASONABLE_HEART_RATE && value <= MAX_REASONABLE_HEART_RATE
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

function validateDate(date: string, errors: string[]) {
  if (!isValidWorkoutDate(date)) {
    errors.push('Start date and time are required.')
  }
}

function validateCalories(value: unknown, errors: string[]) {
  if (value !== undefined && value !== null && value !== '' && (typeof value !== 'number' || !Number.isFinite(value) || value < 0)) {
    errors.push('Calories cannot be negative.')
  }
}

function validateBaseWorkout(
  input: StrengthWorkoutInput | BasketballWorkoutInput,
  errors: string[],
) {
  validateDate(input.startedAt, errors)
  requirePositive(input.durationMinutes, 'Duration', errors)
  validateCalories(input.calories, errors)
  validateHeartRate(input.averageHeartRate, input.maxHeartRate, errors)
}

export function validateRunningWorkout(input: RunningWorkoutInput): ValidationResult {
  const errors: string[] = []
  validateBaseWorkout(input, errors)
  requirePositive(input.distanceKm, 'Distance', errors)
  return result(errors)
}

export function validateStrengthWorkout(input: StrengthWorkoutInput): ValidationResult {
  const errors: string[] = []
  validateBaseWorkout(input, errors)
  return result(errors)
}

export function validateBasketballWorkout(input: BasketballWorkoutInput): ValidationResult {
  const errors: string[] = []
  validateBaseWorkout(input, errors)
  return result(errors)
}

export function throwIfInvalid(validation: ValidationResult): void {
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '))
  }
}
