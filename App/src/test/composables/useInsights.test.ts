import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { useInsights } from '@/composables/useInsights'
import { usePerformanceStore } from '@/stores/performanceStore'

describe('useInsights', () => {
  it('filters dismissed insights from the visible list', () => {
    setActivePinia(createPinia())
    const performanceStore = usePerformanceStore()
    performanceStore.insights = [
      {
        id: 'insight-1',
        category: 'improvement',
        title: 'Running is improving',
        message: 'Pace is improving.',
        relatedMetric: 'Pace',
        periodStart: '2026-07-01',
        periodEnd: '2026-07-07',
        confidence: 90,
        suggestedAction: 'Keep one easy run.',
        status: 'active',
      },
    ]

    const { insights, dismissInsight } = useInsights()
    expect(insights.value).toHaveLength(1)

    dismissInsight('insight-1')
    expect(insights.value).toHaveLength(0)
  })
})

