import type {
  ImportDuplicate,
  ImportHistoryItem,
  ImportPreview,
  ImportPreviewSummary,
  NormalizedImportData,
  ZeppImportFile,
  Workout,
} from '@/types'
import JSZip from 'jszip'
import { createMockZeppExportFiles, fetchMockZeppExportFiles } from './mockDataService'
import { createEmptyNormalizedImportData, workoutImportKey } from '@/utils/dataNormalizer'
import { readPersistedState, writePersistedState } from './persistenceService'
import { createId } from '@/utils/id'
import { normalizeZeppWorkouts } from '@/utils/zepp/normalizeZeppWorkouts'
import { parseZeppExport } from '@/utils/zepp/parseZeppExport'
import { mapZeppSportType } from '@/utils/zepp/zeppSportTypes'

const IMPORT_HISTORY_KEY = 'import-history'
const SUPPORTED_ZEPP_ZIP_CSV_PATTERNS = [
  /\/SPORT\/SPORT_[^/]+\.CSV$/i,
]

function isSupportedZeppZipCsvPath(fileName: string): boolean {
  const normalized = `/${fileName.replaceAll('\\', '/')}`
  return SUPPORTED_ZEPP_ZIP_CSV_PATTERNS.some((pattern) => pattern.test(normalized))
}

function isMacOsMetadataFile(fileName: string): boolean {
  const normalized = fileName.replaceAll('\\', '/')
  const baseName = normalized.split('/').at(-1) ?? ''
  return normalized.includes('__MACOSX/') || baseName.startsWith('._')
}

export function createImportSummary(rows: ImportPreview['rows']): ImportPreviewSummary {
  return rows.reduce<ImportPreviewSummary>(
    (summary, row) => {
      summary[row.sourceType] += 1
      return summary
    },
    {
      running: 0,
      strength: 0,
      basketball: 0,
      unknown: 0,
    },
  )
}

export function detectImportDuplicates(
  normalized: NormalizedImportData,
  existingWorkouts: Workout[],
): ImportDuplicate[] {
  const existingWorkoutKeys = new Set(existingWorkouts.map(workoutImportKey))
  const seen = new Set<string>()
  const duplicates: ImportDuplicate[] = []

  normalized.workouts.forEach((workout) => {
    const key = workoutImportKey(workout)
    if (existingWorkoutKeys.has(key) || seen.has(key)) {
      duplicates.push({ key, label: `${workout.type} on ${workout.date}`, dataType: workout.type })
    }
    seen.add(key)
  })

  return duplicates
}

export function removeDuplicateImportData(normalized: NormalizedImportData, duplicates: ImportDuplicate[]): NormalizedImportData {
  const duplicateKeys = new Set(duplicates.map((duplicate) => duplicate.key))
  const workouts = normalized.workouts.filter((workout) => !duplicateKeys.has(workoutImportKey(workout)))
  const workoutIds = new Set(workouts.map((workout) => workout.id))

  return {
    workouts,
    runningSessions: normalized.runningSessions.filter((session) => workoutIds.has(session.workoutId)),
    strengthSessions: normalized.strengthSessions.filter((session) => workoutIds.has(session.workoutId)),
    basketballSessions: normalized.basketballSessions.filter((session) => workoutIds.has(session.workoutId)),
    runningEnrichments: normalized.runningEnrichments.filter((entry) => workoutIds.has(entry.workoutId)),
    strengthEnrichments: normalized.strengthEnrichments.filter((entry) => workoutIds.has(entry.workoutId)),
    basketballEnrichments: normalized.basketballEnrichments.filter((entry) => workoutIds.has(entry.workoutId)),
    unknownWorkouts: normalized.unknownWorkouts,
  }
}

function createPreviewRows(parsed: ReturnType<typeof parseZeppExport>, maxRowsPerCategory = 8): ImportPreview['rows'] {
  let rowNumber = 1

  return [
    ...parsed.sportRows.slice(0, maxRowsPerCategory).map((raw) => {
      const mappedType = mapZeppSportType(raw.type)
      return {
        rowNumber: rowNumber++,
        sourceType: mappedType === 'unknownWorkout' ? ('unknown' as const) : mappedType,
        raw,
      }
    }),
    ...parsed.unknownRows.slice(0, maxRowsPerCategory).map((raw) => ({ rowNumber: rowNumber++, sourceType: 'unknown' as const, raw })),
  ]
}

function createImportSummaryFromParsed(parsed: ReturnType<typeof parseZeppExport>): ImportPreviewSummary {
  const summary: ImportPreviewSummary = {
    running: 0,
    strength: 0,
    basketball: 0,
    unknown: parsed.unknownRows.length,
  }

  parsed.sportRows.forEach((row) => {
    const mappedType = mapZeppSportType(row.type)
    if (mappedType === 'unknownWorkout') summary.unknown += 1
    else summary[mappedType] += 1
  })

  return summary
}

