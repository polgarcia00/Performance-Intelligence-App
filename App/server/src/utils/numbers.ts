export function readNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(String(value).trim().replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

export function readInteger(value: unknown): number | undefined {
  const parsed = readNumber(value)
  return parsed === undefined ? undefined : Math.round(parsed)
}

export function secondsFromMinutes(minutes?: number): number | undefined {
  return minutes === undefined ? undefined : minutes * 60
}

export function secondsFromHours(hours?: number): number | undefined {
  return hours === undefined ? undefined : hours * 3600
}

export function calculatePaceSecondsPerKm(durationSeconds?: number, distanceMeters?: number, averageSpeedMps?: number): number | undefined {
  if (durationSeconds && distanceMeters && distanceMeters > 0) {
    return durationSeconds / (distanceMeters / 1000)
  }

  if (averageSpeedMps && averageSpeedMps > 0) {
    return 1000 / averageSpeedMps
  }

  return undefined
}

export function estimateOneRepMaxKg(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10
}

export function sum(values: Array<number | undefined>): number {
  return values.reduce<number>((total, value) => total + (value ?? 0), 0)
}

export function average(values: Array<number | undefined>): number | undefined {
  const valid = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  if (!valid.length) return undefined
  return sum(valid) / valid.length
}
