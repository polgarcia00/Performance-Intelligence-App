import { computed, ref } from 'vue'
import type { ImportPreview } from '@/types'
import { loadMockZeppImport } from '@/services/importService'
import { confirmImportPreview, previewImportFileContents, previewImportFiles } from '@/services/importApiService'
import { useImportHistoryStore } from '@/stores/importHistoryStore'
import { usePerformanceStore } from '@/stores/performanceStore'
import { useWorkoutStore } from '@/stores/workoutStore'

export function useDataImport() {
  const workoutStore = useWorkoutStore()
  const performanceStore = usePerformanceStore()
  const importHistoryStore = useImportHistoryStore()

  const preview = ref<ImportPreview | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const hasPreviewRows = computed(() => Boolean(preview.value?.rows.length || preview.value?.sourceFiles.length))
  const savableWorkoutCount = computed(() => {
    if (!preview.value) return 0
    return preview.value.estimatedRecordsToSave?.workouts ?? 0
  })

  function setPreview(nextPreview: ImportPreview) {
    errorMessage.value = ''
    successMessage.value = ''
    preview.value = nextPreview

    if (preview.value.errors.some((error) => error.severity === 'error')) {
      errorMessage.value = 'Import preview has blocking errors. Fix the file and try again.'
    }
  }

  async function previewFile(file: File | null) {
    if (!file) return
    isLoading.value = true

    try {
      setPreview(await previewImportFiles([file]))
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Unable to read import file.'
    } finally {
      isLoading.value = false
    }
  }

  async function previewFiles(files: File[] | FileList | null) {
    if (!files || !files.length) return
    isLoading.value = true

    try {
      setPreview(await previewImportFiles(files))
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Unable to read import files.'
    } finally {
      isLoading.value = false
    }
  }

  async function loadSamplePreview() {
    isLoading.value = true

    try {
      setPreview(await previewImportFileContents(await loadMockZeppImport()))
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Unable to load sample import.'
    } finally {
      isLoading.value = false
    }
  }

  async function savePreview() {
    if (!preview.value) return

    const blockingErrors = preview.value.errors.filter((error) => error.severity === 'error')
    if (blockingErrors.length) {
      errorMessage.value = 'Resolve blocking import errors before saving.'
      return
    }

    const result = await confirmImportPreview(preview.value.previewId ?? preview.value.id)
    await Promise.all([
      workoutStore.loadWorkouts(),
      importHistoryStore.loadHistory(),
    ])
    await performanceStore.loadBackendAnalysis()
    successMessage.value = `Imported ${result.savedWorkoutRows ?? result.savedWorkouts ?? 0} workouts. ${result.duplicateWorkoutRows ?? result.duplicateCount} duplicate workout rows were skipped.`
    preview.value = null
  }

  return {
    errorMessage,
    hasPreviewRows,
    isLoading,
    preview,
    savableWorkoutCount,
    successMessage,
    buildPreview: setPreview,
    loadSamplePreview,
    previewFile,
    previewFiles,
    savePreview,
  }
}
