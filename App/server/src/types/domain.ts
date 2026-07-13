export type Sport = 'running' | 'strength' | 'basketball' | 'unknown'
export type ImportCategory = 'workout' | 'ignored' | 'unknown'
export type JournalStatus = 'needs_enrichment' | 'partially_enriched' | 'completed'

export interface ManualWorkoutInput {
  sport: Exclude<Sport, 'unknown'>
  startedAt: string
  date: string
  durationSeconds: number
  distanceMeters?: number
  calories?: number
  averageHeartRate?: number
  maxHeartRate?: number
}

export interface ImportFileInput {
  fileName: string
  content: string
}

export interface ImportErrorRecord {
  fileName?: string
  rowNumber?: number
  severity: 'warning' | 'error'
  message: string
  rawPayload?: unknown
}

export interface ParsedImportFile {
  fileName: string
  category: ImportCategory
  rowCount: number
  fingerprint: string
  rows: Array<Record<string, string>>
  errors: ImportErrorRecord[]
}

export interface NormalizedWorkout {
  id?: string
  sport: Sport
  sourceSportCode?: string
  sourceWorkoutId?: string
  sourceRowFingerprint: string
  startedAt?: string
  date: string
  durationSeconds: number
  distanceMeters?: number
  calories?: number
  averageHeartRate?: number
  maxHeartRate?: number
  trainingLoad?: number
  rawSummary: Record<string, unknown>
  runningMetrics?: NormalizedRunningMetrics
  strengthMetrics?: NormalizedStrengthMetrics
  basketballMetrics?: NormalizedBasketballMetrics
}

export interface NormalizedRunningMetrics {
  distanceMeters?: number
  paceSecondsPerKm?: number
  averageSpeedMps?: number
  minimumSpeedMps?: number
  maximumSpeedMps?: number
  cadence?: number
  vo2Max?: number
}

export interface NormalizedStrengthMetrics {
  detectedDurationSeconds?: number
  detectedCalories?: number
  detectedAverageHeartRate?: number
}

export interface NormalizedBasketballMetrics {
  courtTimeSeconds?: number
  highIntensitySeconds?: number
  averageIntensity?: number
  explosiveEffortEstimate?: number
}

export interface ImportPreview {
  previewId: string
  expiresAt: string
  files: Array<{
    fileName: string
    category: ImportCategory
    rowCount: number
    validRowCount: number
    invalidRowCount: number
  }>
  detectedWorkoutRows: number
  validWorkoutRows: number
  invalidWorkoutRows: number
  duplicateWorkoutRows: number
  savedWorkoutRows: number
  detectedRecordCounts: {
    running: number
    strength: number
    basketball: number
    unknownWorkouts: number
  }
  ignoredFiles: string[]
  unknownSportCodes: string[]
  warnings: string[]
  sampleRecords: {
    workouts: NormalizedWorkout[]
  }
  estimatedRecordsToSave: {
    workouts: number
  }
  duplicateCount: number
  errors: ImportErrorRecord[]
}

export interface ImportPreviewState extends ImportPreview {
  parsedFiles: ParsedImportFile[]
  normalized: {
    workouts: NormalizedWorkout[]
  }
}

export interface RunningJournalInput {
  trainingPurpose?: string
  perceivedEffort?: number
  perceivedPerformance?: number
  routeType?: string
  feltStrong?: boolean
  notes?: string
}

export interface StrengthSetInput {
  setNumber: number
  reps: number
  weightKg: number
  rpe?: number
}

export interface StrengthExerciseInput {
  name: string
  muscleGroup?: string
  sets: StrengthSetInput[]
}

export interface StrengthJournalInput {
  sessionType?: string
  notes?: string
  exercises: StrengthExerciseInput[]
}

export interface BasketballJournalInput {
  sessionType?: string
  perceivedPerformance?: number
  perceivedEffort?: number
  energy?: number
  explosiveness?: number
  shooting?: number
  defense?: number
  role?: string
  outcome?: string
  notes?: string
}
