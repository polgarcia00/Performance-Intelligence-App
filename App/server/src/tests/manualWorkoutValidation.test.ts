import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AppError } from '../middleware/errors.js'
import { parseManualWorkoutInput } from '../validation/manualWorkout.js'

describe('manual workout validation', () => {
  it('normalizes supported objective fields without accepting a source override', () => {
    const workout = parseManualWorkoutInput({
      sport: 'running',
      source: 'zepp',
      startedAt: '2026-07-13T10:00:00Z',
      durationSeconds: '1800',
      distanceMeters: '5000',
      calories: 452.7,
      averageHeartRate: 145,
      maxHeartRate: 172,
    })

    assert.deepEqual(workout, {
      sport: 'running',
      startedAt: '2026-07-13T10:00:00Z',
      date: '2026-07-13',
      durationSeconds: 1800,
      distanceMeters: 5000,
      calories: 452.7,
      averageHeartRate: 145,
      maxHeartRate: 172,
    })
  })

  it('returns field errors for unsupported or unreasonable values', () => {
    assert.throws(
      () => parseManualWorkoutInput({
        sport: 'cycling',
        startedAt: 'not-a-date',
        durationSeconds: 0,
        calories: -1,
        averageHeartRate: 240,
      }),
      (error: unknown) => {
        if (!(error instanceof AppError)) return false
        assert.equal(error.statusCode, 422)
        assert.ok(error.fieldErrors?.sport)
        assert.ok(error.fieldErrors?.startedAt)
        assert.ok(error.fieldErrors?.durationSeconds)
        assert.ok(error.fieldErrors?.calories)
        assert.ok(error.fieldErrors?.averageHeartRate)
        return true
      },
    )
  })
})
