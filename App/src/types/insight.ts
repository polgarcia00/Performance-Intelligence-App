export type InsightCategory =
  | 'improvement'
  | 'fatigue'
  | 'plateau'
  | 'record'
  | 'recommendation'

export interface Insight {
  id: string
  category: InsightCategory
  title: string
  message: string
  relatedMetric: string
  relatedWorkoutId?: string
  periodStart: string
  periodEnd: string
  confidence: number
  suggestedAction: string
  status: 'active' | 'saved' | 'dismissed'
}
