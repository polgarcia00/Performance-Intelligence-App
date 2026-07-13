import { Pool } from 'pg'
import { env } from '../config/env.js'

export const pool = new Pool({
  connectionString: env.databaseUrl,
})

export async function query<T = unknown>(text: string, params: unknown[] = []): Promise<{ rows: T[]; rowCount: number }> {
  return pool.query(text, params)
}

export async function transaction<T>(work: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function checkDatabase(): Promise<{ ok: boolean; message: string }> {
  try {
    await query('select 1 as ok')
    return { ok: true, message: 'connected' }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'database check failed',
    }
  }
}

export async function closePool(): Promise<void> {
  await pool.end()
}
