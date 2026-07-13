import type { WorkoutBundle } from '@/types'
import type { WorkoutJournalStatusSummary } from '@/utils/workoutJournal'
import { apiGet } from './apiClient'
import { adaptJournalStatus, adaptWorkout, adaptWorkoutDetail, emptyWorkoutBundle } from './backendAdapters'

export interface WorkoutListFilters {
  sport?: string
  status?: 'needs_enrichment' | 'partially_enriched' | 'completed'
  from?: string
  to?: string
  page?: number
  pageSize?: number
  sort?: 'asc' | 'desc'
}

export interface WorkoutBundleWithStatus extends WorkoutBundle {
  journalStatuses: Record<string, WorkoutJournalStatusSummary>
}

function queryString(filters: WorkoutListFilters = {}): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  return params.toString() ? `?${params.toString()}` : ''
}

export async function fetchWorkoutRows(filters: WorkoutListFilters = {}): Promise<any[]> {
  return apiGet(`/workouts${queryString(filters)}`)
}

function adaptWorkoutRows(rows: any[]): WorkoutBundleWithStatus {
  return {
    ...emptyWorkoutBundle(),
    workouts: rows.map(adaptWorkout),
    journalStatuses: Object.fromEntries(rows.map((row) => [String(row.id), adaptJournalStatus(row.journalStatus)])),
  }
}

export async function fetchWorkouts(filters: WorkoutListFilters = { pageSize: 50 }): Promise<WorkoutBundleWithStatus> {
  return adaptWorkoutRows(await fetchWorkoutRows(filters))
}

export async function fetchWorkoutInbox(filters: WorkoutListFilters = { pageSize: 50 }): Promise<WorkoutBundleWithStatus> {
  const rows = await apiGet<any[]>(`/workouts/inbox${queryString(filters)}`)
  return adaptWorkoutRows(rows)
}

export async function fetchWorkoutDetail(workoutId: string): Promise<WorkoutBundleWithStatus> {
  return adaptWorkoutDetail(await apiGet(`/workouts/${workoutId}`))
}
