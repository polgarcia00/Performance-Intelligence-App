import type {
  BasketballSession,
  BasketballWorkoutEnrichment,
  RunningSession,
  RunningWorkoutEnrichment,
  StrengthSession,
  StrengthWorkoutEnrichment,
  Workout,
} from './workout'

export type ZeppImportCategory = 'workout' | 'ignored' | 'unknown'
export type ZeppWorkoutTypeCode = string
export type ZeppMappedWorkoutType = Workout['type'] | 'unknownWorkout'

export interface ZeppImportFile {
  fileName: string
  content: string
}

export interface ZeppParsedFileSummary {
  fileName: string
  category: ZeppImportCategory
  rowCount: number
}

export interface ZeppImportMessage {
  fileName?: string
  rowNumber?: number
  message: string
  severity: 'warning' | 'error'
}

export interface ZeppRowMetadata {
  _sourceFileName?: string
  _rowNumber?: number
}

export interface ZeppSportRow extends ZeppRowMetadata {
  type?: string
  startTime?: string
  'sportTime(s)'?: string
  'maxPace(/meter)'?: string
  'minPace(/meter)'?: string
  'distance(m)'?: string
  'avgPace(/meter)'?: string
  'calories(kcal)'?: string
  [key: string]: string | number | undefined
}

export interface ZeppParsedExport {
  sportRows: ZeppSportRow[]
  unknownRows: Array<Record<string, string | number | undefined>>
  files: ZeppParsedFileSummary[]
  messages: ZeppImportMessage[]
}

export interface ZeppWorkoutTypeCount {
  code: ZeppWorkoutTypeCode
  mappedType: ZeppMappedWorkoutType
  count: number
}

export interface ZeppUnknownWorkout {
  rowNumber?: number
  sourceFileName?: string
  typeCode: ZeppWorkoutTypeCode
  startTime?: string
  durationSeconds?: number
  calories?: number
  raw: ZeppSportRow
}

export interface ZeppWorkoutNormalizationResult {
  workouts: Workout[]
  runningSessions: RunningSession[]
  strengthSessions: StrengthSession[]
  basketballSessions: BasketballSession[]
  runningEnrichments: RunningWorkoutEnrichment[]
  strengthEnrichments: StrengthWorkoutEnrichment[]
  basketballEnrichments: BasketballWorkoutEnrichment[]
  unknownWorkouts: ZeppUnknownWorkout[]
  workoutTypeCounts: ZeppWorkoutTypeCount[]
  messages: ZeppImportMessage[]
}
