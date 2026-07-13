import type { ImportedDataType, ImportError, ParsedImportRow } from '@/types'

function normalizeHeader(header: string): string {
  return header.trim().replace(/^\uFEFF/, '')
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]

    if (character === '"' && nextCharacter === '"') {
      current += '"'
      index += 1
    } else if (character === '"') {
      inQuotes = !inQuotes
    } else if (character === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }

  values.push(current.trim())
  return values
}

function flattenJsonInput(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
  }

  if (typeof value !== 'object' || value === null) {
    return []
  }

  const record = value as Record<string, unknown>
  const rows: Record<string, unknown>[] = []

  Object.entries(record).forEach(([groupName, groupValue]) => {
    if (Array.isArray(groupValue)) {
      groupValue.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          rows.push({ sourceCategory: groupName, ...(item as Record<string, unknown>) })
        }
      })
    }
  })

  return rows.length ? rows : [record]
}

function valueAt(raw: Record<string, unknown>, keys: string[]): string {
  const normalizedKeys = Object.keys(raw).reduce<Record<string, unknown>>((acc, key) => {
    acc[key.toLowerCase().replace(/[\s_-]/g, '')] = raw[key]
    return acc
  }, {})

  for (const key of keys) {
    const value = normalizedKeys[key.toLowerCase().replace(/[\s_-]/g, '')]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).toLowerCase()
    }
  }

  return ''
}

export function detectImportDataType(raw: Record<string, unknown>): ImportedDataType {
  const category = valueAt(raw, ['sourceCategory', 'category', 'recordType', 'dataType'])
  const sport = valueAt(raw, ['sport', 'activityType', 'workoutType', 'type', 'activity'])
  const combined = `${category} ${sport}`

  if (combined.includes('run')) return 'running'
  if (combined.includes('strength') || combined.includes('weight') || combined.includes('gym') || combined.includes('lift')) return 'strength'
  if (combined.includes('basket')) return 'basketball'

  if (valueAt(raw, ['distance', 'distanceKm', 'pace'])) return 'running'
  if (valueAt(raw, ['exercise', 'exerciseName', 'sets', 'reps', 'weight'])) return 'strength'

  return 'unknown'
}

export function parseZeppImport(content: string): {
  rows: ParsedImportRow[]
  errors: ImportError[]
} {
  const trimmed = content.trim()
  const errors: ImportError[] = []

  if (!trimmed) {
    return {
      rows: [],
      errors: [{ message: 'Import file is empty.', severity: 'error' }],
    }
  }

  try {
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed) as unknown
      const rows = flattenJsonInput(parsed).map<ParsedImportRow>((raw, index) => ({
        rowNumber: index + 1,
        sourceType: detectImportDataType(raw),
        raw,
      }))

      return { rows, errors }
    }
  } catch (error) {
    return {
      rows: [],
      errors: [{ message: error instanceof Error ? error.message : 'Invalid JSON import file.', severity: 'error' }],
    }
  }

  const lines = trimmed.split(/\r?\n/).filter(Boolean)
  const headers = parseCsvLine(lines[0] ?? '').map(normalizeHeader)

  if (!headers.length) {
    return {
      rows: [],
      errors: [{ message: 'CSV file has no header row.', severity: 'error' }],
    }
  }

  const rows = lines.slice(1).map<ParsedImportRow>((line, index) => {
    const values = parseCsvLine(line)
    const raw = headers.reduce<Record<string, unknown>>((acc, header, headerIndex) => {
      acc[header] = values[headerIndex] ?? ''
      return acc
    }, {})

    return {
      rowNumber: index + 2,
      sourceType: detectImportDataType(raw),
      raw,
    }
  })

  return { rows, errors }
}
