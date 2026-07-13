import type { PersonalRecord, WeeklyReport } from '@/types'
import { apiGet } from './apiClient'
import { adaptPersonalRecord } from './backendAdapters'

export interface BackendPerformanceAnalysis {
  records: PersonalRecord[]
  weeklyReport: WeeklyReport | null
}

export async function fetchRunningPerformance(filters: Record<string, string | number | undefined> = {}): Promise<any> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  return apiGet(`/performance/running${params.toString() ? `?${params.toString()}` : ''}`)
}

export async function fetchStrengthPerformance(filters: Record<string, string | number | undefined> = {}): Promise<any> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  return apiGet(`/performance/strength${params.toString() ? `?${params.toString()}` : ''}`)
}

export async function fetchBasketballPerformance(filters: Record<string, string | number | undefined> = {}): Promise<any> {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  return apiGet(`/performance/basketball${params.toString() ? `?${params.toString()}` : ''}`)
}

export async function fetchPerformanceTrends(): Promise<any> {
  return apiGet('/performance/trends')
}

export async function fetchPersonalRecords(): Promise<PersonalRecord[]> {
  const response = await apiGet<any>('/performance/records')
  return (response.records ?? []).map(adaptPersonalRecord)
}

function dateOnly(value: unknown): string {
  return value ? String(value).slice(0, 10) : new Date().toISOString().slice(0, 10)
}

function mapWeeklyReview(row: any): WeeklyReport {
  return {
    id: String(row.id ?? `weekly-${row.week_start}`),
    weekStart: dateOnly(row.week_start),
    weekEnd: dateOnly(row.week_end),
    overallChange: 0,
    workoutsCompleted: 0,
    totalTrainingTimeMinutes: 0,
    sportDistribution: { running: 0, strength: 0, basketball: 0 },
    intensityDistribution: { easy: 0, moderate: 0, hard: 0 },
    bestPerformance: row.generated_summary ?? '',
    weakestArea: '',
    comparisonToPreviousWeek: row.generated_summary ?? '',
    weekStorySummary: row.generated_summary ?? '',
    runningSummary: row.running_reflection ?? '',
    strengthSummary: row.strength_reflection ?? '',
    basketballSummary: row.basketball_reflection ?? '',
    consistencySummary: row.consistency_reflection ?? '',
    lessonsLearned: Array.isArray(row.lessons_learned) ? row.lessons_learned : ['Review journal workouts before drawing conclusions.'],
    suggestedFocus: row.suggested_focus ?? '',
    insightIds: [],
    actionableInsightIds: [],
  }
}

export async function fetchBackendPerformanceAnalysis(): Promise<BackendPerformanceAnalysis> {
  const [records, weeklyReview] = await Promise.all([
    fetchPersonalRecords(),
    apiGet<any>('/weekly-reviews/current'),
  ])

  return {
    records,
    weeklyReport: weeklyReview ? mapWeeklyReview(weeklyReview) : null,
  }
}
