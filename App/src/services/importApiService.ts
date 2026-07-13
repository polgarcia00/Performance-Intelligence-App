import type { ImportHistoryItem, ImportPreview, ZeppImportFile } from '@/types'
import { apiGet, apiPost, apiPostForm } from './apiClient'
import { adaptImportHistory, adaptImportPreview } from './backendAdapters'

export interface ImportConfirmationResult {
  importBatchId: string
  detectedWorkoutRows: number
  validWorkoutRows: number
  duplicateWorkoutRows: number
  savedWorkoutRows: number
  savedWorkouts?: number
  duplicateCount: number
  errorCount: number
}

export async function previewImportFiles(files: File[] | FileList): Promise<ImportPreview> {
  const formData = new FormData()
  Array.from(files).forEach((file) => formData.append('files', file, file.name))
  return adaptImportPreview(await apiPostForm('/imports/preview', formData))
}

export async function previewImportFileContents(files: ZeppImportFile[]): Promise<ImportPreview> {
  return adaptImportPreview(await apiPost('/imports/preview', { files }))
}

export async function confirmImportPreview(previewId: string): Promise<ImportConfirmationResult> {
  return apiPost('/imports/confirm', { previewId })
}

export async function fetchImportHistory(): Promise<ImportHistoryItem[]> {
  const rows = await apiGet<unknown[]>('/imports')
  return rows.map(adaptImportHistory)
}

export async function fetchImportDetails(importId: string): Promise<unknown> {
  return apiGet(`/imports/${importId}`)
}
