import { computed, ref } from 'vue'
import type { DateRange } from '@/utils/dateRanges'
import { getPreviousRange, getRecentRange, getWeekRange } from '@/utils/dateRanges'

export type DateRangePreset = 'week' | 'last28' | 'previous28'

export function useDateRange(initialPreset: DateRangePreset = 'last28') {
  const selectedPreset = ref<DateRangePreset>(initialPreset)

  const range = computed<DateRange>(() => {
    if (selectedPreset.value === 'week') return getWeekRange()
    if (selectedPreset.value === 'previous28') return getPreviousRange()
    return getRecentRange()
  })

  const options = [
    { label: 'This week', value: 'week' },
    { label: 'Last 28 days', value: 'last28' },
    { label: 'Previous 28 days', value: 'previous28' },
  ] as const

  return {
    selectedPreset,
    range,
    options,
  }
}

