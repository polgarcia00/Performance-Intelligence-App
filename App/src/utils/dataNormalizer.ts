import type {
  ImportError,
  ImportedDataType,
  NormalizedImportData,
  ParsedImportRow,
  Workout,
} from '@/types'
import { createId } from './id'
import { enrichStrengthSession } from './performanceMetrics'

function readString(raw: Record<string, unknown>, keys: string[]): string {
  const normalized = Object.keys(raw).reduce<Record<string, unknown>>((acc, key) => {
    acc[key.toLowerCase().replace(/[\s_-]/g, '')] = raw[key]
    return acc
  }, {})

  for (const key of keys) {
    const value = normalized[key.toLowerCase().replace(/[\s_-]/g, '')]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim()
    }
  }

  return ''
}

function readNumber(raw: Record<string, unknown>, keys: string[]): number | undefined {
  const value = readString(raw, keys)
  if (!value) return undefined
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

function readDate(raw: Record<string, unknown>): string {
  const value = readString(raw, ['date', 'startDate', 'startTime', 'timestamp', 'day'])
  if (!value) return ''
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }

  return value.slice(0, 10)
}

function createWorkoutBase(raw: Record<string, unknown>, type: Workout['type'], sourceType: ImportedDataType): Workout | null {
  const date = readDate(raw)
  const durationMinutes = readNumber(raw, ['durationMinutes', 'duration', 'minutes', 'timeMinutes', 'activeMinutes'])
  var cal = readNumber(raw, ['calories', 'kcal'])

  if (!date || !durationMinutes || durationMinutes <= 0) {
    return null
  }

  return {
    id: `import-${type}-${date}-${createId('row')}`,
    type,
    date,
    durationMinutes,
    source: 'csv',
    averageHeartRate: readNumber(raw, ['averageHeartRate', 'avgHeartRate', 'avgHr', 'heartRateAvg']),
    maxHeartRate: readNumber(raw, ['maxHeartRate', 'maxHr', 'heartRateMax']),
    calories: cal,
    trainingLoad: readNumber(raw, ['trainingLoad', 'load']),
    perceivedEffort: readNumber(raw, ['rpe', 'effort', 'perceivedEffort']),
    notes: readString(raw, ['notes', 'comment']) || `Imported ${sourceType} row`,
  }
}

function normalizeRunningRow(row: ParsedImportRow, errors: ImportError[], data: NormalizedImportData) {
  const workout = createWorkoutBase(row.raw, 'running', row.sourceType)
  const distanceKm = readNumber(row.raw, ['distanceKm', 'distance', 'km'])

  if (!workout || !distanceKm) {
    errors.push({ rowNumber: row.rowNumber, message: 'Running row is missing date, duration, or distance.', severity: 'warning' })
    return
  }

  data.workouts.push(workout)
  data.runningSessions.push({
    workoutId: workout.id,
    distanceKm,
    paceSecondsPerKm: readNumber(row.raw, ['paceSecondsPerKm', 'pace']) ?? (workout.durationMinutes * 60) / distanceKm,
    vo2Max: readNumber(row.raw, ['vo2Max', 'vo2']),
    cadence: readNumber(row.raw, ['cadence']),
    zone1Minutes: readNumber(row.raw, ['zone1Minutes', 'zone1']),
    zone2Minutes: readNumber(row.raw, ['zone2Minutes', 'zone2']),
    zone3Minutes: readNumber(row.raw, ['zone3Minutes', 'zone3']),
    zone4Minutes: readNumber(row.raw, ['zone4Minutes', 'zone4']),
    zone5Minutes: readNumber(row.raw, ['zone5Minutes', 'zone5']),
    runType: 'other',
  })
}

function normalizeStrengthRow(row: ParsedImportRow, errors: ImportError[], data: NormalizedImportData) {
  const workout = createWorkoutBase(row.raw, 'strength', row.sourceType)
  const exerciseName = readString(row.raw, ['exerciseName', 'exercise', 'name']) || 'Imported strength exercise'
  const muscleGroup = readString(row.raw, ['muscleGroup', 'muscle', 'bodyPart']) || 'Other'
  const sets = readNumber(row.raw, ['sets', 'setCount']) ?? 1
  const reps = readNumber(row.raw, ['reps', 'repetitions']) ?? 1
  const weightKg = readNumber(row.raw, ['weightKg', 'weight', 'loadKg']) ?? 0

  if (!workout) {
    errors.push({ rowNumber: row.rowNumber, message: 'Strength row is missing date or duration.', severity: 'warning' })
    return
  }

  data.workouts.push(workout)
  data.strengthSessions.push(
    enrichStrengthSession({
      workoutId: workout.id,
      totalVolumeKg: 0,
      primaryMuscleGroups: [muscleGroup],
      sessionType: 'other',
      exercises: [
        {
          id: createId('exercise'),
          workoutId: workout.id,
          name: exerciseName,
          muscleGroup,
          sets: Array.from({ length: Math.max(1, Math.round(sets)) }, (_, index) => ({
            id: createId('set'),
            setNumber: index + 1,
            reps,
            weightKg,
          })),
        },
      ],
    }),
  )
}

function normalizeBasketballRow(row: ParsedImportRow, errors: ImportError[], data: NormalizedImportData) {
  const workout = createWorkoutBase(row.raw, 'basketball', row.sourceType)
  if (!workout) {
    errors.push({ rowNumber: row.rowNumber, message: 'Basketball row is missing date or duration.', severity: 'warning' })
    return
  }

  data.workouts.push(workout)
  data.basketballSessions.push({
    workoutId: workout.id,
    sessionType: 'pickup',
    highIntensityMinutes: readNumber(row.raw, ['highIntensityMinutes', 'highIntensity', 'zone4Minutes', 'zone5Minutes']),
    explosiveEffortEstimate: readNumber(row.raw, ['explosiveEffortEstimate', 'explosiveEffort']),
    perceivedPerformance: readNumber(row.raw, ['perceivedPerformance', 'performance']),
    courtTimeMinutes: workout.durationMinutes,
  })
}

export function createEmptyNormalizedImportData(): NormalizedImportData {
  return {
    workouts: [],
    runningSessions: [],
    strengthSessions: [],
    basketballSessions: [],
    runningEnrichments: [],
    strengthEnrichments: [],
    basketballEnrichments: [],
    unknownWorkouts: [],
  }
}

export function normalizeImportRows(rows: ParsedImportRow[]): {
  data: NormalizedImportData
  errors: ImportError[]
} {
  const data = createEmptyNormalizedImportData()
  const errors: ImportError[] = []

  rows.forEach((row) => {
    if (row.sourceType === 'running') normalizeRunningRow(row, errors, data)
    else if (row.sourceType === 'strength') normalizeStrengthRow(row, errors, data)
    else if (row.sourceType === 'basketball') normalizeBasketballRow(row, errors, data)
    else errors.push({ rowNumber: row.rowNumber, message: 'Unsupported row type. It was included in the preview but not saved.', severity: 'warning' })
  })

  return { data, errors }
}

export function workoutImportKey(workout: Workout): string {
  return `${workout.type}:${workout.date}:${workout.startTime ?? ''}:${Math.round(workout.durationMinutes)}:${workout.averageHeartRate ?? ''}`
}
