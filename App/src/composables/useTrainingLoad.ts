import { computed } from 'vue'
import { usePerformanceStore } from '@/stores/performanceStore'

export function useTrainingLoad() {
  const performanceStore = usePerformanceStore()

  const trainingLoad = computed(() => performanceStore.trainingLoad)
  const loadStatusLabel = computed(() => {
    if (!trainingLoad.value) return 'No load data'
    if (trainingLoad.value.status === 'overload') return 'Overload risk'
    if (trainingLoad.value.status === 'high') return 'High load'
    if (trainingLoad.value.status === 'low') return 'Low load'
    return 'Productive load'
  })

  return {
    trainingLoad,
    loadStatusLabel,
  }
}

