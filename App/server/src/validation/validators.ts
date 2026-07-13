import { AppError } from '../middleware/errors.js'

export function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(422, 'validation_failed', 'Request validation failed.', {
      fieldErrors: { [field]: [`${field} is required.`] },
    })
  }
  return value.trim()
}

export function optionalRating(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10) {
    throw new AppError(422, 'validation_failed', 'Request validation failed.', {
      fieldErrors: { [field]: [`${field} must be between 1 and 10.`] },
    })
  }
  return parsed
}

export function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function readPage(value: unknown): number {
  const parsed = Number(value ?? 1)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1
}

export function readPageSize(value: unknown): number {
  const parsed = Number(value ?? 25)
  if (!Number.isFinite(parsed) || parsed <= 0) return 25
  return Math.min(Math.floor(parsed), 100)
}
