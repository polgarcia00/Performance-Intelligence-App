import type { WorkoutBundle } from './workout'
import type { ZeppParsedFileSummary, ZeppUnknownWorkout, ZeppWorkoutTypeCount } from './zepp'

export type ImportedDataType =
  | 'running'
  | 'strength'
  | 'basketball'
  | 'unknown'

export interface ParsedImportRow {
  rowNumber: number
  sourceType: ImportedDataType
  raw: Record<string, unknown>
}

export interface ImportError {
  rowNumber?: number
  message: string
  severity: 'warning' | 'error'
}

export interface ImportDuplicate {
  key: string
  label: string
  dataType: ImportedDataType
}

export interface ImportPreviewSummary {
  running: number
  strength: number
  basketball: number
  unknown: number
}

export interface NormalizedImportData extends WorkoutBundle {
  unknownWorkouts: ZeppUnknownWorkout[]
}

export interface ImportPreview {
  id: string
  previewId?: string
  expiresAt?: string
  fileName: string
  createdAt: string
  rows: ParsedImportRow[]
  summary: ImportPreviewSummary
  errors: ImportError[]
  duplicates: ImportDuplicate[]
  normalized: NormalizedImportData
  sourceFiles: ZeppParsedFileSummary[]
  workoutTypeCounts: ZeppWorkoutTypeCount[]
  ignoredFiles: string[]
  detectedWorkoutRows?: number
  validWorkoutRows?: number
  invalidWorkoutRows?: number
  duplicateWorkoutRows?: number
  savedWorkoutRows?: number
  estimatedRecordsToSave?: {
    workouts: number
  }
  duplicateCount?: number
}

export interface ImportHistoryItem {
  id: string
  fileName: string
  importedAt: string
  summary: ImportPreviewSummary
  savedWorkouts: number
  duplicateCount: number
  errorCount: number
}
