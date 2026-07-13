import { describe, expect, it } from 'vitest'
import { parseZeppExport } from '@/utils/zepp/parseZeppExport'
import { normalizeZeppWorkouts } from '@/utils/zepp/normalizeZeppWorkouts'

const activityCsv = [
  'date,steps,distance,runDistance,calories',
  '2026-01-01,2133,1413,1175,85',
].join('\n')

const sleepCsv = [
  'date,deepSleepTime,shallowSleepTime,wakeTime,start,stop,REMTime,naps',
  '2026-01-01,96,198,12,2026-01-01 06:47:00+0000,2026-01-01 12:13:00+0000,32,"[{""start"":""14:00""}]"',
].join('\n')

const heartRateCsv = [
  'date,time,heartRate',
  '2026-01-01,07:13,107',
  '2026-01-01,07:14,99',
  '2026-01-01,07:15,88',
].join('\n')

const sportCsv = [
  'type,startTime,sportTime(s),maxPace(/meter),minPace(/meter),distance(m),avgPace(/meter),calories(kcal)',
  '1,2026-01-01 18:03:16+0000,1800,3.4,2.2,5321,2.77,310',
  '85,2026-01-02 18:03:16+0000,3600,0,0,0,0,720',
  '52,2026-01-03 18:03:16+0000,3000,0,0,0,0,280',
  '999,2026-01-04 18:03:16+0000,1200,0,0,800,0,100',
].join('\n')

describe('Zepp parser and normalizers', () => {
  it('groups Zepp CSV files by export category and detects unknown files', () => {
    const parsed = parseZeppExport([
      { fileName: 'ACTIVITY/ACTIVITY_test.csv', content: activityCsv },
      { fileName: 'SLEEP/SLEEP_test.csv', content: sleepCsv },
      { fileName: 'HEARTRATE_AUTO/HEARTRATE_AUTO_test.csv', content: heartRateCsv },
      { fileName: 'SPORT/SPORT_test.csv', content: sportCsv },
      { fileName: 'USER/USER_test.csv', content: 'name\nPol' },
    ])

    expect(parsed.files.map((file) => file.category)).toEqual(['ignored', 'ignored', 'ignored', 'workout', 'unknown'])
    expect(parsed.sportRows).toHaveLength(4)
    expect(parsed.messages.some((message) => message.message.includes('Ignored non-workout Zepp file'))).toBe(true)
    expect(parsed.messages.some((message) => message.message.includes('Ignored unsupported import file'))).toBe(true)
  })

  it('normalizes sport codes and does not guess unknown workouts from distance', () => {
    const parsed = parseZeppExport([{ fileName: 'SPORT/SPORT_test.csv', content: sportCsv }])
    const normalized = normalizeZeppWorkouts(parsed.sportRows)

    expect(normalized.workouts.map((workout) => workout.type)).toEqual(['running', 'basketball', 'strength'])
    expect(normalized.runningSessions[0]?.distanceKm).toBe(5.321)
    expect(normalized.runningSessions[0]?.paceSecondsPerKm).toBeCloseTo(1800 / 5.321)
    expect(normalized.runningSessions[0]?.runType).toBeUndefined()
    expect(normalized.basketballSessions[0]?.courtTimeMinutes).toBe(60)
    expect(normalized.basketballEnrichments[0]?.perceivedPerformance).toBeUndefined()
    expect(normalized.strengthSessions).toEqual([])
    expect(normalized.strengthEnrichments[0]?.exercises).toEqual([])
    expect(normalized.unknownWorkouts[0]?.typeCode).toBe('999')
    expect(normalized.messages.some((message) => message.message.includes('Unknown Zepp sport type 999'))).toBe(true)
  })
})
