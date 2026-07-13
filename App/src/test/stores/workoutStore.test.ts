import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWorkoutStore } from '@/stores/workoutStore'
import type { RunningSession, Workout } from '@/types'

vi.mock('@/services/workoutApiService', () => ({
  fetchWorkouts: vi.fn(async () => ({
    workouts: [],
    runningSessions: [],
    strengthSessions: [],
    basketballSessions: [],
    runningEnrichments: [],
    strengthEnrichments: [],
    basketballEnrichments: [],
  })),
  fetchWorkoutDetail: vi.fn(async () => ({
    workouts: [],
    runningSessions: [],
    strengthSessions: [],
    basketballSessions: [],
    runningEnrichments: [],
    strengthEnrichments: [],
    basketballEnrichments: [],
    journalStatuses: {},
  })),
  fetchWorkoutInbox: vi.fn(async () => ({
    workouts: [],
    runningSessions: [],
    strengthSessions: [],
    basketballSessions: [],
    runningEnrichments: [],
    strengthEnrichments: [],
    basketballEnrichments: [],
    journalStatuses: {},
  })),
}))

vi.mock('@/services/journalApiService', () => ({
  saveRunningJournal: vi.fn(async () => undefined),
  saveStrengthJournal: vi.fn(async () => undefined),
  saveBasketballJournal: vi.fn(async () => undefined),
}))

describe('useWorkoutStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds a running workout and exposes it by type', async () => {
    const store = useWorkoutStore()
    const workout: Workout = {
      id: 'run-test',
      type: 'running',
      date: '2026-07-07',
      durationMinutes: 30,
      source: 'manual',
      perceivedEffort: 6,
    }
    const session: RunningSession = {
      workoutId: workout.id,
      distanceKm: 5,
      paceSecondsPerKm: 360,
    }

    await store.addRunningWorkout(workout, session)

    expect(store.workoutsByType('running')).toHaveLength(1)
    expect(store.runningSessions[0]?.distanceKm).toBe(5)
  })

  it('stores enrichment separately from objective Zepp workout data', async () => {
    const store = useWorkoutStore()
    const workout: Workout = {
      id: 'zepp-run-test',
      type: 'running',
      date: '2026-07-07',
      durationMinutes: 42,
      source: 'zepp',
      calories: 420,
      distanceKm: 7.2,
    }

    store.workouts = [workout]
    await store.updateRunningEnrichment(workout.id, {
      workoutId: workout.id,
      goal: 'zone2',
      perceivedEffort: 6,
      notes: 'Felt controlled.',
    })

    expect(store.getWorkoutById(workout.id)).toEqual(workout)
    expect(store.getEnrichmentByWorkoutId(workout.id)).toMatchObject({
      workoutId: workout.id,
      goal: 'zone2',
      perceivedEffort: 6,
    })
  })

  it('tracks journal review status without mutating imported objective data', async () => {
    const store = useWorkoutStore()
    const workout: Workout = {
      id: 'zepp-review-test',
      type: 'running',
      date: '2026-07-07',
      durationMinutes: 42,
      source: 'zepp',
      calories: 420,
      distanceKm: 7.2,
    }

    store.workouts = [workout]

    expect(store.getJournalStatusByWorkoutId(workout.id)).toMatchObject({
      status: 'needs-enrichment',
    })

    await store.updateRunningEnrichment(workout.id, {
      workoutId: workout.id,
      goal: 'zone2',
      perceivedEffort: 6,
      perceivedPerformance: 7,
    })

    expect(store.getWorkoutById(workout.id)).toEqual(workout)
    expect(store.getJournalStatusByWorkoutId(workout.id)).toMatchObject({
      status: 'completed',
    })
    expect(store.workoutsNeedingEnrichment).toHaveLength(0)
  })
})
