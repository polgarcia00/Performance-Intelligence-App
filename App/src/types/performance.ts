import type { WorkoutType } from './workout'

export interface PerformanceScore {
  id: string
  date: string
  period: 'daily' | 'weekly' | 'monthly'
  overall: number
  endurance: number
  strength: number
  explosiveness: number
  workCapacity: number
  consistency: number
  confidence: number
}

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

export interface TrainingLoad {
  id: string
  weekStart: string
  weekEnd: string
  totalLoad: number
  runningLoad: number
  strengthLoad: number
  basketballLoad: number
  acuteLoad: number
  chronicLoad: number
  acuteChronicRatio: number
  status: 'low' | 'productive' | 'high' | 'overload'
}
