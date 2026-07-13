export const integrationTestUserId = '00000000-0000-0000-0000-000000000001'

function databaseNameFromUrl(databaseUrl: string): string {
  try {
    return new URL(databaseUrl).pathname.replace(/^\//, '')
  } catch {
    throw new Error('TEST_DATABASE_URL must be a valid PostgreSQL connection URL.')
  }
}

export function validateTestDatabaseUrl(env: Record<string, string | undefined> = process.env): string {
  const testDatabaseUrl = env.TEST_DATABASE_URL
  if (!testDatabaseUrl) {
    throw new Error(
      'TEST_DATABASE_URL is required for PostgreSQL integration tests. Create a separate test database and rerun with TEST_DATABASE_URL set.',
    )
  }

  if (env.DATABASE_URL && testDatabaseUrl === env.DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must not match DATABASE_URL. Integration tests must never use the development database.')
  }

  const databaseName = databaseNameFromUrl(testDatabaseUrl)
  if (!/(^|[_-])test(ing)?($|[_-])|test/i.test(databaseName)) {
    throw new Error('TEST_DATABASE_URL must point to a database whose name includes "test", "testing", or "_test".')
  }

  if (/^(postgres|template0|template1|my_performance_journal|performance_journal)$/i.test(databaseName)) {
    throw new Error(`Refusing to run integration tests against unsafe database name "${databaseName}".`)
  }

  return testDatabaseUrl
}

export function configureTestDatabaseEnvironment(): string {
  const originalDatabaseUrl = process.env.DATABASE_URL
  const testDatabaseUrl = validateTestDatabaseUrl({ ...process.env, DATABASE_URL: originalDatabaseUrl })

  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = testDatabaseUrl
  process.env.DEFAULT_USER_ID = process.env.DEFAULT_USER_ID ?? integrationTestUserId

  return testDatabaseUrl
}
