import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { basketballJournalStatus, runningJournalStatus, strengthJournalStatus } from '../utils/workoutJournalStatus.js'

describe('workoutJournalStatus', () => {
  it('marks untouched running workouts as needing enrichment', () => {
    assert.deepEqual(runningJournalStatus(), {
      status: 'needs_enrichment',
      missingFields: ['training purpose', 'perceived effort', 'perceived performance'],
    })
  })

  it('marks completed running journals as completed', () => {
    assert.equal(
      runningJournalStatus({
        trainingPurpose: 'zone2',
        perceivedEffort: 5,
        perceivedPerformance: 7,
      }).status,
      'completed',
    )
  })

  it('marks valid strength sets as complete even when RPE is absent', () => {
    assert.equal(
      strengthJournalStatus({
        exercises: [{ name: 'Back squat', sets: [{ setNumber: 1, reps: 5, weightKg: 100 }] }],
      }).status,
      'completed',
    )
  })

  it('requires qualitative basketball context', () => {
    assert.equal(
      basketballJournalStatus({
        sessionType: 'pickup',
        perceivedPerformance: 8,
        perceivedEffort: 7,
        energy: 8,
        shooting: 6,
        defense: 7,
        role: 'facilitator',
      }).status,
      'completed',
    )
  })
})
