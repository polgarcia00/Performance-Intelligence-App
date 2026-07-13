import { computed } from 'vue'
import type { Workout } from '@/types'
import { WORKOUT_TYPE_LABELS } from '@/constants/workouts'
import { formatDate } from '@/utils/formatters'

export function useChartData(workouts: () => Workout[]) {
  const weeklyLoadData = computed(() => {
    const sorted = [...workouts()].sort((a, b) => a.date.localeCompare(b.date))
    return {
      labels: sorted.map((workout) => formatDate(workout.date, 'short')),
      values: sorted.map((workout) => workout.trainingLoad ?? workout.durationMinutes * (workout.perceivedEffort ?? 5)),
    }
  })

  const sportDistributionData = computed(() => {
    const totals = workouts().reduce(
      (acc, workout) => {
        acc[workout.type] += workout.durationMinutes
        return acc
      },
      { running: 0, strength: 0, basketball: 0 },
    )

    return {
      labels: Object.keys(totals).map((key) => WORKOUT_TYPE_LABELS[key as keyof typeof totals]),
      values: Object.values(totals),
    }
  })

  return {
    weeklyLoadData,
    sportDistributionData,
  }
}
