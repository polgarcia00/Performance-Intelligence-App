import { describe, expect, it } from 'vitest'
import { parseZeppImport } from '@/utils/zeppImportParser'

describe('zeppImportParser', () => {
  it('parses CSV rows and detects workout types without creating journal records from unsupported rows', () => {
    const parsed = parseZeppImport(
      [
        'date,sport,durationMinutes,distanceKm,unsupportedScore',
        '2026-07-06,running,40,7.1,',
        '2026-07-07,body-status,,,,80',
      ].join('\n'),
    )

    expect(parsed.errors).toHaveLength(0)
    expect(parsed.rows[0]?.sourceType).toBe('running')
    expect(parsed.rows[1]?.sourceType).toBe('unknown')
  })

  it('parses grouped JSON exports', () => {
    const parsed = parseZeppImport(
      JSON.stringify({
        workouts: [{ date: '2026-07-06', sport: 'basketball', durationMinutes: 70 }],
        sleep: [{ date: '2026-07-06', sleepScore: 82 }],
      }),
    )

    expect(parsed.rows.map((row) => row.sourceType)).toEqual(['basketball', 'unknown'])
  })
})
