import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { query, closePool } from './pool.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(currentDir, '../../migrations')

export async function runMigrations(): Promise<void> {
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort()

  await query(`
    create table if not exists schema_migrations (
      file_name text primary key,
      applied_at timestamptz not null default now()
    )
  `)

  for (const file of files) {
    const existing = await query('select file_name from schema_migrations where file_name = $1', [file])
    if (existing.rowCount > 0) continue

    const sql = await readFile(join(migrationsDir, file), 'utf8')
    await query(sql)
    await query('insert into schema_migrations (file_name) values ($1)', [file])
    console.log(`Applied migration ${file}`)
  }
}

if (process.env.NODE_ENV !== 'test' && fileURLToPath(import.meta.url) === process.argv?.[1]) {
  runMigrations()
    .then(() => closePool())
    .catch((error) => {
      console.error(error)
      closePool().finally(() => process.exit(1))
    })
}
