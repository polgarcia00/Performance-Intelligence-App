import { describe, expect, it } from 'vitest'
import WorkoutListView from '@/views/WorkoutListView.vue'
import { useWorkoutStore } from '@/stores/workoutStore'
import { mountWithAppContext } from '../test-utils'

describe('Workout Inbox', () => {
  it('shows imported workouts with enrichment status and an open action', async () => {
    const { wrapper } = await mountWithAppContext(WorkoutListView, {}, '/workouts')
    const workoutStore = useWorkoutStore()

    workoutStore.workouts = [
      {
        id: 'run-needs-review',
        type: 'running',
        date: '2026-07-07',
        durationMinutes: 42,
        source: 'zepp',
      },
      {
        id: 'run-complete',
        type: 'running',
        date: '2026-07-08',
        durationMinutes: 35,
        source: 'zepp',
      },
    ]
    workoutStore.runningEnrichments = [
      {
        workoutId: 'run-complete',
        goal: 'zone2',
        perceivedEffort: 5,
        perceivedPerformance: 7,
      },
    ]
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Workout Inbox')
    expect(wrapper.text()).toContain('Needs enrichment')
    expect(wrapper.text()).toContain('Completed')
    expect(wrapper.text()).toContain('Open workout')
  })
})
