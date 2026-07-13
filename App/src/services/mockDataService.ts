import type { ZeppImportFile } from '@/types'

const MOCK_ZEPP_EXPORT_URL = '/api/mock/zepp-export'

export function createMockZeppExportFiles(): ZeppImportFile[] {
  return [
    {
      fileName: 'SPORT/SPORT_sample.csv',
      content: [
        'type,startTime,sportTime(s),maxPace(/meter),minPace(/meter),distance(m),avgPace(/meter),calories(kcal)',
        '1,2026-07-06 18:03:16+0000,2520,3.4,2.2,7200,2.86,420',
        '85,2026-07-07 18:03:16+0000,4320,0,0,0,0,680',
        '52,2026-07-05 17:15:00+0000,3480,0,0,0,0,360',
        '999,2026-07-04 17:15:00+0000,1800,0,0,500,0,120',
      ].join('\n'),
    },
  ]
}

export async function fetchMockZeppExportFiles(): Promise<ZeppImportFile[]> {
  if (typeof window === 'undefined') {
    return createMockZeppExportFiles()
  }

  try {
    const response = await window.fetch(MOCK_ZEPP_EXPORT_URL)
    if (!response.ok) {
      return createMockZeppExportFiles()
    }

    const text = await response.text()
    try {
      const parsed = JSON.parse(text) as unknown
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === 'object' && item !== null && 'fileName' in item && 'content' in item)
      ) {
        return parsed as ZeppImportFile[]
      }
    } catch {
      return [{ fileName: 'sample-zepp-export.json', content: text }]
    }

    return createMockZeppExportFiles()
  } catch {
    return createMockZeppExportFiles()
  }
}
