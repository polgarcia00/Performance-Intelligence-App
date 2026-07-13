export const SCORE_MIN = 0
export const SCORE_MAX = 100
export const DEFAULT_SCORE = 50
export const SCORE_CONFIDENCE_FULL = 100

export const RECENT_DAYS = 28
export const PREVIOUS_DAYS = 28
export const DAYS_PER_WEEK = 7
export const CHRONIC_LOAD_WEEKS = 4

export const TRAINING_LOAD_STATUS = {
  low: { minRatio: 0, maxRatio: 0.79, label: 'Low' },
  productive: { minRatio: 0.8, maxRatio: 1.25, label: 'Productive' },
  high: { minRatio: 1.26, maxRatio: 1.49, label: 'High' },
  overload: { minRatio: 1.5, maxRatio: Number.POSITIVE_INFINITY, label: 'Overload' },
} as const

export const SCORE_WEIGHTS = {
  endurance: 0.18,
  strength: 0.18,
  explosiveness: 0.16,
  workCapacity: 0.22,
  consistency: 0.26,
} as const

export const LOAD_MULTIPLIERS = {
  running: 1,
  strength: 0.85,
  basketball: 1.15,
} as const

export const DEFAULT_BASELINE_SCORE = 50
export const MAX_REASONABLE_HEART_RATE = 220
export const MIN_REASONABLE_HEART_RATE = 35
export const MAX_PERCEIVED_EFFORT = 10
export const MIN_PERCEIVED_EFFORT = 1
