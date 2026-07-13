import { AppError } from '../middleware/errors.js'
import type { ManualWorkoutInput, Sport } from '../types/domain.js'
import { readNumber } from '../utils/numbers.js'

const SUPPORTED_SPORTS: Array<Exclude<Sport, 'unknown'>> = ['running', 'strength', 'basketball']
const MIN_HEART_RATE = 35
const MAX_HEART_RATE = 220

function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function parseManualWorkoutInput(body: unknown): ManualWorkoutInput {
  const input = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  const fieldErrors: Record<string, string[]> = {}
  const addError = (field: string, message: string) => {
    fieldErrors[field] = [...(fieldErrors[field] ?? []), message]
  }

  const sport = typeof input.sport === 'string' && SUPPORTED_SPORTS.includes(input.sport as Exclude<Sport, 'unknown'>)
    ? input.sport as Exclude<Sport, 'unknown'>
    : undefined
  if (!sport) addError('sport', 'sport must be running, strength, or basketball.')

  const startedAt = typeof input.startedAt === 'string' ? input.startedAt.trim() : ''
  if (!startedAt || !isCalendarDate(startedAt) || Number.isNaN(Date.parse(startedAt))) {
    addError('startedAt', 'startedAt must be a valid date and time.')
  }

  const durationSeconds = readNumber(input.durationSeconds)
  if (durationSeconds === undefined || durationSeconds <= 0) {
    addError('durationSeconds', 'durationSeconds must be greater than 0.')
  }

  const distanceMeters = readNumber(input.distanceMeters)
  if (input.distanceMeters !== undefined && (distanceMeters === undefined || distanceMeters <= 0)) {
    addError('distanceMeters', 'distanceMeters must be greater than 0 when provided.')
  }
  if (sport === 'running' && distanceMeters === undefined) {
    addError('distanceMeters', 'distanceMeters is required for running workouts.')
  }
  if (sport && sport !== 'running' && distanceMeters !== undefined) {
    addError('distanceMeters', 'distanceMeters is only supported for running workouts.')
  }

  const calories = readNumber(input.calories)
  if (input.calories !== undefined && (calories === undefined || calories < 0)) {
    addError('calories', 'calories must be 0 or greater when provided.')
  }

  const averageHeartRate = readNumber(input.averageHeartRate)
  const maxHeartRate = readNumber(input.maxHeartRate)
  for (const [field, value, original] of [
    ['averageHeartRate', averageHeartRate, input.averageHeartRate],
    ['maxHeartRate', maxHeartRate, input.maxHeartRate],
  ] as const) {
    if (original !== undefined && (value === undefined || value < MIN_HEART_RATE || value > MAX_HEART_RATE)) {
      addError(field, `${field} must be between ${MIN_HEART_RATE} and ${MAX_HEART_RATE} when provided.`)
    }
  }
  if (averageHeartRate !== undefined && maxHeartRate !== undefined && averageHeartRate > maxHeartRate) {
    addError('averageHeartRate', 'averageHeartRate cannot be higher than maxHeartRate.')
  }

  if (Object.keys(fieldErrors).length) {
    throw new AppError(422, 'validation_failed', 'Manual workout validation failed.', { fieldErrors })
  }

  return {
    sport: sport!,
    startedAt,
    date: startedAt.slice(0, 10),
    durationSeconds: durationSeconds!,
    distanceMeters,
    calories,
    averageHeartRate,
    maxHeartRate,
  }
}
