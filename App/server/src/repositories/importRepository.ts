import type {
  ImportErrorRecord,
  NormalizedWorkout,
  ParsedImportFile,
} from '../types/domain.js'

export class ImportRepository {
  async findDuplicateWorkoutFingerprints(client: any, userId: string, fingerprints: string[]): Promise<Set<string>> {
    if (!fingerprints.length) return new Set()
    const result = await client.query(
      'select source_row_fingerprint from workouts where user_id = $1 and source = $2 and source_row_fingerprint = any($3)',
      [userId, 'zepp', fingerprints],
    )
    return new Set(result.rows.map((row: any) => row.source_row_fingerprint))
  }

  async createBatch(client: any, input: {
    userId: string
    fileName: string
    detectedWorkoutsCount: number
    savedWorkoutsCount: number
    duplicateCount: number
    errorCount: number
  }): Promise<string> {
    const result = await client.query(
      `
      insert into import_batches (
        user_id, source, file_name, status, detected_workouts_count, saved_workouts_count, duplicate_count, error_count
      )
      values ($1, 'zepp', $2, 'confirmed', $3, $4, $5, $6)
      returning id
      `,
      [
        input.userId,
        input.fileName,
        input.detectedWorkoutsCount,
        input.savedWorkoutsCount,
        input.duplicateCount,
        input.errorCount,
      ],
    )
    return result.rows[0].id
  }

  async insertFiles(client: any, importBatchId: string, files: ParsedImportFile[]): Promise<void> {
    for (const file of files) {
      await client.query(
        `
        insert into import_files (import_batch_id, file_name, file_category, row_count, status, fingerprint)
        values ($1, $2, $3, $4, $5, $6)
        `,
        [importBatchId, file.fileName, file.category, file.rowCount, file.errors.some((error) => error.severity === 'error') ? 'error' : 'parsed', file.fingerprint],
      )
    }
  }

  async insertErrors(client: any, importBatchId: string, errors: ImportErrorRecord[]): Promise<void> {
    for (const error of errors) {
      await client.query(
        `
        insert into import_errors (import_batch_id, file_name, row_number, severity, message, raw_payload)
        values ($1, $2, $3, $4, $5, $6)
        `,
        [importBatchId, error.fileName, error.rowNumber, error.severity, error.message, JSON.stringify(error.rawPayload ?? null)],
      )
    }
  }

  async insertWorkout(client: any, userId: string, importBatchId: string, workout: NormalizedWorkout): Promise<string> {
    const result = await client.query(
      `
      insert into workouts (
        user_id, import_batch_id, source, sport, source_workout_id, source_sport_code, source_row_fingerprint,
        started_at, date, duration_seconds, distance_meters, calories, average_heart_rate, max_heart_rate,
        training_load, raw_summary
      )
      values ($1, $2, 'zepp', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      returning id
      `,
      [
        userId,
        importBatchId,
        workout.sport,
        workout.sourceWorkoutId,
        workout.sourceSportCode,
        workout.sourceRowFingerprint,
        workout.startedAt,
        workout.date,
        workout.durationSeconds,
        workout.distanceMeters,
        workout.calories,
        workout.averageHeartRate,
        workout.maxHeartRate,
        workout.trainingLoad,
        JSON.stringify(workout.rawSummary),
      ],
    )
    return result.rows[0].id
  }

  async insertWorkoutMetrics(client: any, workoutId: string, workout: NormalizedWorkout): Promise<void> {
    if (workout.runningMetrics) {
      const metrics = workout.runningMetrics
      await client.query(
        `
        insert into running_workout_metrics (
          workout_id, distance_meters, pace_seconds_per_km, average_speed_mps, minimum_speed_mps,
          maximum_speed_mps, cadence, vo2_max
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [workoutId, metrics.distanceMeters, metrics.paceSecondsPerKm, metrics.averageSpeedMps, metrics.minimumSpeedMps, metrics.maximumSpeedMps, metrics.cadence, metrics.vo2Max],
      )
    }

    if (workout.strengthMetrics) {
      const metrics = workout.strengthMetrics
      await client.query(
        `
        insert into strength_workout_metrics (workout_id, detected_duration_seconds, detected_calories, detected_average_heart_rate)
        values ($1, $2, $3, $4)
        `,
        [workoutId, metrics.detectedDurationSeconds, metrics.detectedCalories, metrics.detectedAverageHeartRate],
      )
    }

    if (workout.basketballMetrics) {
      const metrics = workout.basketballMetrics
      await client.query(
        `
        insert into basketball_workout_metrics (workout_id, court_time_seconds, high_intensity_seconds, average_intensity, explosive_effort_estimate)
        values ($1, $2, $3, $4, $5)
        `,
        [workoutId, metrics.courtTimeSeconds, metrics.highIntensitySeconds, metrics.averageIntensity, metrics.explosiveEffortEstimate],
      )
    }
  }

  async listImportBatches(client: any, userId: string): Promise<unknown[]> {
    const result = await client.query(
      `
      select id, user_id, source, file_name, imported_at, status, detected_workouts_count,
        saved_workouts_count, duplicate_count, error_count, created_at, updated_at
      from import_batches
      where user_id = $1
      order by imported_at desc
      limit 50
      `,
      [userId],
    )
    return result.rows
  }

  async getImportBatch(client: any, userId: string, importBatchId: string): Promise<any | null> {
    const batch = await client.query(
      `
      select id, user_id, source, file_name, imported_at, status, detected_workouts_count,
        saved_workouts_count, duplicate_count, error_count, created_at, updated_at
      from import_batches
      where user_id = $1 and id = $2
      `,
      [userId, importBatchId],
    )
    if (!batch.rows[0]) return null

    const [files, errors] = await Promise.all([
      client.query('select * from import_files where import_batch_id = $1 order by created_at asc', [importBatchId]),
      client.query('select * from import_errors where import_batch_id = $1 order by severity desc, row_number asc nulls last', [importBatchId]),
    ])

    return {
      batch: batch.rows[0],
      files: files.rows,
      errors: errors.rows,
    }
  }
}
