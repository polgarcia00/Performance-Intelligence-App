import type { WorkoutType, ZeppMappedWorkoutType, ZeppWorkoutTypeCode } from '@/types'

export const ZEPP_SPORT_TYPE_MAP: Record<ZeppWorkoutTypeCode, WorkoutType> = {
  '1': 'running',
  '85': 'basketball',
  '52': 'strength',
  '130': 'strength',
  '223': 'strength',
  '227': 'strength',
}

export function mapZeppSportType(code: ZeppWorkoutTypeCode | number | undefined): ZeppMappedWorkoutType {
  if (code === undefined || code === null || String(code).trim() === '') {
    return 'unknownWorkout'
  }

  return ZEPP_SPORT_TYPE_MAP[String(code).trim()] ?? 'unknownWorkout'
}
