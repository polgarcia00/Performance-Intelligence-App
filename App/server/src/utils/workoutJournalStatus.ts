import type { BasketballJournalInput, JournalStatus, RunningJournalInput, StrengthJournalInput } from '../types/domain.js'

export interface JournalStatusResult {
  status: JournalStatus
  missingFields: string[]
}

function hasRating(value?: number): boolean {
  return typeof value === 'number' && value >= 1 && value <= 10
}

function result(missingFields: string[], touched: boolean): JournalStatusResult {
  if (!touched) return { status: 'needs_enrichment', missingFields }
  if (missingFields.length) return { status: 'partially_enriched', missingFields }
  return { status: 'completed', missingFields: [] }
}

export function runningJournalStatus(journal?: RunningJournalInput | null): JournalStatusResult {
  const missingFields = [
    journal?.trainingPurpose ? '' : 'training purpose',
    hasRating(journal?.perceivedEffort) ? '' : 'perceived effort',
    hasRating(journal?.perceivedPerformance) ? '' : 'perceived performance',
  ].filter(Boolean)

  const touched = Boolean(journal?.trainingPurpose || journal?.routeType || journal?.notes || hasRating(journal?.perceivedEffort) || hasRating(journal?.perceivedPerformance))
  return result(missingFields, touched)
}

export function strengthJournalStatus(journal?: StrengthJournalInput | null): JournalStatusResult {
  const exercises = journal?.exercises ?? []
  const missingFields = [
    exercises.length ? '' : 'exercise list',
    exercises.every((exercise) => exercise.sets.length && exercise.sets.every((set) => set.reps > 0 && set.weightKg >= 0))
      ? ''
      : 'sets, reps, and weight',
  ].filter(Boolean)

  const touched = Boolean(journal?.sessionType || journal?.notes || exercises.length)
  return result(missingFields, touched)
}

export function basketballJournalStatus(journal?: BasketballJournalInput | null): JournalStatusResult {
  const missingFields = [
    journal?.sessionType ? '' : 'session type',
    hasRating(journal?.perceivedPerformance) ? '' : 'performance',
    hasRating(journal?.perceivedEffort) ? '' : 'perceived effort',
    hasRating(journal?.energy) ? '' : 'energy',
    hasRating(journal?.shooting) ? '' : 'shooting',
    hasRating(journal?.defense) ? '' : 'defense',
    journal?.role ? '' : 'role',
  ].filter(Boolean)

  const touched = Boolean(
    journal?.sessionType ||
      journal?.role ||
      journal?.notes ||
      hasRating(journal?.perceivedPerformance) ||
      hasRating(journal?.perceivedEffort) ||
      hasRating(journal?.energy) ||
      hasRating(journal?.shooting) ||
      hasRating(journal?.defense),
  )
  return result(missingFields, touched)
}
