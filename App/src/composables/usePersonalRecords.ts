import { computed } from 'vue'
import { usePerformanceStore } from '@/stores/performanceStore'

export function usePersonalRecords() {
  const performanceStore = usePerformanceStore()

  const records = computed(() => performanceStore.records)
  const recentRecords = computed(() => records.value.slice(0, 3))

  return {
    records,
    recentRecords,
  }
}

