import { expect, test } from '@playwright/test'

test('imports Zepp workout data through mocked backend APIs, enriches a workout, and reloads from the API', async ({ page }) => {
  let imported = false
  let enriched = false

  const workout = {
    id: 'workout-running-1',
    source: 'zepp',
    sport: 'running',
    started_at: '2026-07-07T10:00:00.000Z',
    date: '2026-07-07',
    duration_seconds: 2520,
    distance_meters: 7200,
    calories: 420,
    average_heart_rate: 150,
    max_heart_rate: 178,
    source_sport_code: '1',
    source_row_fingerprint: 'run-fingerprint-1',
  }

  const workoutDetail = () => ({
    workout,
    objectiveMetrics: {
      running: {
        workout_id: workout.id,
        distance_meters: 7200,
        pace_seconds_per_km: 350,
      },
      strength: null,
      basketball: null,
    },
    journal: {
      running: enriched
        ? {
            workout_id: workout.id,
            training_purpose: 'zone2',
            perceived_effort: 6,
            perceived_performance: 7,
            route_type: 'road',
            notes: 'Controlled aerobic work.',
            updated_at: '2026-07-07T11:00:00.000Z',
          }
        : null,
      strength: null,
      basketball: null,
    },
    journalStatus: enriched
      ? { status: 'completed', missingFields: [] }
      : { status: 'needs_enrichment', missingFields: ['training purpose', 'perceived effort', 'perceived performance'] },
  })

  await page.route('**/api/imports/preview', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          previewId: 'preview-1',
          expiresAt: '2026-07-07T12:00:00.000Z',
          files: [{ fileName: 'SPORT.csv', category: 'workout', rowCount: 1, validRowCount: 1, invalidRowCount: 0 }],
          duplicateCount: 0,
          detectedWorkoutRows: 1,
          validWorkoutRows: 1,
          invalidWorkoutRows: 0,
          duplicateWorkoutRows: 0,
          savedWorkoutRows: 1,
          detectedRecordCounts: { running: 1, strength: 0, basketball: 0, unknownWorkouts: 0 },
          unknownSportCodes: [],
          ignoredFiles: [],
          warnings: [],
          sampleRecords: { workouts: [workout] },
          estimatedRecordsToSave: { workouts: 1 },
          errors: [],
        },
      }),
    })
  })

  await page.route('**/api/imports/confirm', async (route) => {
    imported = true
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          importBatchId: 'import-1',
          detectedWorkoutRows: 1,
          validWorkoutRows: 1,
          duplicateWorkoutRows: 0,
          savedWorkoutRows: 1,
          savedWorkouts: 1,
          duplicateCount: 0,
          errorCount: 0,
        },
      }),
    })
  })

  await page.route('**/api/imports', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: imported
          ? [
              {
                id: 'import-1',
                file_name: 'SPORT.csv',
                imported_at: '2026-07-07T12:00:00.000Z',
                detected_workouts_count: 1,
                saved_workouts_count: 1,
                duplicate_count: 0,
                error_count: 0,
              },
            ]
          : [],
      }),
    })
  })

  await page.route('**/api/workouts?**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: imported ? [workout] : [] }),
    })
  })

  await page.route('**/api/workouts/workout-running-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: workoutDetail() }),
    })
  })

  await page.route('**/api/workouts/workout-running-1/running-journal', async (route) => {
    enriched = true
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { ok: true } }) })
  })

  await page.route('**/api/performance/records', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { records: [] } }) })
  })

  await page.route('**/api/weekly-reviews/current', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'week-1',
          week_start: '2026-07-06',
          week_end: '2026-07-12',
          generated_summary: 'This week had 1 imported workout.',
          running_reflection: 'Running appeared 1 time.',
          strength_reflection: 'No strength sessions appeared this week.',
          basketball_reflection: 'No basketball sessions appeared this week.',
          consistency_reflection: 'Consistency was light based on imported workouts.',
          lessons_learned: ['Review the Workout Inbox before drawing conclusions from the week.'],
          suggested_focus: 'Complete missing journal entries.',
        },
      }),
    })
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByText('Import Zepp workout data to start')).toBeVisible()

  await page.getByRole('link', { name: /Import Zepp Workouts/ }).first().click()
  await page.getByRole('button', { name: 'Load sample export' }).click()
  await expect(page.getByText('Import preview')).toBeVisible()
  await expect(page.getByText('1 workouts ready')).toBeVisible()

  await page.getByRole('button', { name: 'Save import' }).click()
  await expect(page.getByText(/Imported 1 workouts/)).toBeVisible()

  await page.getByRole('link', { name: /^Workout Inbox$/ }).first().click()
  await expect(page.getByText('Needs enrichment').first()).toBeVisible()
  await page.getByRole('link', { name: /Open running workout/ }).first().click()
  await expect(page.getByRole('heading', { name: 'Objective Zepp Data' })).toBeVisible()
  await expect(page.getByText('7.2 km')).toBeVisible()

  await page.getByLabel('Training purpose').selectOption('zone2')
  await page.getByLabel('Perceived effort').fill('6')
  await page.getByLabel('Perceived performance').fill('7')
  await page.getByLabel('Journal notes').fill('Controlled aerobic work.')
  await page.getByRole('button', { name: 'Save journal' }).click()
  await expect(page.getByText('Running details saved.')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Completed')).toBeVisible()
  await expect(page.getByLabel('Journal notes')).toHaveValue('Controlled aerobic work.')
})
