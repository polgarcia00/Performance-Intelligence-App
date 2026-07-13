<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import { useDataImport } from '@/composables/useDataImport'
import { useImportHistoryStore } from '@/stores/importHistoryStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { fetchImportDetails } from '@/services/importApiService'
import { backupLocalDataBeforeMigration, previewLocalDataMigration } from '@/services/localDataMigrationService'
import { formatDate } from '@/utils/formatters'

const settingsStore = useSettingsStore()
const importHistoryStore = useImportHistoryStore()
const {
  errorMessage,
  hasPreviewRows,
  isLoading,
  preview,
  savableWorkoutCount,
  successMessage,
  loadSamplePreview,
  previewFiles,
  savePreview,
} = useDataImport()
const distanceOptions = [
  { label: 'Kilometers', value: 'km' },
  { label: 'Miles', value: 'mi' },
]
const weightOptions = [
  { label: 'Kilograms', value: 'kg' },
  { label: 'Pounds', value: 'lb' },
]
const selectedImportDetails = ref<unknown | null>(null)
const migrationPreview = computed(() => previewLocalDataMigration())

onMounted(() => {
  void importHistoryStore.loadHistory()
})

function handleFileChange(event: Event) {
  const files = (event.target as HTMLInputElement).files ?? null
  void previewFiles(files)
}

async function inspectImport(importId: string) {
  selectedImportDetails.value = await fetchImportDetails(importId)
}

function backupLocalData() {
  backupLocalDataBeforeMigration()
}
</script>

