import { computed } from 'vue'
import { usePerformanceStore } from '@/stores/performanceStore'

export function useWeeklyReport() {
  const performanceStore = usePerformanceStore()

  const weeklyReport = computed(() => performanceStore.weeklyReport)

  return {
    weeklyReport,
  }
}

