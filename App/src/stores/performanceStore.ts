import { defineStore } from 'pinia'
import type { Insight, PersonalRecord, TrainingLoad, WeeklyReport } from '@/types'
import {
  fetchBackendPerformanceAnalysis,
  fetchBasketballPerformance,
  fetchPerformanceTrends,
  fetchRunningPerformance,
  fetchStrengthPerformance,
} from '@/services/performanceApiService'

interface PerformanceState {
  trainingLoad: TrainingLoad | null
  records: PersonalRecord[]
  insights: Insight[]
  weeklyReport: WeeklyReport | null
  runningPerformance: any | null
  strengthPerformance: any | null
  basketballPerformance: any | null
  trends: any | null
  activeTab: 'running' | 'strength' | 'basketball' | 'records' | 'trends'
  isLoading: boolean
  error: string | null
}

export const usePerformanceStore = defineStore('performance', {
  state: (): PerformanceState => ({
    trainingLoad: null,
    records: [],
    insights: [],
    weeklyReport: null,
    runningPerformance: null,
    strengthPerformance: null,
    basketballPerformance: null,
    trends: null,
    activeTab: 'running',
    isLoading: false,
    error: null,
  }),
  getters: {
    hasAnalysis: (state) => Boolean(state.runningPerformance || state.strengthPerformance || state.basketballPerformance || state.records.length),
  },
  actions: {
    async loadBackendAnalysis() {
      this.isLoading = true
      this.error = null

      try {
        const [analysis, running, strength, basketball, trends] = await Promise.all([
          fetchBackendPerformanceAnalysis(),
          fetchRunningPerformance(),
          fetchStrengthPerformance(),
          fetchBasketballPerformance(),
          fetchPerformanceTrends(),
        ])
        this.records = analysis.records
        this.weeklyReport = analysis.weeklyReport
        this.runningPerformance = running
        this.strengthPerformance = strength
        this.basketballPerformance = basketball
        this.trends = trends
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to load performance analysis.'
      } finally {
        this.isLoading = false
      }
    },
    setActiveTab(tab: PerformanceState['activeTab']) {
      this.activeTab = tab
    },
  },
})
