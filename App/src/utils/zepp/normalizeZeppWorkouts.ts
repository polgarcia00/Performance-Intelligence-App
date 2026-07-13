import type {
  BasketballSession,
  RunningSession,
  Workout,
  ZeppImportMessage,
  ZeppSportRow,
  ZeppUnknownWorkout,
  ZeppWorkoutNormalizationResult,
  ZeppWorkoutTypeCount,
} from '@/types'
import { mapZeppSportType } from './zeppSportTypes'

function readNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = Number(String(value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

function readString(value: string | number | undefined): string {
  return String(value ?? '').trim()
}

function dateFromStartTime(startTime: string): string {
  const directDate = startTime.match(/\d{4}-\d{2}-\d{2}/)?.[0]
  if (directDate) return directDate

  const parsed = new Date(startTime)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10)
}

function createWorkoutId(type: Workout['type'], row: ZeppSportRow, index: number): string {
  const startTime = readString(row.startTime).replace(/[^a-zA-Z0-9]/g, '')
  return `zepp-${type}-${startTime || index + 1}`
}

function createWorkoutBase(row: ZeppSportRow, type: Workout['type'], index: number): Workout | null {
  const startTime = readString(row.startTime)
  const date = dateFromStartTime(startTime)
  const durationSeconds = readNumber(row['sportTime(s)'])

  if (!date || durationSeconds === undefined || durationSeconds <= 0) {
    return null
  }

  return {
    id: createWorkoutId(type, row, index),
    type,
    date,
    startTime,
    durationMinutes: durationSeconds / 60,
    source: 'zepp',
    distanceKm:
      type === 'running' && readNumber(row['distance(m)']) !== undefined
        ? readNumber(row['distance(m)'])! / 1000
        : undefined,
    calories: readNumber(row['calories(kcal)']),
    notes: `Imported Zepp sport type ${readString(row.type) || 'unknown'}`,
  }
}

function normalizeRunningSession(row: ZeppSportRow, workout: Workout): RunningSession | null {
  const distanceMeters = readNumber(row['distance(m)'])
  const durationSeconds = readNumber(row['sportTime(s)'])
  const distanceKm = distanceMeters !== undefined ? distanceMeters / 1000 : undefined

  if (!distanceKm || !durationSeconds) {
    return null
  }

  return {
    workoutId: workout.id,
    distanceKm,
    paceSecondsPerKm: durationSeconds / distanceKm,
    averageSpeedMetersPerSecond: readNumber(row['avgPace(/meter)']),
    maxSpeedMetersPerSecond: readNumber(row['maxPace(/meter)']),
    minSpeedMetersPerSecond: readNumber(row['minPace(/meter)']),
  }
}

function updateWorkoutTypeCounts(counts: Map<string, ZeppWorkoutTypeCount>, code: string) {
  const mappedType = mapZeppSportType(code)
  const existing = counts.get(code)
  counts.set(code, {
    code,
    mappedType,
    count: (existing?.count ?? 0) + 1,
  })
}

export function normalizeZeppWorkouts(rows: ZeppSportRow[]): ZeppWorkoutNormalizationResult {
  const result: ZeppWorkoutNormalizationResult = {
    workouts: [],
    runningSessions: [],
    strengthSessions: [],
    basketballSessions: [],
    runningEnrichments: [],
    strengthEnrichments: [],
    basketballEnrichments: [],
    unknownWorkouts: [],
    workoutTypeCounts: [],
    messages: [],
  }
  const counts = new Map<string, ZeppWorkoutTypeCount>()
  const unknownCodes = new Set<string>()

  rows.forEach((row, index) => {
    const code = readString(row.type)
    const mappedType = mapZeppSportType(code)
    updateWorkoutTypeCounts(counts, code || 'missing')

    if (mappedType === 'unknownWorkout') {
      result.unknownWorkouts.push({
        rowNumber: typeof row._rowNumber === 'number' ? row._rowNumber : undefined,
        sourceFileName: typeof row._sourceFileName === 'string' ? row._sourceFileName : undefined,
        typeCode: code || 'missing',
        startTime: readString(row.startTime) || undefined,
        durationSeconds: readNumber(row['sportTime(s)']),
        calories: readNumber(row['calories(kcal)']),
        raw: row,
      })
      unknownCodes.add(code || 'missing')
      return
    }

    const workout = createWorkoutBase(row, mappedType, index)
    if (!workout) {
      result.messages.push({
        fileName: typeof row._sourceFileName === 'string' ? row._sourceFileName : undefined,
        rowNumber: typeof row._rowNumber === 'number' ? row._rowNumber : undefined,
        message: `Sport type ${code || 'missing'} is missing start time or duration.`,
        severity: 'warning',
      })
      return
    }

    if (mappedType === 'running') {
      const session = normalizeRunningSession(row, workout)
      if (!session) {
        result.messages.push({
          fileName: typeof row._sourceFileName === 'string' ? row._sourceFileName : undefined,
          rowNumber: typeof row._rowNumber === 'number' ? row._rowNumber : undefined,
          message: `Running sport type ${code} is missing usable distance or duration.`,
          severity: 'warning',
        })
        return
      }
      result.workouts.push(workout)
      result.runningSessions.push(session)
      result.runningEnrichments.push({ workoutId: workout.id })
      return
    }

    result.workouts.push(workout)

    if (mappedType === 'basketball') {
      result.basketballSessions.push({
        workoutId: workout.id,
        courtTimeMinutes: workout.durationMinutes,
      } satisfies BasketballSession)
      result.basketballEnrichments.push({ workoutId: workout.id })
      return
    }

    result.strengthEnrichments.push({
      workoutId: workout.id,
      exercises: [],
    })
  })

  result.workoutTypeCounts = [...counts.values()].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
  unknownCodes.forEach((code) => {
    result.messages.push({
      message: `Unknown Zepp sport type ${code}. It is previewed but not saved as a workout.`,
      severity: 'warning',
    } satisfies ZeppImportMessage)
  })

  return result
}
