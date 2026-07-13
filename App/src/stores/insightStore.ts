import { defineStore } from 'pinia'
import type { Insight, InsightCategory } from '@/types'
import { usePerformanceStore } from './performanceStore'

interface InsightState {
  activeCategory: InsightCategory | 'all'
  dismissedIds: string[]
  savedIds: string[]
}

export const useInsightStore = defineStore('insights', {
  state: (): InsightState => ({
    activeCategory: 'all',
    dismissedIds: [],
    savedIds: [],
  }),
  getters: {
    allInsights(): Insight[] {
      const performanceStore = usePerformanceStore()
      return performanceStore.insights.map((insight) => ({
        ...insight,
        status: this.dismissedIds.includes(insight.id)
          ? 'dismissed'
          : this.savedIds.includes(insight.id)
            ? 'saved'
            : insight.status,
      }))
    },
    visibleInsights(): Insight[] {
      return this.allInsights.filter((insight) => {
        const matchesCategory = this.activeCategory === 'all' || insight.category === this.activeCategory
        return matchesCategory && insight.status !== 'dismissed'
      })
    },
  },
  actions: {
    setCategory(category: InsightCategory | 'all') {
      this.activeCategory = category
    },
    dismissInsight(id: string) {
      if (!this.dismissedIds.includes(id)) {
        this.dismissedIds.push(id)
      }
    },
    saveInsight(id: string) {
      if (!this.savedIds.includes(id)) {
        this.savedIds.push(id)
      }
    },
  },
})

