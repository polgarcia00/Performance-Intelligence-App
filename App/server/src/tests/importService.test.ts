import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ImportService } from '../modules/imports/importService.js'

describe('ImportService', () => {
  it('returns a lightweight preview without leaking normalized confirmation state', async () => {
    const repository = {
      findDuplicateWorkoutFingerprints: async () => new Set<string>(),
    }
    const runInTransaction = async (handler: (client: unknown) => Promise<unknown>) => handler({})
    const service = new ImportService(repository as any, runInTransaction as any)

    const preview = await service.previewImport(
      [
        {
          fileName: 'workouts.csv',
          content:
            'type,startTime,sportTime(s),distance(m),calories,avgHR,maxHR\n1,2026-07-07T10:00:00.000Z,1800,5000,320,150,178',
        },
      ],
      'user-1',
    )

    assert.equal(preview.files[0].category, 'workout')
    assert.equal(preview.estimatedRecordsToSave.workouts, 1)
    assert.equal(preview.savedWorkoutRows, 1)
    assert.equal('normalized' in (preview as any), false)
    assert.equal('parsedFiles' in (preview as any), false)
  })

  it('ignores non-workout Zepp files without adding health categories to the preview', async () => {
    const repository = {
      findDuplicateWorkoutFingerprints: async () => new Set<string>(),
    }
    const runInTransaction = async (handler: (client: unknown) => Promise<unknown>) => handler({})
    const service = new ImportService(repository as any, runInTransaction as any)

    const preview = await service.previewImport(
      [
        {
          fileName: 'SLEEP/SLEEP_test.csv',
          content: 'date,deepSleepTime,REMTime\n2026-07-07,120,40',
        },
      ],
      'user-1',
    )

    assert.equal(preview.detectedWorkoutRows, 0)
    assert.deepEqual(preview.ignoredFiles, ['SLEEP/SLEEP_test.csv'])
    assert.equal('activity' in preview.detectedRecordCounts, false)
    assert.equal('sleep' in preview.detectedRecordCounts, false)
    assert.equal('heartRate' in preview.detectedRecordCounts, false)
    assert.match(preview.warnings[0], /Ignored non-workout Zepp file/)
  })
})
