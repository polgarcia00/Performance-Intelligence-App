import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { query, closePool } from './pool.js'

const currentDir = dirname(fileURLToPath(import.meta.url))
const seedsDir = join(currentDir, '../../seeds')

export async function runSeeds(): Promise<void> {
  const files = (await readdir(seedsDir)).filter((file) => file.endsWith('.sql')).sort()
  for (const file of files) {
    const sql = await readFile(join(seedsDir, file), 'utf8')
    await query(sql)
    console.log(`Applied seed ${file}`)
  }
}

if (process.env.NODE_ENV !== 'test' && fileURLToPath(import.meta.url) === process.argv?.[1]) {
  runSeeds()
    .then(() => closePool())
    .catch((error) => {
      console.error(error)
      closePool().finally(() => process.exit(1))
    })
}
