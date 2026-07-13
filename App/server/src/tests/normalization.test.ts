import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calculatePaceSecondsPerKm, estimateOneRepMaxKg } from '../utils/numbers.js'
import { parseImportFiles } from '../modules/imports/zeppParser.js'
import { normalizeParsedFiles } from '../modules/imports/zeppNormalizer.js'

describe('normalization utilities', () => {
  it('calculates pace in seconds per kilometre', () => {
    assert.equal(calculatePaceSecondsPerKm(1800, 5000), 360)
    assert.equal(calculatePaceSecondsPerKm(undefined, undefined, 2.5), 400)
  })

  it('estimates one repetition maximum with the Epley formula', () => {
    assert.equal(estimateOneRepMaxKg(100, 5), 116.7)
  })

  it('parses and normalizes Zepp sport CSV rows without guessing unknown sport codes', () => {
    const parsed = parseImportFiles([
      {
        fileName: 'SPORT/SPORT_test.csv',
        content: [
          'type,startTime,sportTime(s),distance(m),avgPace(/meter),calories(kcal)',
          '1,2026-07-07 10:00:00+0000,1800,5000,2.77,320.4',
          '999,2026-07-08 10:00:00+0000,1200,1000,1.5,100',
        ].join('\n'),
      },
    ])
    const normalized = normalizeParsedFiles(parsed)

    assert.equal(normalized.workouts[0].sport, 'running')
    assert.equal(normalized.workouts[0].runningMetrics?.paceSecondsPerKm, 360)
    assert.equal(normalized.workouts[0].calories, 320.4)
    assert.equal(normalized.workouts[1].sport, 'unknown')
    assert.deepEqual(normalized.unknownSportCodes, ['999'])
  })

  it('ignores non-workout Zepp files during normalization', () => {
    const parsed = parseImportFiles([
      {
        fileName: 'ACTIVITY/ACTIVITY_test.csv',
        content: 'date,steps,runDistance\n2026-07-07,1200,600',
      },
    ])
    const normalized = normalizeParsedFiles(parsed)

    assert.equal(parsed[0].category, 'ignored')
    assert.equal(normalized.workouts.length, 0)
    assert.match(normalized.errors[0]?.message ?? '', /Ignored non-workout Zepp file/)
  })
})
