import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useWorkoutSubmission } from '@/composables/useWorkoutSubmission'
import { useWorkoutStore } from '@/stores/workoutStore'

describe('useWorkoutSubmission fallback workflow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.localStorage.clear()
  })

  it('submits a valid missing running workout as a manual-source fallback', async () => {
    const { submitRunningWorkout } = useWorkoutSubmission()
    const workoutStore = useWorkoutStore()

    await submitRunningWorkout({
      date: '2026-07-07',
      durationMinutes: 30,
      distanceKm: 5,
      averageHeartRate: 145,
      maxHeartRate: 170,
    })

    expect(workoutStore.workoutsByType('running')).toHaveLength(1)
    expect(workoutStore.workouts[0]?.source).toBe('manual')
    expect(workoutStore.runningSessions[0]?.distanceKm).toBe(5)
  })

  it('rejects invalid workout input before writing to the store', async () => {
    const { submitRunningWorkout } = useWorkoutSubmission()
    const workoutStore = useWorkoutStore()

    await expect(
      submitRunningWorkout({
        date: '2026-07-07',
        durationMinutes: 0,
        distanceKm: 5,
      }),
    ).rejects.toThrow('Duration must be greater than 0')

    expect(workoutStore.workouts).toHaveLength(0)
  })
})
