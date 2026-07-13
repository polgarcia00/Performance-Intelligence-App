import { describe, expect, it } from 'vitest'
import {
  formatCalories,
  formatDate,
  formatDistance,
  formatDuration,
  formatHeartRate,
  formatMetricDelta,
  formatPace,
} from '@/utils/formatters'

describe('formatters', () => {
  it('formats calories as whole kcal without mutating numeric precision elsewhere', () => {
    expect(formatCalories(452.6)).toBe('453 kcal')
    expect(formatCalories(452.2)).toBe('452 kcal')
  })

  it('formats distance as metres under 1000m and kilometres above 1000m', () => {
    expect(formatDistance(850, 'm')).toBe('850 m')
    expect(formatDistance(5320, 'm')).toBe('5.32 km')
    expect(formatDistance(5.321, 'km')).toBe('5.32 km')
  })

  it('formats duration naturally', () => {
    expect(formatDuration(42)).toBe('42 min')
    expect(formatDuration(78)).toBe('1 h 18 min')
    expect(formatDuration(123)).toBe('2 h 3 min')
  })

  it('formats pace as minutes per kilometre', () => {
    expect(formatPace(466)).toBe('7:46 min/km')
    expect(formatPace(312)).toBe('5:12 min/km')
    expect(formatPace(271)).toBe('4:31 min/km')
  })

  it('formats heart rate as whole bpm', () => {
    expect(formatHeartRate(72.4)).toBe('72 bpm')
    expect(formatHeartRate(72.6)).toBe('73 bpm')
  })

  it('formats dates consistently', () => {
    expect(formatDate('2026-07-09')).toBe('Jul 9, 2026')
    expect(formatDate('2026-07-09', 'short')).toBe('Jul 9')
  })

  it('formats metric deltas with the same centralized rules', () => {
    expect(formatMetricDelta(12.6, 'calories')).toBe('+13 kcal')
    expect(formatMetricDelta(-15, 'duration')).toBe('-15 min')
    expect(formatMetricDelta(12, 'pace')).toBe('+0:12 min/km')
  })
})
