export interface WeeklyReport {
  id: string
  weekStart: string
  weekEnd: string
  overallChange: number
  workoutsCompleted: number
  totalTrainingTimeMinutes: number
  sportDistribution: {
    running: number
    strength: number
    basketball: number
  }
  intensityDistribution: {
    easy: number
    moderate: number
    hard: number
  }
  bestPerformance: string
  weakestArea: string
  comparisonToPreviousWeek: string
  trainingLoadSummary: string
  runningSummary: string
  strengthSummary: string
  basketballSummary: string
  consistencySummary: string
  lessonsLearned: string[]
  suggestedFocus: string
  insightIds: string[]
  actionableInsightIds: string[]
}
