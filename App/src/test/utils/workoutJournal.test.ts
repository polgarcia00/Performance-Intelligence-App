import { describe, expect, it } from 'vitest'
import type { BasketballWorkoutEnrichment, RunningWorkoutEnrichment, StrengthWorkoutEnrichment, Workout } from '@/types'
import { getWorkoutJournalStatus } from '@/utils/workoutJournal'

const runningWorkout: Workout = {
  id: 'run-1',
  type: 'running',
  date: '2026-07-07',
  durationMinutes: 42,
  source: 'zepp',
}

describe('workoutJournal', () => {
  it('marks imported workouts as needing enrichment before journal data exists', () => {
    expect(getWorkoutJournalStatus(runningWorkout, undefined)).toMatchObject({
      status: 'needs-enrichment',
      label: 'Needs enrichment',
      missingFields: ['training purpose', 'perceived effort', 'perceived performance'],
    })
  })

  it('distinguishes partially enriched running workouts from completed journal entries', () => {
    const partial: RunningWorkoutEnrichment = {
      workoutId: runningWorkout.id,
      goal: 'zone2',
    }
    const completed: RunningWorkoutEnrichment = {
      workoutId: runningWorkout.id,
      goal: 'zone2',
      perceivedEffort: 5,
      perceivedPerformance: 7,
    }

    expect(getWorkoutJournalStatus(runningWorkout, partial).status).toBe('partially-enriched')
    expect(getWorkoutJournalStatus(runningWorkout, completed).status).toBe('completed')
  })

  it('requires exercise set context for strength journal completion', () => {
    const workout: Workout = { ...runningWorkout, id: 'strength-1', type: 'strength' }
    const enrichment: StrengthWorkoutEnrichment = {
      workoutId: workout.id,
      exercises: [
        {
          id: 'exercise-1',
          name: 'Back squat',
          muscleGroup: 'Legs',
          sets: [{ id: 'set-1', setNumber: 1, reps: 5, weightKg: 100, rpe: 8 }],
        },
      ],
    }

    expect(getWorkoutJournalStatus(workout, enrichment).status).toBe('completed')
  })

  it('requires qualitative basketball context for completion', () => {
    const workout: Workout = { ...runningWorkout, id: 'basketball-1', type: 'basketball' }
    const enrichment: BasketballWorkoutEnrichment = {
      workoutId: workout.id,
      sessionType: 'pickup',
      perceivedPerformance: 8,
      perceivedEffort: 7,
      energyLevel: 8,
      shootingQuality: 6,
      defenseQuality: 7,
      role: 'facilitator',
    }

    expect(getWorkoutJournalStatus(workout, enrichment).status).toBe('completed')
  })
})
