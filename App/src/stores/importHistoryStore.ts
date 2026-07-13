import { defineStore } from 'pinia'
import type { ImportHistoryItem } from '@/types'
import { fetchImportHistory } from '@/services/importApiService'

interface ImportHistoryState {
  history: ImportHistoryItem[]
  isLoading: boolean
  error: string | null
}

export const useImportHistoryStore = defineStore('importHistory', {
  state: (): ImportHistoryState => ({
    history: [],
    isLoading: false,
    error: null,
  }),
  getters: {
    latestImport: (state) => [...state.history].sort((a, b) => b.importedAt.localeCompare(a.importedAt))[0],
    hasImports: (state) => state.history.length > 0,
  },
  actions: {
    async loadHistory() {
      this.isLoading = true
      this.error = null

      try {
        this.history = await fetchImportHistory()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to load import history.'
      } finally {
        this.isLoading = false
      }
    },
    addHistoryItem(item: ImportHistoryItem) {
      this.history = [item, ...this.history]
    },
  },
})