function createNormalizedDataFromZepp(parsed: ReturnType<typeof parseZeppExport>): {
  normalized: NormalizedImportData
  errors: ImportPreview['errors']
  workoutTypeCounts: ImportPreview['workoutTypeCounts']
} {
  const workoutData = normalizeZeppWorkouts(parsed.sportRows)
  const normalized: NormalizedImportData = {
    ...createEmptyNormalizedImportData(),
    workouts: workoutData.workouts,
    runningSessions: workoutData.runningSessions,
    strengthSessions: workoutData.strengthSessions,
    basketballSessions: workoutData.basketballSessions,
    runningEnrichments: workoutData.runningEnrichments,
    strengthEnrichments: workoutData.strengthEnrichments,
    basketballEnrichments: workoutData.basketballEnrichments,
    unknownWorkouts: workoutData.unknownWorkouts,
  }
  const errors = [...parsed.messages, ...workoutData.messages].map((message) => ({
    rowNumber: message.rowNumber,
    message: message.fileName ? `${message.fileName}: ${message.message}` : message.message,
    severity: message.severity,
  }))

  return {
    normalized,
    errors,
    workoutTypeCounts: workoutData.workoutTypeCounts,
  }
}

export function createImportPreviewFromFiles(
  files: ZeppImportFile[],
  existingWorkouts: Workout[] = [],
): ImportPreview {
  const parsed = parseZeppExport(files)
  const rows = createPreviewRows(parsed)
  const { normalized, errors, workoutTypeCounts } = createNormalizedDataFromZepp(parsed)
  const duplicates = detectImportDuplicates(normalized, existingWorkouts)

  return {
    id: createId('preview'),
    fileName: files.length === 1 ? files[0]?.fileName ?? 'Zepp import' : `${files.length} Zepp files`,
    createdAt: new Date().toISOString(),
    rows,
    summary: createImportSummaryFromParsed(parsed),
    errors,
    duplicates,
    normalized,
    sourceFiles: parsed.files,
    workoutTypeCounts,
    ignoredFiles: parsed.files.filter((file) => file.category === 'ignored' || file.category === 'unknown').map((file) => file.fileName),
    detectedWorkoutRows: normalized.workouts.length,
    validWorkoutRows: normalized.workouts.length,
    invalidWorkoutRows: errors.filter((error) => error.severity === 'error').length,
    duplicateWorkoutRows: duplicates.length,
    savedWorkoutRows: normalized.workouts.length - duplicates.length,
    estimatedRecordsToSave: {
      workouts: normalized.workouts.length - duplicates.length,
    },
  }
}

export function createImportPreview(
  content: string,
  fileName: string,
  existingWorkouts: Workout[] = [],
): ImportPreview {
  return createImportPreviewFromFiles([{ fileName, content }], existingWorkouts)
}

export async function readImportFile(file: File): Promise<string> {
  return file.text()
}

export async function readImportFiles(files: File[] | FileList): Promise<ZeppImportFile[]> {
  const importFiles: ZeppImportFile[] = []

  for (const file of Array.from(files)) {
    if (file.name.toLowerCase().endsWith('.zip')) {
      const zip = await JSZip.loadAsync(await file.arrayBuffer())
      const csvEntries = Object.values(zip.files).filter((entry) => !entry.dir && entry.name.toLowerCase().endsWith('.csv'))

      for (const entry of csvEntries) {
        if (isMacOsMetadataFile(entry.name)) {
          continue
        }

        if (!isSupportedZeppZipCsvPath(entry.name)) {
          importFiles.push({
            fileName: entry.name,
            content: 'unsupportedZeppFile\n',
          })
          continue
        }

        importFiles.push({
          fileName: entry.name,
          content: await entry.async('string'),
        })
      }
      continue
    }

    importFiles.push({
      fileName: file.name,
      content: await file.text(),
    })
  }

  return importFiles
}

export async function loadMockZeppImport(): Promise<ZeppImportFile[]> {
  return fetchMockZeppExportFiles()
}

export function createLocalMockZeppImport(): ZeppImportFile[] {
  return createMockZeppExportFiles()
}

export function loadImportHistory(): ImportHistoryItem[] {
  return readPersistedState<ImportHistoryItem[]>(IMPORT_HISTORY_KEY) ?? []
}

export function saveImportHistory(history: ImportHistoryItem[]): ImportHistoryItem[] {
  writePersistedState(IMPORT_HISTORY_KEY, history)
  return history
}

export function createImportHistoryItem(preview: ImportPreview, saved: NormalizedImportData): ImportHistoryItem {
  return {
    id: createId('import'),
    fileName: preview.fileName,
    importedAt: new Date().toISOString(),
    summary: preview.summary,
    savedWorkouts: saved.workouts.length,
    duplicateCount: preview.duplicates.length,
    errorCount: preview.errors.length,
  }
}
