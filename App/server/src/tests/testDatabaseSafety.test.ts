import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateTestDatabaseUrl } from '../database/testDatabaseSafety.js'

describe('test database safety checks', () => {
  it('requires TEST_DATABASE_URL', () => {
    assert.throws(() => validateTestDatabaseUrl({}), /TEST_DATABASE_URL is required/)
  })

  it('rejects the development DATABASE_URL', () => {
    const databaseUrl = 'postgres://localhost:5432/my_performance_journal_test'
    assert.throws(
      () => validateTestDatabaseUrl({ TEST_DATABASE_URL: databaseUrl, DATABASE_URL: databaseUrl }),
      /must not match DATABASE_URL/,
    )
  })

  it('requires an obvious test database name', () => {
    assert.throws(
      () => validateTestDatabaseUrl({ TEST_DATABASE_URL: 'postgres://localhost:5432/my_performance_journal' }),
      /must point to a database whose name includes/,
    )
  })

  it('accepts a clearly isolated test database', () => {
    const databaseUrl = 'postgres://localhost:5432/my_performance_journal_test'
    assert.equal(validateTestDatabaseUrl({ TEST_DATABASE_URL: databaseUrl }), databaseUrl)
  })
})
