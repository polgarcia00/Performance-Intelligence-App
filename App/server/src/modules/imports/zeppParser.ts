import { parse } from 'csv-parse/sync'
import type { ImportCategory, ImportFileInput, ParsedImportFile } from '../../types/domain.js'
import { fingerprint } from '../../utils/fingerprint.js'

function headersFor(content: string): string[] {
  const trimmed = content.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const rows = rowsFromJson(content)
      return Object.keys(rows[0] ?? {})
    } catch {
      return []
    }
  }

  const firstLine = content.split(/\r?\n/).find((line) => line.trim()) ?? ''
  return firstLine.split(',').map((header) => header.trim())
}

function rowsFromJson(content: string): Array<Record<string, string>> {
  const parsed = JSON.parse(content) as unknown
  const rows = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).rows)
      ? ((parsed as Record<string, unknown>).rows as unknown[])
      : parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).data)
        ? ((parsed as Record<string, unknown>).data as unknown[])
        : []

  return rows
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object' && !Array.isArray(row))
    .map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value === undefined || value === null ? '' : String(value)])),
    )
}

export function detectCategory(fileName: string, headers: string[]): ImportCategory {
  const lower = fileName.toLowerCase()
  const headerSet = new Set(headers.map((header) => header.toLowerCase()))

  if (lower.includes('sport') || lower.includes('workout')) return 'workout'
  if (lower.includes('activity') || lower.includes('sleep') || lower.includes('heartrate') || lower.includes('heart_rate') || lower.includes('heart-rate')) return 'ignored'

  if (headerSet.has('sporttime(s)') || headerSet.has('starttime') || headerSet.has('type')) return 'workout'
  if (
    headerSet.has('steps') ||
    headerSet.has('deepsleeptime') ||
    headerSet.has('remsleep') ||
    headerSet.has('remtime') ||
    (headerSet.has('heartrate') && (headerSet.has('time') || headerSet.has('date')))
  ) {
    return 'ignored'
  }

  return 'unknown'
}

export function parseImportFiles(files: ImportFileInput[]): ParsedImportFile[] {
  return files.map((file) => {
    const headers = headersFor(file.content)
    const category = detectCategory(file.fileName, headers)

    try {
      const trimmed = file.content.trim()
      const rows = trimmed.startsWith('{') || trimmed.startsWith('[')
        ? rowsFromJson(file.content)
        : (parse(file.content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
          }) as Array<Record<string, string>>)

      const errors = [...(category === 'ignored'
        ? [{
            fileName: file.fileName,
            severity: 'warning' as const,
            message: `Ignored non-workout Zepp file: ${file.fileName}`,
          }]
        : []), ...(category === 'unknown'
        ? [{
            fileName: file.fileName,
            severity: 'warning' as const,
            message: `Ignored unsupported import file: ${file.fileName}`,
          }]
        : [])]

      return {
        fileName: file.fileName,
        category,
        rowCount: rows.length,
        fingerprint: fingerprint({ fileName: file.fileName, content: file.content }),
        rows,
        errors,
      }
    } catch (error) {
      return {
        fileName: file.fileName,
        category,
        rowCount: 0,
        fingerprint: fingerprint({ fileName: file.fileName, content: file.content }),
        rows: [],
        errors: [
          {
            fileName: file.fileName,
            severity: 'error',
            message: error instanceof Error ? error.message : 'Unable to parse CSV file.',
          },
        ],
      }
    }
  })
}
