import { describe, expect, it } from 'vitest'
import { normalizeImportRows } from '@/utils/dataNormalizer'
import { parseZeppImport } from '@/utils/zeppImportParser'
import { createMockZeppExport } from '@/services/mockDataService'

describe('dataNormalizer', () => {
  it('normalizes Zepp-like rows into internal workout data', () => {
    const parsed = parseZeppImport(createMockZeppExport())
    const normalized = normalizeImportRows(parsed.rows)

    expect(normalized.data.workouts.length).toBeGreaterThan(0)
    expect(normalized.data.runningSessions.length).toBeGreaterThan(0)
    expect(normalized.data.basketballSessions.length).toBeGreaterThan(0)
    expect(normalized.data.strengthSessions.length).toBeGreaterThan(0)
  })
})
