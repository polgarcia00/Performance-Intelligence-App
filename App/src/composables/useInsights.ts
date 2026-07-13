import { computed } from 'vue'
import { useInsightStore } from '@/stores/insightStore'
import { usePerformanceStore } from '@/stores/performanceStore'

export function useInsights() {
  const insightStore = useInsightStore()
  const performanceStore = usePerformanceStore()

  const insights = computed(() => insightStore.visibleInsights)
  const activeInsights = computed(() => performanceStore.insights.filter((insight) => insight.status === 'active'))
  const primaryInsight = computed(() => insights.value[0])

  return {
    insights,
    activeInsights,
    primaryInsight,
    setCategory: insightStore.setCategory,
    dismissInsight: insightStore.dismissInsight,
    saveInsight: insightStore.saveInsight,
  }
}

