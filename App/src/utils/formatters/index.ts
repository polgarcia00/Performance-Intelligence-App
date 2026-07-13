import { round } from '../calculations'

export type DistanceUnit = 'm' | 'km'
export type DateFormat = 'short' | 'medium' | 'dateTime'
export type MetricFormat = 'number' | 'calories' | 'distance' | 'duration' | 'pace' | 'heartRate'

function isMissing(value: number | undefined | null): value is undefined | null {
  return value === undefined || value === null || Number.isNaN(value)
}

function formatCompactDecimal(value: number, decimals: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(round(value, decimals))
}

export function formatCalories(value?: number | null): string {
  if (isMissing(value)) return '-'
  return `${Math.round(value)} kcal`
}

export function formatDistance(value?: number | null, unit: DistanceUnit = 'km'): string {
  if (isMissing(value)) return '-'

  const meters = unit === 'km' ? value * 1000 : value
  if (Math.abs(meters) < 1000) {
    return `${Math.round(meters)} m`
  }

  return `${formatCompactDecimal(meters / 1000, 2)} km`
}

export function formatDuration(minutes?: number | null): string {
  if (isMissing(minutes)) return '-'

  const roundedMinutes = Math.round(minutes)
  if (roundedMinutes < 60) {
    return `${roundedMinutes} min`
  }

  const hours = Math.floor(roundedMinutes / 60)
  const remainingMinutes = roundedMinutes % 60
  return remainingMinutes ? `${hours} h ${remainingMinutes} min` : `${hours} h`
}

export function formatPace(secondsPerKm?: number | null): string {
  if (isMissing(secondsPerKm) || secondsPerKm <= 0) return '-'

  const roundedSeconds = Math.round(secondsPerKm)
  const minutes = Math.floor(roundedSeconds / 60)
  const seconds = roundedSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')} min/km`
}

export function formatHeartRate(value?: number | null): string {
  if (isMissing(value)) return '-'
  return `${Math.round(value)} bpm`
}

export function formatDate(value?: string | Date | null, format: DateFormat = 'medium'): string {
  if (!value) return '-'

  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return '-'

  if (format === 'short') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date)
  }

  if (format === 'dateTime') {
    const dateTime = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(dateTime.getTime())) return '-'

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(dateTime)
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

export function formatNumber(value?: number | null, unit = '', decimals = 0): string {
  if (isMissing(value)) return '-'
  return `${formatCompactDecimal(value, decimals)}${unit ? ` ${unit}` : ''}`
}

export function formatDelta(value: number, unit = '', decimals = 0): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${formatCompactDecimal(value, decimals)}${unit ? ` ${unit}` : ''}`
}

export function formatMetricDelta(
  value: number,
  format: MetricFormat = 'number',
  options: { unit?: string; decimals?: number; distanceUnit?: DistanceUnit } = {},
): string {
  if (format === 'number') return formatDelta(value, options.unit ?? '', options.decimals ?? 0)

  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  const formattedValue = formatMetricValue(Math.abs(value), format, options)
  return formattedValue === '-' ? '-' : `${sign}${formattedValue}`
}

export function formatMetricValue(
  value?: number | null,
  format: MetricFormat = 'number',
  options: { unit?: string; decimals?: number; distanceUnit?: DistanceUnit } = {},
): string {
  if (format === 'calories') return formatCalories(value)
  if (format === 'distance') return formatDistance(value, options.distanceUnit ?? 'km')
  if (format === 'duration') return formatDuration(value)
  if (format === 'pace') return formatPace(value)
  if (format === 'heartRate') return formatHeartRate(value)
  return formatNumber(value, options.unit ?? '', options.decimals ?? 0)
}
