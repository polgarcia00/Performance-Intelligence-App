import type {
  ImportErrorRecord,
  NormalizedWorkout,
  ParsedImportFile,
} from '../../types/domain.js'
import { dateKey, isoDateTime } from '../../utils/dates.js'
import { fingerprint } from '../../utils/fingerprint.js'
import { calculatePaceSecondsPerKm, readInteger, readNumber } from '../../utils/numbers.js'
import { mapZeppSportType } from '../../utils/zeppSportTypes.js'

function read(row: Record<string, string>, keys: string[]): string | undefined {
  const normalized = Object.entries(row).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key.toLowerCase().replace(/[\s_-]/g, '')] = value
    return acc
  }, {})

  for (const key of keys) {
    const value = normalized[key.toLowerCase().replace(/[\s_-]/g, '')]
    if (value !== undefined && String(value).trim() !== '') return String(value).trim()
  }

  return undefined
}

function normalizeWorkouts(file: ParsedImportFile): { records: NormalizedWorkout[]; errors: ImportErrorRecord[]; unknownSportCodes: string[] } {
  const errors: ImportErrorRecord[] = []
  const unknownSportCodes = new Set<string>()
  const records = file.rows.flatMap((row, index) => {
    const code = read(row, ['type', 'sportType'])
    const sport = mapZeppSportType(code)
    if (sport === 'unknown') unknownSportCodes.add(code ?? 'missing')

    const startedAt = isoDateTime(read(row, ['startTime', 'startedAt']))
    const date = dateKey(startedAt ?? read(row, ['date']))
    const durationSeconds = readNumber(read(row, ['sportTime(s)', 'durationSeconds', 'duration']))
    if (!date || !durationSeconds || durationSeconds <= 0) {
      errors.push({ fileName: file.fileName, rowNumber: index + 2, severity: 'warning', message: 'Workout row is missing start time or duration.', rawPayload: row })
      return []
    }

    const distanceMeters = readNumber(read(row, ['distance(m)', 'distanceMeters', 'distance']))
    const averageSpeedMps = readNumber(read(row, ['avgPace(/meter)', 'averageSpeedMps']))
    const minimumSpeedMps = readNumber(read(row, ['minPace(/meter)', 'minimumSpeedMps']))
    const maximumSpeedMps = readNumber(read(row, ['maxPace(/meter)', 'maximumSpeedMps']))
    const sourceRowFingerprint = fingerprint({ fileName: file.fileName, row })
    const workout: NormalizedWorkout = {
      sport,
      sourceSportCode: code,
      sourceWorkoutId: read(row, ['id', 'workoutId']),
      sourceRowFingerprint,
      startedAt,
      date,
      durationSeconds,
      distanceMeters,
      calories: readNumber(read(row, ['calories(kcal)', 'calories'])),
      averageHeartRate: readNumber(read(row, ['avgHeartRate', 'averageHeartRate'])),
      maxHeartRate: readNumber(read(row, ['maxHeartRate'])),
      trainingLoad: readNumber(read(row, ['trainingLoad'])),
      rawSummary: row,
    }

    if (sport === 'running') {
      workout.runningMetrics = {
        distanceMeters,
        paceSecondsPerKm: calculatePaceSecondsPerKm(durationSeconds, distanceMeters, averageSpeedMps),
        averageSpeedMps,
        minimumSpeedMps,
        maximumSpeedMps,
      }
    } else if (sport === 'strength') {
      workout.strengthMetrics = {
        detectedDurationSeconds: durationSeconds,
        detectedCalories: workout.calories,
        detectedAverageHeartRate: workout.averageHeartRate,
      }
    } else if (sport === 'basketball') {
      workout.basketballMetrics = {
        courtTimeSeconds: durationSeconds,
        highIntensitySeconds: readNumber(read(row, ['highIntensitySeconds', 'highIntensityMinutes'])),
      }
    }

    return [workout]
  })

  return { records, errors, unknownSportCodes: [...unknownSportCodes] }
}

export function normalizeParsedFiles(files: ParsedImportFile[]) {
  const workouts: NormalizedWorkout[] = []
  const errors: ImportErrorRecord[] = files.flatMap((file) => file.errors)
  const unknownSportCodes = new Set<string>()

  for (const file of files) {
    if (file.category === 'workout') {
      const normalized = normalizeWorkouts(file)
      workouts.push(...normalized.records)
      errors.push(...normalized.errors)
      normalized.unknownSportCodes.forEach((code) => unknownSportCodes.add(code))
    }
  }

  return { workouts, errors, unknownSportCodes: [...unknownSportCodes] }
}
