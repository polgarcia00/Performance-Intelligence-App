import type {
  ZeppImportCategory,
  ZeppImportFile,
  ZeppParsedExport,
  ZeppSportRow,
} from '@/types'
import { parseZeppCsv, readZeppCsvHeaders } from './parseZeppCsv'

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[\s_-]/g, '')
}

function includesHeader(headers: string[], expected: string): boolean {
  const normalized = normalizeHeader(expected)
  return headers.some((header) => normalizeHeader(header) === normalized)
}

export function detectZeppImportCategory(fileName: string, headers: string[]): ZeppImportCategory {
  const normalizedPath = fileName.replaceAll('\\', '/').toUpperCase()

  if (normalizedPath.includes('/SPORT/') || normalizedPath.startsWith('SPORT/')) return 'workout'
  if (
    normalizedPath.includes('/ACTIVITY/') ||
    normalizedPath.startsWith('ACTIVITY/') ||
    normalizedPath.includes('/SLEEP/') ||
    normalizedPath.startsWith('SLEEP/') ||
    normalizedPath.includes('/HEARTRATE_AUTO/') ||
    normalizedPath.includes('/HEARTRATE/') ||
    normalizedPath.startsWith('HEARTRATE')
  ) return 'ignored'

  if (includesHeader(headers, 'sportTime(s)') && includesHeader(headers, 'startTime')) return 'workout'
  if (
    (includesHeader(headers, 'deepSleepTime') && includesHeader(headers, 'REMTime')) ||
    (includesHeader(headers, 'heartRate') && includesHeader(headers, 'time')) ||
    (includesHeader(headers, 'steps') && includesHeader(headers, 'runDistance'))
  ) return 'ignored'

  return 'unknown'
}

function withMetadata<T extends Record<string, string | number | undefined>>(rows: Array<Record<string, string>>, fileName: string): T[] {
  return rows.map((row, index) => ({
    ...row,
    _sourceFileName: fileName,
    _rowNumber: index + 2,
  })) as unknown as T[]
}

function appendRows<T>(target: T[], rows: T[]) {
  rows.forEach((row) => target.push(row))
}

export function parseZeppExport(files: ZeppImportFile[]): ZeppParsedExport {
  const parsed: ZeppParsedExport = {
    sportRows: [],
    unknownRows: [],
    files: [],
    messages: [],
  }

  if (!files.length) {
    parsed.messages.push({ message: 'No import files were selected.', severity: 'error' })
    return parsed
  }

  files.forEach((file) => {
    const headers = readZeppCsvHeaders(file.content)
    const rows = parseZeppCsv(file.content)
    const category = detectZeppImportCategory(file.fileName, headers)

    parsed.files.push({
      fileName: file.fileName,
      category,
      rowCount: rows.length,
    })

    if (!headers.length) {
      parsed.messages.push({
        fileName: file.fileName,
        message: 'File has no CSV header row.',
        severity: 'warning',
      })
      return
    }

    if (category === 'workout') appendRows(parsed.sportRows, withMetadata<ZeppSportRow>(rows, file.fileName))
    else if (category === 'ignored') {
      parsed.messages.push({
        fileName: file.fileName,
        message: `Ignored non-workout Zepp file: ${file.fileName}`,
        severity: 'warning',
      })
    }
    else {
      appendRows(parsed.unknownRows, withMetadata(rows, file.fileName))
      parsed.messages.push({
        fileName: file.fileName,
        message: `Ignored unsupported import file: ${file.fileName}`,
        severity: 'warning',
      })
    }
  })

  return parsed
}
