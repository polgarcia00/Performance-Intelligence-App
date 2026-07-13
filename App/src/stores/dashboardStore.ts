import { defineStore } from 'pinia'
import { fetchDashboardSummary } from '@/services/dashboardApiService'

interface DashboardState {
  summary: any | null
  isLoading: boolean
  error: string | null
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    summary: null,
    isLoading: false,
    error: null,
  }),
  getters: {
    hasWorkouts: (state) => Boolean(state.summary?.whatHappened?.workoutCount),
  },
  actions: {
    async loadSummary() {
      this.isLoading = true
      this.error = null

      try {
        this.summary = await fetchDashboardSummary()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to load dashboard summary.'
      } finally {
        this.isLoading = false
      }
    },
  },
})
