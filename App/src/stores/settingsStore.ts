import { defineStore } from 'pinia'
import type { DistanceUnit, WeightUnit } from '@/types'
import { clearAllPersistedState, readPersistedState, writePersistedState } from '@/services/persistenceService'

const STORAGE_KEY = 'settings'

interface SettingsState {
  athleteName: string
  preferredDistanceUnit: DistanceUnit
  preferredWeightUnit: WeightUnit
  baselineStartDate: string
  baselineEndDate: string
  theme: 'dark' | 'light'
}

const defaultSettings: SettingsState = {
  athleteName: 'Pol',
  preferredDistanceUnit: 'km',
  preferredWeightUnit: 'kg',
  baselineStartDate: '',
  baselineEndDate: '',
  theme: 'dark',
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    ...defaultSettings,
    ...(readPersistedState<SettingsState>(STORAGE_KEY) ?? {}),
  }),
  actions: {
    updateSettings(settings: Partial<SettingsState>) {
      Object.assign(this, settings)
      writePersistedState(STORAGE_KEY, {
        athleteName: this.athleteName,
        preferredDistanceUnit: this.preferredDistanceUnit,
        preferredWeightUnit: this.preferredWeightUnit,
        baselineStartDate: this.baselineStartDate,
        baselineEndDate: this.baselineEndDate,
        theme: this.theme,
      })
    },
    resetLocalData() {
      clearAllPersistedState()
      this.updateSettings(defaultSettings)
    },
  },
})

