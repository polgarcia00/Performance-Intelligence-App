export type ZeppImportCategory = 'workout' | 'ignored' | 'unknown'
export type ZeppWorkoutTypeCode = string
export type ZeppMappedWorkoutType = 'running' | 'strength' | 'basketball' | 'unknownWorkout'

export interface ZeppImportFile {
  fileName: string
  content: string
}

export interface ZeppParsedFileSummary {
  fileName: string
  category: ZeppImportCategory
  rowCount: number
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
  raw?: Record<string, unknown>
}
