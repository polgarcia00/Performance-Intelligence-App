import { SCORE_MAX, SCORE_MIN } from '@/constants/performance'

export function clamp(value: number, min = SCORE_MIN, max = SCORE_MAX): number {
  return Math.min(Math.max(value, min), max)
}

export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

export function average(values: number[]): number {
  const validValues = values.filter(Number.isFinite)
  return validValues.length ? sum(validValues) / validValues.length : 0
}

export function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator
}

export function percentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100
  }

  return ((current - previous) / previous) * 100
}

export function normalizeToScore(value: number, baseline: number, higherIsBetter = true): number {
  if (baseline <= 0) {
    return clamp(value)
  }

  const ratio = value / baseline
  const adjustedRatio = higherIsBetter ? ratio : 2 - ratio
  return clamp(50 + (adjustedRatio - 1) * 50)
}

export function weightedScore(scores: Record<string, number>, weights: Record<string, number>): number {
  const weightedTotal = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scores[key] ?? 0) * weight
  }, 0)

  return round(clamp(weightedTotal))
}

export function estimateOneRepMaxKg(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) {
    return 0
  }

  return round(weightKg * (1 + reps / 30), 1)
}

export function getTrendDirection(delta: number): 'up' | 'down' | 'flat' {
  if (Math.abs(delta) < 0.01) {
    return 'flat'
  }

  return delta > 0 ? 'up' : 'down'
}

