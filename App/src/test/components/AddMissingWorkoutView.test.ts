import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddMissingWorkoutView from '@/views/AddMissingWorkoutView.vue'
import { mountWithAppContext } from '../test-utils'

const apiMocks = vi.hoisted(() => ({
  createManualWorkout: vi.fn(),
}))

vi.mock('@/services/workoutApiService', () => ({
  createManualWorkout: apiMocks.createManualWorkout,
  fetchWorkouts: vi.fn(),
  fetchWorkoutDetail: vi.fn(),
  fetchWorkoutInbox: vi.fn(),
}))

describe('AddMissingWorkoutView', () => {
  beforeEach(() => {
    apiMocks.createManualWorkout.mockReset()
    apiMocks.createManualWorkout.mockResolvedValue({
      workouts: [{
        id: 'manual-running-1',
        type: 'running',
        date: '2026-07-13',
        durationMinutes: 40,
        distanceKm: 6,
        source: 'manual',
      }],
      runningSessions: [{ workoutId: 'manual-running-1', distanceKm: 6, paceSecondsPerKm: 400 }],
      strengthSessions: [],
      basketballSessions: [],
      runningEnrichments: [],
      strengthEnrichments: [],
      basketballEnrichments: [],
      journalStatuses: {},
    })
  })

  it('persists a missing workout and offers the normal enrichment workflow', async () => {
    const { wrapper } = await mountWithAppContext(AddMissingWorkoutView, {}, '/workouts/add-missing')

    expect(wrapper.text()).toContain('Add a workout that Zepp missed')
    expect(wrapper.text()).not.toMatch(/temporary|debug/i)

    await wrapper.find('#run-started-at').setValue('2026-07-13T10:00')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(apiMocks.createManualWorkout).toHaveBeenCalledWith(expect.objectContaining({
      sport: 'running',
      startedAt: '2026-07-13T10:00',
      durationSeconds: 2400,
      distanceMeters: 6000,
    }))
    expect(wrapper.get('[role="status"]').text()).toContain('stored in PostgreSQL')
    expect(wrapper.get('a[href="/workouts/manual-running-1"]').text()).toContain('Review and enrich workout')
  })
})
