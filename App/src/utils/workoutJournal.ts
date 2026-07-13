import type {
  BasketballWorkoutEnrichment,
  RunningWorkoutEnrichment,
  StrengthWorkoutEnrichment,
  Workout,
} from '@/types'

export type WorkoutJournalStatus = 'needs-enrichment' | 'partially-enriched' | 'completed'

export interface WorkoutJournalStatusSummary {
  status: WorkoutJournalStatus
  label: string
  tone: 'neutral' | 'positive' | 'warning' | 'risk'
  missingFields: string[]
}

type WorkoutEnrichment =
  | BasketballWorkoutEnrichment
  | RunningWorkoutEnrichment
  | StrengthWorkoutEnrichment
  | undefined

function hasRating(value?: number): boolean {
  return typeof value === 'number' && value > 0
}

function hasText(value?: string): boolean {
  return Boolean(value?.trim())
}

function summarize(missingFields: string[], touched: boolean): WorkoutJournalStatusSummary {
  if (!touched) {
    return {
      status: 'needs-enrichment',
      label: 'Needs enrichment',
      tone: 'warning',
      missingFields,
    }
  }

  if (missingFields.length) {
    return {
      status: 'partially-enriched',
      label: 'Partially enriched',
      tone: 'neutral',
      missingFields,
    }
  }

  return {
    status: 'completed',
    label: 'Completed',
    tone: 'positive',
    missingFields: [],
  }
}

function runningStatus(enrichment?: RunningWorkoutEnrichment): WorkoutJournalStatusSummary {
  const missingFields = [
    !enrichment?.goal ? 'training purpose' : '',
    !hasRating(enrichment?.perceivedEffort) ? 'perceived effort' : '',
    !hasRating(enrichment?.perceivedPerformance) ? 'perceived performance' : '',
  ].filter(Boolean)

  const touched = Boolean(
    enrichment?.goal ||
      enrichment?.routeType ||
      enrichment?.feltStrong ||
      hasText(enrichment?.notes) ||
      hasRating(enrichment?.perceivedEffort) ||
      hasRating(enrichment?.perceivedPerformance),
  )

  return summarize(missingFields, touched)
}

function strengthStatus(enrichment?: StrengthWorkoutEnrichment): WorkoutJournalStatusSummary {
  const completeSets = enrichment?.exercises.flatMap((exercise) =>
    exercise.sets.filter((set) => set.reps > 0 && set.weightKg >= 0),
  )
  const namedExercises = enrichment?.exercises.filter((exercise) => hasText(exercise.name)) ?? []
  const missingFields = [
    !namedExercises.length ? 'exercise list' : '',
    !completeSets?.length ? 'sets, reps, and weight' : '',
  ].filter(Boolean)

  const touched = Boolean(enrichment?.sessionType || hasText(enrichment?.notes) || namedExercises.length || completeSets?.length)

  return summarize(missingFields, touched)
}

function basketballStatus(enrichment?: BasketballWorkoutEnrichment): WorkoutJournalStatusSummary {
  const missingFields = [
    !enrichment?.sessionType ? 'session type' : '',
    !hasRating(enrichment?.perceivedPerformance) ? 'performance' : '',
    !hasRating(enrichment?.perceivedEffort) ? 'perceived effort' : '',
    !hasRating(enrichment?.energyLevel) ? 'energy' : '',
    !hasRating(enrichment?.shootingQuality) ? 'shooting' : '',
    !hasRating(enrichment?.defenseQuality) ? 'defense' : '',
    !enrichment?.role ? 'role' : '',
  ].filter(Boolean)

  const touched = Boolean(
    enrichment?.sessionType ||
      enrichment?.role ||
      enrichment?.outcome !== undefined ||
      hasText(enrichment?.notes) ||
      hasRating(enrichment?.perceivedPerformance) ||
      hasRating(enrichment?.perceivedEffort) ||
      hasRating(enrichment?.energyLevel) ||
      hasRating(enrichment?.shootingQuality) ||
      hasRating(enrichment?.defenseQuality) ||
      hasRating(enrichment?.explosiveness),
  )

  return summarize(missingFields, touched)
}

export function getWorkoutJournalStatus(
  workout: Workout,
  enrichment: WorkoutEnrichment,
): WorkoutJournalStatusSummary {
  if (workout.type === 'running') return runningStatus(enrichment as RunningWorkoutEnrichment | undefined)
  if (workout.type === 'strength') return strengthStatus(enrichment as StrengthWorkoutEnrichment | undefined)
  return basketballStatus(enrichment as BasketballWorkoutEnrichment | undefined)
}
