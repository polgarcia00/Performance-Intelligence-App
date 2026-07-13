import { configureTestDatabaseEnvironment, integrationTestUserId, validateTestDatabaseUrl } from '../../database/testDatabaseSafety.js'

export type QueryFn = (text: string, params?: unknown[]) => Promise<{ rows: any[]; rowCount: number }>

export interface PostgresTestHarness {
  app: any
  request: any
  query: QueryFn
  resetDatabase: () => Promise<void>
  close: () => Promise<void>
}

export function getPostgresIntegrationSetupError(): string | null {
  try {
    validateTestDatabaseUrl()
    return null
  } catch (error) {
    return error instanceof Error ? error.message : 'PostgreSQL integration test database is not configured safely.'
  }
}

export async function createPostgresTestHarness(): Promise<PostgresTestHarness> {
  configureTestDatabaseEnvironment()

  const database = await import('../../database/pool.js')
  const migrations = await import('../../database/migrate.js')
  const appModule = await import('../../app.js')
  const supertestModule = await import('supertest')

  async function resetDatabase(): Promise<void> {
    await database.query('drop schema if exists public cascade')
    await database.query('create schema public')
    await migrations.runMigrations()
    await database.query('insert into users (id, name, timezone) values ($1, $2, $3)', [
      integrationTestUserId,
      'Integration Test Athlete',
      'Europe/Madrid',
    ])
  }

  return {
    app: appModule.createApp(),
    request: supertestModule.default,
    query: database.query,
    resetDatabase,
    close: database.closePool,
  }
}
