import { configureTestDatabaseEnvironment } from './testDatabaseSafety.js'

let closePoolSafely: (() => Promise<void>) | null = null

async function migrateTestDatabase(): Promise<void> {
  configureTestDatabaseEnvironment()
  const { runMigrations } = await import('./migrate.js')
  const { closePool } = await import('./pool.js')
  closePoolSafely = closePool
  await runMigrations()
  await closePool()
}

migrateTestDatabase()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    const close = closePoolSafely ? closePoolSafely() : Promise.resolve()
    close.finally(() => process.exit(1))
  })
