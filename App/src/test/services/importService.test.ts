import { describe, expect, it } from 'vitest'
import { createMockZeppExportFiles } from '@/services/mockDataService'
import {
  createImportPreview,
  createImportPreviewFromFiles,
  detectImportDuplicates,
  removeDuplicateImportData,
} from '@/services/importService'

describe('importService', () => {
  it('creates import previews with summaries and normalized data', () => {
    const preview = createImportPreviewFromFiles(createMockZeppExportFiles())

    expect(preview.summary.running).toBeGreaterThan(0)
    expect(preview.ignoredFiles).toEqual([])
    expect(preview.sourceFiles.some((file) => file.category === 'workout')).toBe(true)
    expect(preview.workoutTypeCounts.find((item) => item.code === '85')?.mappedType).toBe('basketball')
    expect(preview.normalized.workouts.length).toBeGreaterThan(0)
    expect(preview.normalized.runningEnrichments[0]?.goal).toBeUndefined()
    expect(preview.normalized.strengthEnrichments[0]?.exercises).toEqual([])
    expect(preview.normalized.basketballEnrichments[0]?.perceivedPerformance).toBeUndefined()
    expect(preview.normalized.unknownWorkouts[0]?.typeCode).toBe('999')
  })

  it('detects duplicates and removes them from normalized data', () => {
    const preview = createImportPreviewFromFiles(createMockZeppExportFiles())
    const duplicates = detectImportDuplicates(
      preview.normalized,
      [preview.normalized.workouts[0]!],
    )
    const deduped = removeDuplicateImportData(preview.normalized, duplicates)

    expect(duplicates.length).toBeGreaterThanOrEqual(1)
    expect(deduped.workouts.length).toBeLessThan(preview.normalized.workouts.length)
  })

  it('ignores single non-workout Zepp files', () => {
    const activityFile = {
      fileName: 'ACTIVITY/ACTIVITY_sample.csv',
      content: ['date,steps,distance,runDistance,calories', '2026-07-06,9842,7200,6300,460'].join('\n'),
    }
    const preview = createImportPreview(activityFile.content, activityFile.fileName)

    expect(preview.ignoredFiles).toContain(activityFile.fileName)
    expect(preview.normalized.workouts).toHaveLength(0)
  })
})
