import type { WorkoutType } from './workout'

export interface PersonalRecord {
  id: string
  category: WorkoutType | 'consistency'
  metricName: string
  value: number
  unit: string
  date: string
  workoutId?: string
  previousValue?: number
}
