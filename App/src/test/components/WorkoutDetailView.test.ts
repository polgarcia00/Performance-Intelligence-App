import { describe, expect, it, vi } from 'vitest'
import WorkoutDetailView from '@/views/WorkoutDetailView.vue'
import { useWorkoutStore } from '@/stores/workoutStore'
import { mountWithAppContext } from '../test-utils'

vi.mock('@/services/workoutApiService', () => ({
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
  fetchWorkouts: vi.fn(async () => ({
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

describe('WorkoutDetailView', () => {
  it('shows objective Zepp data and saves enrichment separately', async () => {
    const { wrapper } = await mountWithAppContext(WorkoutDetailView, {}, '/workouts/zepp-run-test')
    const workoutStore = useWorkoutStore()
    const objectiveWorkout = {
      id: 'zepp-run-test',
      type: 'running' as const,
      date: '2026-07-07',
      durationMinutes: 42,
      source: 'zepp' as const,
      calories: 420,
      distanceKm: 7.2,
    }

    workoutStore.workouts = [objectiveWorkout]
    workoutStore.runningSessions = [
      {
        workoutId: objectiveWorkout.id,
        distanceKm: 7.2,
        paceSecondsPerKm: 350,
      },
    ]
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Objective Zepp Data')
    expect(wrapper.text()).toContain('Journal Entry')
    expect(wrapper.text()).toContain('Needs enrichment')
    expect(wrapper.text()).toContain('420 kcal')
    expect(wrapper.text()).toContain('7.2 km')

    await wrapper.find('#running-goal').setValue('zone2')
    await wrapper.find('#running-effort').setValue(6)
    await wrapper.find('#running-performance').setValue(7)
    await wrapper.find('#running-notes').setValue('Controlled aerobic work.')
    await wrapper.find('form').trigger('submit.prevent')

    expect(workoutStore.getWorkoutById(objectiveWorkout.id)).toEqual(objectiveWorkout)
    expect(workoutStore.runningEnrichments[0]).toMatchObject({
      workoutId: objectiveWorkout.id,
      goal: 'zone2',
      perceivedEffort: 6,
      perceivedPerformance: 7,
      notes: 'Controlled aerobic work.',
    })
  })
})
