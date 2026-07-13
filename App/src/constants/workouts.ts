import type { WorkoutType } from '@/types'

export const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  running: 'Running',
  strength: 'Strength',
  basketball: 'Basketball',
}

export const SPORT_ACCENTS: Record<WorkoutType | 'overall', string> = {
  overall: 'var(--color-accent)',
  running: 'var(--color-running)',
  strength: 'var(--color-strength)',
  basketball: 'var(--color-basketball)',
}

export const DEFAULT_MUSCLE_GROUPS = [
  'Legs',
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Core',
] as const
