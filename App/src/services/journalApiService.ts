import type { BasketballWorkoutEnrichment, RunningWorkoutEnrichment, StrengthWorkoutEnrichment } from '@/types'
import { apiPut } from './apiClient'

export async function saveRunningJournal(workoutId: string, enrichment: Partial<RunningWorkoutEnrichment>): Promise<void> {
  await apiPut(`/workouts/${workoutId}/running-journal`, {
    trainingPurpose: enrichment.goal,
    perceivedEffort: enrichment.perceivedEffort,
    perceivedPerformance: enrichment.perceivedPerformance,
    routeType: enrichment.routeType,
    feltStrong: enrichment.feltStrong,
    notes: enrichment.notes,
  })
}

export async function saveStrengthJournal(workoutId: string, enrichment: Partial<StrengthWorkoutEnrichment>): Promise<void> {
  await apiPut(`/workouts/${workoutId}/strength-journal`, {
    sessionType: enrichment.sessionType,
    notes: enrichment.notes,
    exercises: (enrichment.exercises ?? []).map((exercise) => ({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: exercise.sets.map((set, index) => ({
        setNumber: set.setNumber ?? index + 1,
        reps: set.reps,
        weightKg: set.weightKg,
        rpe: set.rpe,
      })),
    })),
  })
}

export async function saveBasketballJournal(workoutId: string, enrichment: Partial<BasketballWorkoutEnrichment>): Promise<void> {
  await apiPut(`/workouts/${workoutId}/basketball-journal`, {
    sessionType: enrichment.sessionType,
    perceivedPerformance: enrichment.perceivedPerformance,
    perceivedEffort: enrichment.perceivedEffort,
    energy: enrichment.energyLevel,
    explosiveness: enrichment.explosiveness,
    shooting: enrichment.shootingQuality,
    defense: enrichment.defenseQuality,
    role: enrichment.role,
    outcome: enrichment.outcome,
    notes: enrichment.notes,
  })
}
