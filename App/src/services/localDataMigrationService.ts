import { writePersistedState } from './persistenceService'

const MIGRATION_BACKUP_KEY = 'local-data-migration-backup'

export interface LocalDataMigrationPreview {
  hasLocalData: boolean
  workoutRecords: number
  canAutoMigrate: boolean
  notes: string[]
}

export function previewLocalDataMigration(): LocalDataMigrationPreview {
  return {
    hasLocalData: false,
    workoutRecords: 0,
    canAutoMigrate: false,
    notes: [
      'Browser-stored workout bundles are retired.',
      'PostgreSQL is now the source of truth for imported workouts and journal data.',
    ],
  }
}

export function backupLocalDataBeforeMigration(): void {
  writePersistedState(MIGRATION_BACKUP_KEY, {
    createdAt: new Date().toISOString(),
    note: 'Legacy browser workout bundles are no longer read by the production app.',
  })
}
