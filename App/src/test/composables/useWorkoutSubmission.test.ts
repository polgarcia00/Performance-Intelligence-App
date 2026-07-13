import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useWorkoutSubmission } from '@/composables/useWorkoutSubmission'
import { useWorkoutStore } from '@/stores/workoutStore'

const apiMocks = vi.hoisted(() => ({
  createManualWorkout: vi.fn(),
}))

vi.mock('@/services/workoutApiService', () => ({
  createManualWorkout: apiMocks.createManualWorkout,
  fetchWorkouts: vi.fn(),
  fetchWorkoutDetail: vi.fn(),
  fetchWorkoutInbox: vi.fn(),
}))

describe('useWorkoutSubmission fallback workflow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    apiMocks.createManualWorkout.mockReset()
    apiMocks.createManualWorkout.mockResolvedValue({
      workouts: [{
        id: 'manual-run-1',
        type: 'running',
        date: '2026-07-07',
        durationMinutes: 30,
        distanceKm: 5,
        source: 'manual',
      }],
      runningSessions: [{ workoutId: 'manual-run-1', distanceKm: 5, paceSecondsPerKm: 360 }],
      strengthSessions: [],
      basketballSessions: [],
      runningEnrichments: [],
      strengthEnrichments: [],
      basketballEnrichments: [],
      journalStatuses: {},
    })
  })

  it('submits a valid missing running workout through the backend store action', async () => {
    const { submitRunningWorkout } = useWorkoutSubmission()
    const workoutStore = useWorkoutStore()

    const created = await submitRunningWorkout({
      startedAt: '2026-07-07T10:00',
      durationMinutes: 30,
      distanceKm: 5,
      averageHeartRate: 145,
      maxHeartRate: 170,
    })

    expect(apiMocks.createManualWorkout).toHaveBeenCalledWith({
      sport: 'running',
      startedAt: '2026-07-07T10:00',
      durationSeconds: 1800,
      distanceMeters: 5000,
      calories: undefined,
      averageHeartRate: 145,
      maxHeartRate: 170,
    })
    expect(created.id).toBe('manual-run-1')
    expect(workoutStore.workoutsByType('running')).toHaveLength(1)
    expect(workoutStore.workouts[0]?.source).toBe('manual')
  })

  it('rejects invalid workout input before calling the backend', async () => {
    const { submitRunningWorkout } = useWorkoutSubmission()

    await expect(
      submitRunningWorkout({
        startedAt: '2026-07-07T10:00',
        durationMinutes: 0,
        distanceKm: 5,
      }),
    ).rejects.toThrow('Duration must be greater than 0')

    expect(apiMocks.createManualWorkout).not.toHaveBeenCalled()
  })
})
