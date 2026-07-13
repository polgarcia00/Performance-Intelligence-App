import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import {
  createPostgresTestHarness,
  getPostgresIntegrationSetupError,
  type PostgresTestHarness,
} from './helpers/postgresTestDatabase.js'

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
      assert.match(weeklyReviewResponse.body.data.generated_summary, /imported workouts/)

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
