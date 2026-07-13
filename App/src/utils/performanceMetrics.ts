import type { StrengthSession, StrengthWorkoutEnrichment } from '@/types'
import { round, sum } from './calculations'

export function calculateStrengthSessionVolume(session: StrengthSession): number {
  return round(
    sum(
      session.exercises.flatMap((exercise) =>
        exercise.sets.map((set) => set.reps * set.weightKg),
      ),
    ),
  )
}

export function enrichStrengthSession(session: StrengthSession): StrengthSession {
  return {
    ...session,
    totalVolumeKg: calculateStrengthSessionVolume(session),
  }
}

export function enrichStrengthEnrichment(enrichment: StrengthWorkoutEnrichment): StrengthWorkoutEnrichment {
  return enrichment
}
