import type {
  BasketballSession,
  BasketballWorkoutEnrichment,
  ImportHistoryItem,
  ImportPreview,
  PersonalRecord,
  RunningSession,
  RunningWorkoutEnrichment,
  StrengthEnrichmentExercise,
  StrengthEnrichmentSet,
  StrengthSession,
  StrengthWorkoutEnrichment,
  Workout,
  WorkoutBundle,
  WorkoutType,
} from '@/types'
import type { WorkoutJournalStatusSummary } from '@/utils/workoutJournal'

function numberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function dateOnly(value: unknown): string {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function minutesFromSeconds(value: unknown): number {
  return (numberOrUndefined(value) ?? 0) / 60
}

function frontendStatus(status: string): WorkoutJournalStatusSummary['status'] {
  if (status === 'partially_enriched') return 'partially-enriched'
  if (status === 'completed') return 'completed'
  return 'needs-enrichment'
}

export function adaptJournalStatus(status: any): WorkoutJournalStatusSummary {
  const value = frontendStatus(String(status?.status ?? 'needs_enrichment'))
  return {
    status: value,
    label: value === 'completed' ? 'Completed' : value === 'partially-enriched' ? 'Partially enriched' : 'Needs enrichment',
    tone: value === 'completed' ? 'positive' : value === 'partially-enriched' ? 'neutral' : 'warning',
    missingFields: Array.isArray(status?.missingFields) ? status.missingFields : [],
  }
}

export function adaptWorkout(row: any): Workout {
  const type = String(row.sport ?? row.type ?? 'running') as WorkoutType
  return {
    id: String(row.id),
    type,
    date: dateOnly(row.date),
    startTime: row.started_at ? String(row.started_at).slice(11, 16) : undefined,
    durationMinutes: minutesFromSeconds(row.duration_seconds),
    source: row.source ?? 'zepp',
    distanceKm: numberOrUndefined(row.distance_meters) === undefined ? undefined : Number(row.distance_meters) / 1000,
    averageHeartRate: numberOrUndefined(row.average_heart_rate),
    maxHeartRate: numberOrUndefined(row.max_heart_rate),
    calories: numberOrUndefined(row.calories),
    trainingLoad: numberOrUndefined(row.training_load),
  }
}

function adaptRunning(detail: any): RunningSession | null {
  const metrics = detail.objectiveMetrics?.running
  if (!metrics) return null
  return {
    workoutId: detail.workout.id,
    distanceKm: (numberOrUndefined(metrics.distance_meters) ?? numberOrUndefined(detail.workout.distance_meters) ?? 0) / 1000,
    paceSecondsPerKm: numberOrUndefined(metrics.pace_seconds_per_km),
    averageSpeedMetersPerSecond: numberOrUndefined(metrics.average_speed_mps),
    maxSpeedMetersPerSecond: numberOrUndefined(metrics.maximum_speed_mps),
    minSpeedMetersPerSecond: numberOrUndefined(metrics.minimum_speed_mps),
    vo2Max: numberOrUndefined(metrics.vo2_max),
    cadence: numberOrUndefined(metrics.cadence),
  }
}

function adaptRunningEnrichment(detail: any): RunningWorkoutEnrichment | null {
  const journal = detail.journal?.running
  if (!journal) return null
  return {
    workoutId: detail.workout.id,
    goal: journal.training_purpose,
    perceivedEffort: numberOrUndefined(journal.perceived_effort),
    perceivedPerformance: numberOrUndefined(journal.perceived_performance),
    routeType: journal.route_type,
    feltStrong: journal.felt_strong,
    notes: journal.notes,
    updatedAt: journal.updated_at,
  }
}

function adaptStrengthExercise(exercise: any, workoutId: string): StrengthEnrichmentExercise {
  return {
    id: String(exercise.id),
    name: String(exercise.name ?? ''),
    muscleGroup: exercise.muscle_group ?? undefined,
    sets: (exercise.sets ?? []).map((set: any): StrengthEnrichmentSet => ({
      id: String(set.id),
      setNumber: Number(set.set_number ?? set.setNumber ?? 0),
      reps: Number(set.reps ?? 0),
      weightKg: Number(set.weight_kg ?? set.weightKg ?? 0),
      rpe: numberOrUndefined(set.rpe),
      estimatedOneRepMaxKg: numberOrUndefined(set.estimated_one_rep_max_kg ?? set.estimatedOneRepMaxKg),
    })),
  }
}

function adaptStrength(detail: any): { session: StrengthSession | null; enrichment: StrengthWorkoutEnrichment | null } {
  const journal = detail.journal?.strength
  if (!journal) return { session: null, enrichment: null }
  const exercises: StrengthEnrichmentExercise[] = (journal.exercises ?? []).map((exercise: any) => adaptStrengthExercise(exercise, detail.workout.id))
  const totalVolumeKg = exercises
    .flatMap((exercise: StrengthEnrichmentExercise) => exercise.sets)
    .reduce((total: number, set: StrengthEnrichmentSet) => total + set.reps * set.weightKg, 0)
  return {
    session: {
      workoutId: detail.workout.id,
      exercises: exercises.map((exercise: StrengthEnrichmentExercise) => ({ ...exercise, workoutId: detail.workout.id, muscleGroup: exercise.muscleGroup ?? '' })),
      totalVolumeKg,
      primaryMuscleGroups: [...new Set(exercises.map((exercise: StrengthEnrichmentExercise) => exercise.muscleGroup).filter(Boolean))] as string[],
      sessionType: journal.session_type,
    },
    enrichment: {
      workoutId: detail.workout.id,
      sessionType: journal.session_type,
      exercises,
      notes: journal.notes,
      updatedAt: journal.updated_at,
    },
  }
}

function adaptBasketball(detail: any): BasketballSession | null {
  if (detail.workout.sport !== 'basketball') return null
  const metrics = detail.objectiveMetrics?.basketball
  const journal = detail.journal?.basketball
  return {
    workoutId: detail.workout.id,
    sessionType: journal?.session_type,
    courtTimeMinutes: minutesFromSeconds(metrics?.court_time_seconds ?? detail.workout.duration_seconds),
    highIntensityMinutes: minutesFromSeconds(metrics?.high_intensity_seconds),
    explosiveEffortEstimate: numberOrUndefined(metrics?.explosive_effort_estimate),
    perceivedPerformance: numberOrUndefined(journal?.perceived_performance),
  }
}

function adaptBasketballEnrichment(detail: any): BasketballWorkoutEnrichment | null {
  const journal = detail.journal?.basketball
  if (!journal) return null
  return {
    workoutId: detail.workout.id,
    sessionType: journal.session_type,
    perceivedPerformance: numberOrUndefined(journal.perceived_performance),
    perceivedEffort: numberOrUndefined(journal.perceived_effort),
    energyLevel: numberOrUndefined(journal.energy),
    shootingQuality: numberOrUndefined(journal.shooting),
    defenseQuality: numberOrUndefined(journal.defense),
    explosiveness: numberOrUndefined(journal.explosiveness),
    role: journal.role,
    outcome: journal.outcome,
    notes: journal.notes,
    updatedAt: journal.updated_at,
  }
}

export interface AdaptedWorkoutDetail extends WorkoutBundle {
  journalStatuses: Record<string, WorkoutJournalStatusSummary>
}

export function adaptWorkoutDetail(detail: any): AdaptedWorkoutDetail {
  const workout = adaptWorkout(detail.workout)
  const runningSession = adaptRunning(detail)
  const runningEnrichment = adaptRunningEnrichment(detail)
  const strength = adaptStrength(detail)
  const basketballSession = adaptBasketball(detail)
  const basketballEnrichment = adaptBasketballEnrichment(detail)

  return {
    workouts: [workout],
    runningSessions: runningSession ? [runningSession] : [],
    strengthSessions: strength.session ? [strength.session] : [],
    basketballSessions: basketballSession ? [basketballSession] : [],
    runningEnrichments: runningEnrichment ? [runningEnrichment] : [],
    strengthEnrichments: strength.enrichment ? [strength.enrichment] : [],
    basketballEnrichments: basketballEnrichment ? [basketballEnrichment] : [],
    journalStatuses: { [workout.id]: adaptJournalStatus(detail.journalStatus) },
  }
}

export function emptyWorkoutBundle(): AdaptedWorkoutDetail {
  return {
    workouts: [],
    runningSessions: [],
    strengthSessions: [],
    basketballSessions: [],
    runningEnrichments: [],
    strengthEnrichments: [],
    basketballEnrichments: [],
    journalStatuses: {},
  }
}

export function mergeWorkoutDetails(details: AdaptedWorkoutDetail[]): AdaptedWorkoutDetail {
  return details.reduce<AdaptedWorkoutDetail>((bundle, detail) => ({
    workouts: [...bundle.workouts, ...detail.workouts],
    runningSessions: [...bundle.runningSessions, ...detail.runningSessions],
    strengthSessions: [...bundle.strengthSessions, ...detail.strengthSessions],
    basketballSessions: [...bundle.basketballSessions, ...detail.basketballSessions],
    runningEnrichments: [...bundle.runningEnrichments, ...detail.runningEnrichments],
    strengthEnrichments: [...bundle.strengthEnrichments, ...detail.strengthEnrichments],
    basketballEnrichments: [...bundle.basketballEnrichments, ...detail.basketballEnrichments],
    journalStatuses: { ...bundle.journalStatuses, ...detail.journalStatuses },
  }), emptyWorkoutBundle())
}

export function adaptImportHistory(row: any): ImportHistoryItem {
  return {
    id: String(row.id),
    fileName: String(row.file_name ?? 'Zepp import'),
    importedAt: String(row.imported_at ?? row.created_at ?? ''),
    summary: {
      running: 0,
      strength: 0,
      basketball: 0,
      unknown: 0,
    },
    savedWorkouts: Number(row.saved_workouts_count ?? 0),
    duplicateCount: Number(row.duplicate_count ?? 0),
    errorCount: Number(row.error_count ?? 0),
  }
}

export function adaptPersonalRecord(row: any): PersonalRecord {
  return {
    id: String(row.id ?? `${row.sport}-${row.metric_name}`),
    category: row.sport ?? 'running',
    metricName: String(row.metric_name ?? row.metricName ?? 'Record'),
    value: Number(row.value ?? 0),
    unit: String(row.unit ?? ''),
    date: dateOnly(row.achieved_at ?? row.date),
    workoutId: row.workout_id,
  }
}

export function adaptImportPreview(preview: any): ImportPreview {
  const counts = preview.detectedRecordCounts ?? {}
  const sourceFiles = (preview.files ?? []).map((file: any) => ({
    fileName: String(file.fileName),
    category: file.category,
    rowCount: Number(file.rowCount ?? 0),
  }))
  const duplicates = Array.from({ length: Number(preview.duplicateCount ?? 0) }, (_, index) => ({
    key: `duplicate-${index + 1}`,
    label: `Previously imported record ${index + 1}`,
    dataType: 'unknown' as const,
  }))
  const rows = [
    ...(preview.sampleRecords?.workouts ?? []).map((raw: any, index: number) => ({ rowNumber: index + 1, sourceType: raw.sport === 'unknown' ? 'unknown' as const : raw.sport, raw })),
  ]

  return {
    id: String(preview.previewId),
    previewId: String(preview.previewId),
    expiresAt: String(preview.expiresAt),
    fileName: sourceFiles.length === 1 ? sourceFiles[0].fileName : `${sourceFiles.length} Zepp files`,
    createdAt: new Date().toISOString(),
    rows,
    summary: {
      running: Number(counts.running ?? 0),
      strength: Number(counts.strength ?? 0),
      basketball: Number(counts.basketball ?? 0),
      unknown: Number(counts.unknownWorkouts ?? 0),
    },
    errors: (preview.errors ?? []).map((error: any) => ({
      rowNumber: error.rowNumber,
      message: error.fileName ? `${error.fileName}: ${error.message}` : error.message,
      severity: error.severity,
    })),
    duplicates,
    normalized: {
      unknownWorkouts: (preview.unknownSportCodes ?? []).map((code: string) => ({ typeCode: code })),
    },
    sourceFiles,
    workoutTypeCounts: (preview.unknownSportCodes ?? []).map((code: string) => ({ code, mappedType: 'unknownWorkout', count: 1 })),
    ignoredFiles: preview.ignoredFiles ?? sourceFiles.filter((file: any) => file.category === 'ignored' || file.category === 'unknown').map((file: any) => file.fileName),
    detectedWorkoutRows: Number(preview.detectedWorkoutRows ?? 0),
    validWorkoutRows: Number(preview.validWorkoutRows ?? 0),
    invalidWorkoutRows: Number(preview.invalidWorkoutRows ?? 0),
    duplicateWorkoutRows: Number(preview.duplicateWorkoutRows ?? preview.duplicateCount ?? 0),
    savedWorkoutRows: Number(preview.savedWorkoutRows ?? preview.estimatedRecordsToSave?.workouts ?? 0),
    estimatedRecordsToSave: {
      workouts: Number(preview.estimatedRecordsToSave?.workouts ?? 0),
    },
    duplicateCount: Number(preview.duplicateCount ?? 0),
  }
}
