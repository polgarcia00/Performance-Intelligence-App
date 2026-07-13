import type { WeeklyReport } from '@/types'
import { fetchBackendPerformanceAnalysis } from './performanceApiService'

export async function fetchCurrentWeeklyReview(): Promise<WeeklyReport | null> {
  return (await fetchBackendPerformanceAnalysis()).weeklyReport
}
