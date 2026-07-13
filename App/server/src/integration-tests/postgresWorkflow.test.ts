import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import {
  createPostgresTestHarness,
  getPostgresIntegrationSetupError,
  type PostgresTestHarness,
} from './helpers/postgresTestDatabase.js'
import { getWeekRange } from '../utils/dates.js'

const setupError = getPostgresIntegrationSetupError()

if (setupError) {
  describe('PostgreSQL integration configuration', () => {
    it('requires a safe TEST_DATABASE_URL', () => {
      assert.fail(setupError)
    })
  })
} else {
  describe('PostgreSQL API workflow', () => {
    let harness: PostgresTestHarness

    before(async () => {
      harness = await createPostgresTestHarness()
    })

    beforeEach(async () => {
      await harness.resetDatabase()
    })

    after(async () => {
      if (harness) await harness.close()
    })

    it('runs migrations and leaves a workout-journal schema without health-context tables', async () => {
      const healthTables = await harness.query(
        `
        select table_name
        from information_schema.tables
        where table_schema = 'public'
          and table_name = any($1)
        order by table_name
        `,
        [['daily_activity_records', 'sleep_records', 'heart_rate_records', 'daily_heart_rate_summaries', 'health_context', 'recovery_metrics', 'readiness_scores']],
      )
      assert.deepEqual(healthTables.rows, [])

      const requiredTables = await harness.query(
        `
        select table_name
        from information_schema.tables
        where table_schema = 'public'
          and table_name = any($1)
        `,
        [[
          'users',
          'import_batches',
          'import_files',
          'import_errors',
          'workouts',
          'running_workout_metrics',
          'strength_workout_metrics',
          'basketball_workout_metrics',
          'running_journal_entries',
          'strength_journal_entries',
          'strength_exercises',
          'strength_sets',
          'basketball_journal_entries',
          'weekly_reviews',
          'insights',
          'personal_records',
        ]],
      )
      assert.equal(requiredTables.rows.length, 16)

      const healthColumns = await harness.query(
        `
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'import_batches'
          and column_name = any($1)
        `,
        [['detected_sleep_count', 'detected_heart_rate_count', 'detected_activity_count']],
      )
      assert.deepEqual(healthColumns.rows, [])
    })

    it('imports workout-only Zepp data, skips duplicates, and preserves unknown sport codes in preview', async () => {
      const sportCsv = workoutCsv()
      const preview = await previewImport([
        { fileName: 'SPORT.csv', content: sportCsv },
        { fileName: 'SLEEP.csv', content: ['date,deepSleepTime,REMTime', '2026-07-07,120,40'].join('\n') },
      ])

      assert.equal(preview.detectedWorkoutRows, 4)
      assert.equal(preview.validWorkoutRows, 3)
      assert.equal(preview.invalidWorkoutRows, 0)
      assert.equal(preview.duplicateWorkoutRows, 0)
      assert.equal(preview.savedWorkoutRows, 3)
      assert.equal(preview.detectedRecordCounts.running, 1)
      assert.equal(preview.detectedRecordCounts.strength, 1)
      assert.equal(preview.detectedRecordCounts.basketball, 1)
      assert.equal(preview.detectedRecordCounts.sleep, undefined)
      assert.deepEqual(preview.unknownSportCodes, ['999'])
      assert.deepEqual(preview.ignoredFiles, ['SLEEP.csv'])
      assert.match(preview.warnings[0], /Ignored non-workout Zepp file/)

      const importResult = await confirmImport(preview.previewId)
      assert.equal(importResult.detectedWorkoutRows, 4)
      assert.equal(importResult.validWorkoutRows, 3)
      assert.equal(importResult.savedWorkoutRows, 3)
      assert.equal(importResult.duplicateWorkoutRows, 0)

      const importsResponse = await harness.request(harness.app).get('/api/imports').expect(200)
      assert.equal(importsResponse.body.data[0].detected_sleep_count, undefined)
      assert.equal(importsResponse.body.data[0].saved_workouts_count, 3)

      const importDetailResponse = await harness.request(harness.app).get(`/api/imports/${importResult.importBatchId}`).expect(200)
      assert.equal(importDetailResponse.body.data.files.length, 2)
      assert.equal(importDetailResponse.body.data.errors.length, 1)

      const duplicatePreview = await previewImport([{ fileName: 'SPORT.csv', content: sportCsv }])
      assert.equal(duplicatePreview.duplicateWorkoutRows, 3)
      assert.equal(duplicatePreview.savedWorkoutRows, 0)

      const duplicateImportResult = await confirmImport(duplicatePreview.previewId)
      assert.equal(duplicateImportResult.savedWorkoutRows, 0)
      assert.equal(duplicateImportResult.duplicateWorkoutRows, 3)
    })

    it('retrieves workouts with filters and keeps journal updates separate from objective workout data', async () => {
      await importWorkoutCsv()

      const allWorkoutsResponse = await harness.request(harness.app).get('/api/workouts').expect(200)
      assert.equal(allWorkoutsResponse.body.data.length, 3)
      assert.ok(allWorkoutsResponse.body.data.every((workout: any) => workout.source === 'zepp'))

      const runningFilterResponse = await harness.request(harness.app).get('/api/workouts?sport=running').expect(200)
      assert.equal(runningFilterResponse.body.data.length, 1)
      assert.equal(runningFilterResponse.body.data[0].sport, 'running')

      const dateFilterResponse = await harness.request(harness.app).get('/api/workouts?from=2026-07-08&to=2026-07-09').expect(200)
      assert.equal(dateFilterResponse.body.data.length, 2)

      const inboxResponse = await harness.request(harness.app).get('/api/workouts/inbox').expect(200)
      assert.equal(inboxResponse.body.data.length, 3)
      assert.ok(inboxResponse.body.data.every((workout: any) => workout.journalStatus.status === 'needs_enrichment'))

      const bySport = Object.fromEntries(allWorkoutsResponse.body.data.map((workout: any) => [workout.sport, workout]))
      const runningWorkout = bySport.running
      const strengthWorkout = bySport.strength
      const basketballWorkout = bySport.basketball

      const runningBeforeResponse = await harness.request(harness.app).get(`/api/workouts/${runningWorkout.id}`).expect(200)
      const runningObjectiveBefore = runningBeforeResponse.body.data.workout

      await harness.request(harness.app)
        .put(`/api/workouts/${runningWorkout.id}/running-journal`)
        .send({
          trainingPurpose: 'zone2',
          perceivedEffort: 6,
          perceivedPerformance: 8,
          routeType: 'road',
          notes: 'Felt controlled and repeatable.',
        })
        .expect(200)

      await harness.request(harness.app)
        .put(`/api/workouts/${strengthWorkout.id}/strength-journal`)
        .send({
          sessionType: 'lower',
          notes: 'Solid squat session.',
          exercises: [
            {
              name: 'Back squat',
              muscleGroup: 'Legs',
              sets: [
                { setNumber: 1, reps: 5, weightKg: 80, rpe: 7 },
                { setNumber: 2, reps: 5, weightKg: 82.5, rpe: 8 },
              ],
            },
          ],
        })
        .expect(200)

      await harness.request(harness.app)
        .put(`/api/workouts/${basketballWorkout.id}/basketball-journal`)
        .send({
          sessionType: 'pickup',
          perceivedPerformance: 8,
          perceivedEffort: 8,
          energy: 7,
          explosiveness: 8,
          shooting: 7,
          defense: 8,
          role: 'balanced',
          notes: 'Good pace and defensive focus.',
        })
        .expect(200)

      const runningAfterResponse = await harness.request(harness.app).get(`/api/workouts/${runningWorkout.id}`).expect(200)
      const runningAfter = runningAfterResponse.body.data
      assert.equal(Number(runningAfter.workout.duration_seconds), Number(runningObjectiveBefore.duration_seconds))
      assert.equal(Number(runningAfter.workout.distance_meters), Number(runningObjectiveBefore.distance_meters))
      assert.equal(Number(runningAfter.workout.calories), Number(runningObjectiveBefore.calories))
      assert.equal(Number(runningAfter.workout.average_heart_rate), Number(runningObjectiveBefore.average_heart_rate))
      assert.equal(runningAfter.workout.source_sport_code, runningObjectiveBefore.source_sport_code)
      assert.equal(runningAfter.workout.source_row_fingerprint, runningObjectiveBefore.source_row_fingerprint)
      assert.equal(runningAfter.workout.import_batch_id, runningObjectiveBefore.import_batch_id)
      assert.equal(runningAfter.journal.running.training_purpose, 'zone2')
      assert.equal(runningAfter.journalStatus.status, 'completed')

      const completedResponse = await harness.request(harness.app).get('/api/workouts?status=completed').expect(200)
      assert.equal(completedResponse.body.data.length, 3)
    })

    it('persists manual workouts for every supported sport and analyzes them after enrichment', async () => {
      const week = getWeekRange()
      const dateForDay = (dayOffset: number) => {
        const date = new Date(`${week.weekStart}T00:00:00Z`)
        date.setUTCDate(date.getUTCDate() + dayOffset)
        return date.toISOString().slice(0, 10)
      }

      const runningResponse = await harness.request(harness.app)
        .post('/api/workouts/manual')
        .send({
          sport: 'running',
          startedAt: `${dateForDay(0)}T07:00:00Z`,
          durationSeconds: 1800,
          distanceMeters: 5000,
          calories: 452,
          averageHeartRate: 145,
          maxHeartRate: 172,
        })
        .expect(201)
      const strengthResponse = await harness.request(harness.app)
        .post('/api/workouts/manual')
        .send({
          sport: 'strength',
          startedAt: `${dateForDay(1)}T17:00:00Z`,
          durationSeconds: 2700,
          calories: 330,
          averageHeartRate: 112,
        })
        .expect(201)
      const basketballResponse = await harness.request(harness.app)
        .post('/api/workouts/manual')
        .send({
          sport: 'basketball',
          startedAt: `${dateForDay(2)}T18:30:00Z`,
          durationSeconds: 4200,
          calories: 640,
          averageHeartRate: 153,
          maxHeartRate: 186,
        })
        .expect(201)

      const details = [runningResponse.body.data, strengthResponse.body.data, basketballResponse.body.data]
      assert.ok(details.every((detail: any) => detail.workout.source === 'manual'))
      assert.ok(details.every((detail: any) => detail.workout.import_batch_id === null))
      assert.ok(details.every((detail: any) => detail.workout.source_sport_code === null))
      assert.ok(details.every((detail: any) => detail.workout.source_row_fingerprint === null))
      assert.ok(details.every((detail: any) => detail.journalStatus.status === 'needs_enrichment'))
      assert.equal(Number(runningResponse.body.data.objectiveMetrics.running.pace_seconds_per_km), 360)
      assert.equal(Number(strengthResponse.body.data.objectiveMetrics.strength.detected_duration_seconds), 2700)
      assert.equal(Number(basketballResponse.body.data.objectiveMetrics.basketball.court_time_seconds), 4200)

      const workoutList = (await harness.request(harness.app).get('/api/workouts').expect(200)).body.data
      assert.equal(workoutList.length, 3)
      assert.ok(workoutList.every((workout: any) => workout.source === 'manual'))

      const inbox = (await harness.request(harness.app).get('/api/workouts/inbox').expect(200)).body.data
      assert.equal(inbox.length, 3)

      const runningId = runningResponse.body.data.workout.id
      const strengthId = strengthResponse.body.data.workout.id
      const basketballId = basketballResponse.body.data.workout.id
      const runningObjectiveBefore = runningResponse.body.data.workout

      await harness.request(harness.app)
        .put(`/api/workouts/${runningId}/running-journal`)
        .send({ trainingPurpose: 'zone2', perceivedEffort: 6, perceivedPerformance: 8, notes: 'Controlled run.' })
        .expect(200)
      await harness.request(harness.app)
        .put(`/api/workouts/${strengthId}/strength-journal`)
        .send({
          sessionType: 'lower',
          exercises: [{ name: 'Back squat', muscleGroup: 'Legs', sets: [{ setNumber: 1, reps: 5, weightKg: 80, rpe: 7 }] }],
        })
        .expect(200)
      await harness.request(harness.app)
        .put(`/api/workouts/${basketballId}/basketball-journal`)
        .send({ sessionType: 'pickup', perceivedPerformance: 8, perceivedEffort: 8, energy: 7, shooting: 7, defense: 8, role: 'balanced' })
        .expect(200)

      const runningAfter = (await harness.request(harness.app).get(`/api/workouts/${runningId}`).expect(200)).body.data
      assert.equal(runningAfter.workout.source, 'manual')
      assert.equal(Number(runningAfter.workout.duration_seconds), Number(runningObjectiveBefore.duration_seconds))
      assert.equal(Number(runningAfter.workout.distance_meters), Number(runningObjectiveBefore.distance_meters))
      assert.equal(Number(runningAfter.workout.calories), Number(runningObjectiveBefore.calories))
      assert.equal(Number(runningAfter.workout.average_heart_rate), Number(runningObjectiveBefore.average_heart_rate))
      assert.equal(runningAfter.journalStatus.status, 'completed')

      const completed = (await harness.request(harness.app).get('/api/workouts?status=completed').expect(200)).body.data
      assert.equal(completed.length, 3)
      assert.equal((await harness.request(harness.app).get('/api/performance/running').expect(200)).body.data.sessions.length, 1)
      assert.equal((await harness.request(harness.app).get('/api/performance/strength').expect(200)).body.data.sets.length, 1)
      assert.equal((await harness.request(harness.app).get('/api/performance/basketball').expect(200)).body.data.summary.sessionCount, 1)

      const dashboard = await harness.request(harness.app).get('/api/dashboard/summary').expect(200)
      assert.equal(dashboard.body.data.whatHappened.workoutCount, 3)

      const weeklyReview = await harness.request(harness.app).get(`/api/weekly-reviews/${week.weekStart}`).expect(200)
      assert.match(weeklyReview.body.data.generated_summary, /3 workouts/)
    })

    it('rejects invalid manual workout payloads with field-level validation errors', async () => {
      const response = await harness.request(harness.app)
        .post('/api/workouts/manual')
        .send({
          sport: 'running',
          startedAt: 'not-a-date',
          durationSeconds: 0,
          distanceMeters: -1,
          calories: -1,
          averageHeartRate: 230,
        })
        .expect(422)

      assert.equal(response.body.error.code, 'validation_failed')
      assert.ok(response.body.error.fieldErrors.startedAt)
      assert.ok(response.body.error.fieldErrors.durationSeconds)
      assert.ok(response.body.error.fieldErrors.distanceMeters)
      assert.ok(response.body.error.fieldErrors.calories)
      assert.ok(response.body.error.fieldErrors.averageHeartRate)
    })

    it('exposes backend-owned dashboard, performance, records, and weekly review endpoints', async () => {
      await importWorkoutCsv()
      const workouts = (await harness.request(harness.app).get('/api/workouts').expect(200)).body.data
      const bySport = Object.fromEntries(workouts.map((workout: any) => [workout.sport, workout]))

      await harness.request(harness.app)
        .put(`/api/workouts/${bySport.running.id}/running-journal`)
        .send({ trainingPurpose: 'zone2', perceivedEffort: 6, perceivedPerformance: 8 })
        .expect(200)
      await harness.request(harness.app)
        .put(`/api/workouts/${bySport.strength.id}/strength-journal`)
        .send({
          sessionType: 'lower',
          exercises: [{ name: 'Back squat', muscleGroup: 'Legs', sets: [{ setNumber: 1, reps: 5, weightKg: 82.5, rpe: 8 }] }],
        })
        .expect(200)
      await harness.request(harness.app)
        .put(`/api/workouts/${bySport.basketball.id}/basketball-journal`)
        .send({ sessionType: 'pickup', perceivedPerformance: 8, perceivedEffort: 8, energy: 7, shooting: 7, defense: 8, role: 'balanced' })
        .expect(200)

      await harness.request(harness.app).get('/api/health').expect(200)

      const dashboardResponse = await harness.request(harness.app).get('/api/dashboard/summary').expect(200)
      assert.ok('whatHappened' in dashboardResponse.body.data)
      assert.ok('needsAttention' in dashboardResponse.body.data)

      const runningPerformance = await harness.request(harness.app).get('/api/performance/running').expect(200)
      assert.equal(runningPerformance.body.data.sessions.length, 1)
      assert.equal(runningPerformance.body.data.groupedByTrainingPurpose[0].trainingPurpose, 'zone2')

      const strengthPerformance = await harness.request(harness.app).get('/api/performance/strength').expect(200)
      assert.equal(strengthPerformance.body.data.summary.totalVolumeKg, 412.5)
      assert.equal(strengthPerformance.body.data.exerciseVolume[0].exerciseName, 'Back squat')

      const basketballPerformance = await harness.request(harness.app).get('/api/performance/basketball').expect(200)
      assert.equal(basketballPerformance.body.data.summary.sessionCount, 1)
      assert.equal(basketballPerformance.body.data.summary.averagePerformance, 8)

      const recordsResponse = await harness.request(harness.app).get('/api/performance/records').expect(200)
      assert.ok(recordsResponse.body.data.records.length > 0)

      await harness.request(harness.app).get('/api/performance/trends').expect(200)
      await harness.request(harness.app).get('/api/weekly-reviews/current').expect(200)

      const weeklyReviewResponse = await harness.request(harness.app).get('/api/weekly-reviews/2026-07-06').expect(200)
      assert.match(weeklyReviewResponse.body.data.generated_summary, /workouts/)

      const savedWeeklyReviewResponse = await harness.request(harness.app)
        .post('/api/weekly-reviews/2026-07-06')
        .send({ userNotes: 'Zone 2 felt productive this week.' })
        .expect(201)

      const updatedWeeklyReviewResponse = await harness.request(harness.app)
        .put(`/api/weekly-reviews/${savedWeeklyReviewResponse.body.data.id}`)
        .send({ userNotes: 'Keep one controlled aerobic run next week.' })
        .expect(200)

      assert.equal(updatedWeeklyReviewResponse.body.data.user_notes, 'Keep one controlled aerobic run next week.')
    })

    async function previewImport(files: Array<{ fileName: string; content: string }>) {
      const response = await harness.request(harness.app).post('/api/imports/preview').send({ files }).expect(200)
      return response.body.data
    }

    async function confirmImport(previewId: string) {
      const response = await harness.request(harness.app).post('/api/imports/confirm').send({ previewId }).expect(201)
      return response.body.data
    }

    async function importWorkoutCsv() {
      const preview = await previewImport([{ fileName: 'SPORT.csv', content: workoutCsv() }])
      return confirmImport(preview.previewId)
    }
  })
}

function workoutCsv(): string {
  return [
    'type,startTime,sportTime(s),distance(m),avgPace(/meter),calories(kcal),avgHeartRate,maxHeartRate',
    '1,2026-07-07T10:00:00Z,1800,5000,2.7777777778,452.7,151.4,178.2',
    '52,2026-07-08T17:00:00Z,3600,0,0,330,112,151',
    '85,2026-07-09T18:30:00Z,4200,0,0,640,153,186',
    '999,2026-07-10T18:30:00Z,1200,800,0,110,120,140',
  ].join('\n')
}