<template>
  <PageContainer title="Settings / Data Import" eyebrow="Import first" description="Import Zepp workout data, preview it, then save normalized workout records for journaling and analysis.">
    <BaseCard title="Import Zepp workout data" subtitle="Upload SPORT.csv from your Zepp workout export.">
      <div class="import-actions">
        <label class="file-picker" for="zepp-import-file">
          <span>Choose SPORT.csv</span>
          <input id="zepp-import-file" type="file" accept=".csv,text/csv" multiple @change="handleFileChange" />
        </label>
        <BaseButton variant="secondary" :disabled="isLoading" @click="loadSamplePreview">
          Load sample export
        </BaseButton>
      </div>

      <p v-if="isLoading" class="muted">Preparing import preview...</p>
      <p v-if="errorMessage" role="alert" class="form-alert form-alert--error">{{ errorMessage }}</p>
      <p v-if="successMessage" role="status" class="form-alert form-alert--success">{{ successMessage }}</p>
    </BaseCard>

    <BaseCard v-if="preview" title="Import preview" :subtitle="preview.fileName">
      <div class="preview-grid">
        <div v-for="[label, count] in Object.entries(preview.summary)" :key="label" class="preview-metric">
          <span>{{ label }}</span>
          <strong>{{ count }}</strong>
        </div>
      </div>

      <div class="preview-status">
        <BaseBadge :tone="preview.errors.length ? 'warning' : 'positive'">
          {{ preview.errors.length }} import messages
        </BaseBadge>
        <BaseBadge :tone="(preview.duplicateWorkoutRows ?? preview.duplicates.length) ? 'warning' : 'positive'">
          {{ preview.duplicateWorkoutRows ?? preview.duplicates.length }} duplicate workout rows
        </BaseBadge>
        <BaseBadge>{{ savableWorkoutCount }} workouts ready</BaseBadge>
      </div>

      <section class="preview-panel" aria-label="Workout import counts">
        <div>
          <h3>Workout rows</h3>
          <p>Only workout rows are eligible to be saved.</p>
        </div>
        <div class="code-summary-grid">
          <article>
            <span>Detected</span>
            <strong>{{ preview.detectedWorkoutRows ?? preview.rows.length }}</strong>
          </article>
          <article>
            <span>Valid</span>
            <strong>{{ preview.validWorkoutRows ?? savableWorkoutCount }}</strong>
          </article>
          <article>
            <span>Invalid</span>
            <strong>{{ preview.invalidWorkoutRows ?? 0 }}</strong>
          </article>
          <article>
            <span>Ready</span>
            <strong>{{ savableWorkoutCount }}</strong>
          </article>
        </div>
      </section>

      <section v-if="preview.sourceFiles.length" class="preview-panel" aria-label="Detected files">
        <div>
          <h3>Files received</h3>
          <p>Workout files are processed. Non-workout Zepp files are ignored.</p>
        </div>
        <div class="file-summary-list">
          <article v-for="file in preview.sourceFiles" :key="file.fileName">
            <span>{{ file.fileName }}</span>
            <strong>{{ file.category }} · {{ file.rowCount }} rows</strong>
          </article>
        </div>
      </section>

      <section v-if="preview.ignoredFiles.length" class="preview-panel" aria-label="Ignored files">
        <div>
          <h3>Ignored files</h3>
          <p>These files were not persisted because Performance Journal imports workouts only.</p>
        </div>
        <div class="message-list">
          <p v-for="fileName in preview.ignoredFiles" :key="fileName">{{ fileName }}</p>
        </div>
      </section>

      <section v-if="preview.workoutTypeCounts.length" class="preview-panel" aria-label="Workout type codes">
        <div>
          <h3>Workout type codes</h3>
          <p>Known Zepp sport codes are mapped safely</p>
        </div>
        <div class="code-summary-grid">
          <article v-for="item in preview.workoutTypeCounts" :key="item.code">
            <span>{{ item.code }}</span>
            <strong>{{ item.mappedType }} · {{ item.count }}</strong>
          </article>
        </div>
      </section>

      <section v-if="preview.normalized.unknownWorkouts.length" class="preview-panel" aria-label="Unknown sport codes">
        <div>
          <h3>Unknown sport codes</h3>
          <p>Previewed but not saved as workouts</p>
        </div>
        <div class="message-list">
          <p v-for="item in preview.normalized.unknownWorkouts.slice(0, 8)" :key="`${item.typeCode}-${item.startTime}`">
            Type {{ item.typeCode }} · {{ item.startTime ?? 'unknown start' }}
          </p>
        </div>
      </section>

      <div v-if="preview.errors.length" class="message-list">
        <p v-for="error in preview.errors" :key="`${error.rowNumber}-${error.message}`">
          Row {{ error.rowNumber ?? '-' }}: {{ error.message }}
        </p>
      </div>

      <div v-if="preview.duplicates.length" class="message-list">
        <p v-for="duplicate in preview.duplicates" :key="duplicate.key">
          Duplicate skipped: {{ duplicate.label }}
        </p>
      </div>

      <div class="preview-table" v-if="hasPreviewRows">
        <article v-for="row in preview.rows.slice(0, 8)" :key="row.rowNumber">
          <strong>Row {{ row.rowNumber }}</strong>
          <span>{{ row.sourceType }}</span>
        </article>
      </div>

      <template #action>
        <BaseButton :disabled="!hasPreviewRows" @click="savePreview">Save import</BaseButton>
      </template>
    </BaseCard>

    <BaseCard title="Import history" subtitle="Saved import batches">
      <div v-if="importHistoryStore.history.length" class="history-list">
        <article v-for="item in importHistoryStore.history" :key="item.id">
          <div>
            <strong>{{ item.fileName }}</strong>
            <p>{{ formatDate(item.importedAt, 'dateTime') }}</p>
          </div>
          <span>{{ item.savedWorkouts }} workouts / {{ item.duplicateCount }} duplicates / {{ item.errorCount }} messages</span>
          <BaseButton variant="secondary" @click="inspectImport(item.id)">Inspect</BaseButton>
        </article>
      </div>
      <p v-else class="muted">No imports saved yet.</p>

      <section v-if="selectedImportDetails" class="preview-panel" aria-label="Import details">
        <div>
          <h3>Import details</h3>
          <p>Backend batch, files, warnings, and rejected rows.</p>
        </div>
        <pre>{{ selectedImportDetails }}</pre>
      </section>
    </BaseCard>

    <BaseCard title="Preferences" subtitle="Saved locally in this browser">
      <div class="settings-grid">
        <BaseInput id="athlete-name" v-model="settingsStore.athleteName" label="Athlete name" />
        <BaseSelect id="distance-unit" v-model="settingsStore.preferredDistanceUnit" label="Distance unit" :options="distanceOptions" />
        <BaseSelect id="weight-unit" v-model="settingsStore.preferredWeightUnit" label="Weight unit" :options="weightOptions" />
        <BaseButton @click="settingsStore.updateSettings({})">Save preferences</BaseButton>
      </div>
    </BaseCard>

    <BaseCard title="Fallback tools" subtitle="Secondary tools for missing Zepp workouts and local maintenance">
      <p>Use fallback workout entry only when Zepp missed a workout. Manual entries are saved to PostgreSQL and can be enriched like imported workouts.</p>
      <template #action>
        <RouterLink to="/workouts/add-missing"><BaseButton variant="secondary">Add missing workout</BaseButton></RouterLink>
      </template>
    </BaseCard>

    <BaseCard title="Local data migration" subtitle="Existing browser data is preserved and no longer used as the production source of truth">
      <div class="migration-grid">
        <span>{{ migrationPreview.workoutRecords }} local workout records</span>
      </div>
      <div class="message-list">
        <p v-for="note in migrationPreview.notes" :key="note">{{ note }}</p>
      </div>
      <template #action>
        <BaseButton variant="secondary" @click="backupLocalData">Create local backup</BaseButton>
        <BaseButton variant="danger" @click="settingsStore.resetLocalData()">Reset local data</BaseButton>
      </template>
    </BaseCard>
  </PageContainer>
</template>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
  align-items: end;
}

p {
  margin: 0;
  color: var(--color-text-muted);
}

.import-actions,
.preview-status {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

.file-picker {
  display: grid;
  gap: var(--space-2);
  min-width: min(100%, 24rem);
  color: var(--color-text-muted);
  font-weight: 800;
}

.file-picker input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: rgba(8, 16, 17, 0.82);
  color: var(--color-text);
  padding: 0.75rem;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.preview-panel {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-4);
}

.preview-panel h3 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.preview-panel p {
  margin-top: var(--space-1);
}

.preview-metric {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
}

.preview-metric span {
  display: block;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-transform: capitalize;
}

.preview-metric strong {
  display: block;
  margin-top: var(--space-1);
  font-size: var(--font-size-xl);
}

.message-list,
.preview-table,
.history-list,
.file-summary-list,
.code-summary-grid {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.message-list p,
.preview-panel pre,
.preview-table article,
.history-list article,
.file-summary-list article,
.code-summary-grid article {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-2);
}

.preview-table article,
.history-list article,
.file-summary-list article,
.code-summary-grid article {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
}

.history-list p {
  margin-top: var(--space-1);
}

.preview-panel pre {
  overflow: auto;
  color: var(--color-text-muted);
  white-space: pre-wrap;
}

.migration-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.migration-grid span {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  padding: var(--space-3);
}
</style>
