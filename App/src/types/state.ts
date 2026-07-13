import type { Insight } from './insight'
import type { PerformanceScore, PersonalRecord, TrainingLoad } from './performance'
import type { WeeklyReport } from './report'
import type { WorkoutBundle } from './workout'

export interface PerformanceAppState extends WorkoutBundle {
  performanceScores: PerformanceScore[]
  personalRecords: PersonalRecord[]
  insights: Insight[]
  weeklyReports: WeeklyReport[]
  trainingLoads: TrainingLoad[]
}
