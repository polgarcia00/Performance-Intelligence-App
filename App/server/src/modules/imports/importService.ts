import { randomUUID } from 'node:crypto'
import { env } from '../../config/env.js'
import { transaction } from '../../database/pool.js'
import { AppError } from '../../middleware/errors.js'
import { ImportRepository } from '../../repositories/importRepository.js'
import type { ImportFileInput, ImportPreview, ImportPreviewState } from '../../types/domain.js'
import { parseImportFiles } from './zeppParser.js'
import { normalizeParsedFiles } from './zeppNormalizer.js'

const previews = new Map<string, ImportPreviewState>()

function cleanupExpiredPreviews(): void {
  const now = Date.now()
  for (const [previewId, preview] of previews.entries()) {
    if (new Date(preview.expiresAt).getTime() < now) {
      previews.delete(previewId)
    }
  }
}

function publicPreview(state: ImportPreviewState): ImportPreview {
  const { normalized: _normalized, parsedFiles: _parsedFiles, ...preview } = state
  return preview
}

export class ImportService {
  constructor(
    private importRepository = new ImportRepository(),
    private runInTransaction = transaction,
  ) {}

  async previewImport(files: ImportFileInput[], userId = env.defaultUserId): Promise<ImportPreview> {
    cleanupExpiredPreviews()
    if (!files.length) {
      throw new AppError(422, 'validation_failed', 'At least one import file is required.', {
        fieldErrors: { files: ['At least one import file is required.'] },
      })
    }

    const parsedFiles = parseImportFiles(files)
    const normalized = normalizeParsedFiles(parsedFiles)
    const knownWorkouts = normalized.workouts.filter((workout) => workout.sport !== 'unknown')
    const duplicateSets = await this.runInTransaction(async (client) => ({
      workouts: await this.importRepository.findDuplicateWorkoutFingerprints(client, userId, knownWorkouts.map((workout) => workout.sourceRowFingerprint)),
    }))
    const duplicateWorkoutRows = knownWorkouts.filter((workout) => duplicateSets.workouts.has(workout.sourceRowFingerprint)).length
    const previewId = randomUUID()
    const expiresAt = new Date(Date.now() + env.importPreviewTtlSeconds * 1000).toISOString()
    const detectedRecordCounts = {
      running: normalized.workouts.filter((workout) => workout.sport === 'running').length,
      strength: normalized.workouts.filter((workout) => workout.sport === 'strength').length,
      basketball: normalized.workouts.filter((workout) => workout.sport === 'basketball').length,
      unknownWorkouts: normalized.workouts.filter((workout) => workout.sport === 'unknown').length,
    }
    const invalidWorkoutRows = parsedFiles
      .filter((file) => file.category === 'workout')
      .reduce((total, file) => total + file.errors.filter((error) => error.severity === 'warning' || error.severity === 'error').length, 0)
    const ignoredFiles = parsedFiles.filter((file) => file.category === 'ignored' || file.category === 'unknown').map((file) => file.fileName)
    const savedWorkoutRows = knownWorkouts.length - duplicateWorkoutRows

    const state: ImportPreviewState = {
      previewId,
      expiresAt,
      files: parsedFiles.map((file) => ({
        fileName: file.fileName,
        category: file.category,
        rowCount: file.rowCount,
        validRowCount: file.rowCount - file.errors.length,
          invalidRowCount: file.errors.length,
        })),
      detectedWorkoutRows: normalized.workouts.length,
      validWorkoutRows: knownWorkouts.length,
      invalidWorkoutRows,
      duplicateWorkoutRows,
      savedWorkoutRows,
      duplicateCount: duplicateWorkoutRows,
      detectedRecordCounts,
      ignoredFiles,
      unknownSportCodes: normalized.unknownSportCodes,
      warnings: normalized.errors.filter((error) => error.severity === 'warning').map((error) => error.message),
      sampleRecords: {
        workouts: normalized.workouts.slice(0, 5),
      },
      estimatedRecordsToSave: {
        workouts: savedWorkoutRows,
      },
      errors: normalized.errors,
      parsedFiles,
      normalized: {
        workouts: normalized.workouts,
      },
    }

    previews.set(previewId, state)
    return publicPreview(state)
  }

  async confirmImport(previewId: string, userId = env.defaultUserId): Promise<unknown> {
    cleanupExpiredPreviews()
    const preview = previews.get(previewId)
    if (!preview) throw new AppError(404, 'preview_not_found', 'Import preview was not found or has expired.')
    if (new Date(preview.expiresAt).getTime() < Date.now()) {
      previews.delete(previewId)
      throw new AppError(404, 'preview_expired', 'Import preview has expired.')
    }

    return this.runInTransaction(async (client) => {
      const knownWorkouts = preview.normalized.workouts.filter((workout) => workout.sport !== 'unknown')
      const workoutDuplicates = await this.importRepository.findDuplicateWorkoutFingerprints(client, userId, knownWorkouts.map((workout) => workout.sourceRowFingerprint))
      const workoutsToSave = knownWorkouts.filter((workout) => !workoutDuplicates.has(workout.sourceRowFingerprint))
      const duplicateWorkoutRows = knownWorkouts.filter((workout) => workoutDuplicates.has(workout.sourceRowFingerprint)).length
      const batchId = await this.importRepository.createBatch(client, {
        userId,
        fileName: preview.files.length === 1 ? preview.files[0].fileName : `${preview.files.length} Zepp files`,
        detectedWorkoutsCount: preview.normalized.workouts.length,
        savedWorkoutsCount: workoutsToSave.length,
        duplicateCount: duplicateWorkoutRows,
        errorCount: preview.errors.length,
      })

      await this.importRepository.insertFiles(client, batchId, preview.parsedFiles)
      await this.importRepository.insertErrors(client, batchId, preview.errors)

      for (const workout of workoutsToSave) {
        const workoutId = await this.importRepository.insertWorkout(client, userId, batchId, workout)
        await this.importRepository.insertWorkoutMetrics(client, workoutId, workout)
      }

      previews.delete(previewId)

      return {
        importBatchId: batchId,
        detectedWorkoutRows: preview.normalized.workouts.length,
        validWorkoutRows: knownWorkouts.length,
        duplicateWorkoutRows,
        savedWorkoutRows: workoutsToSave.length,
        savedWorkouts: workoutsToSave.length,
        duplicateCount: duplicateWorkoutRows,
        errorCount: preview.errors.length,
      }
    })
  }

  async listImports(userId = env.defaultUserId): Promise<unknown[]> {
    cleanupExpiredPreviews()
    return this.runInTransaction((client) => this.importRepository.listImportBatches(client, userId))
  }

  async getImport(importBatchId: string, userId = env.defaultUserId): Promise<unknown> {
    const result = await this.runInTransaction((client) => this.importRepository.getImportBatch(client, userId, importBatchId))
    if (!result) throw new AppError(404, 'import_not_found', 'Import batch was not found.')
    return result
  }
}
