import { config as loadDotenv } from 'dotenv'

loadDotenv()

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://localhost:5432/my_performance_journal',
  port: readNumber('PORT', 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  uploadSizeLimit: readNumber('UPLOAD_SIZE_LIMIT', 5_242_880),
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
  importPreviewTtlSeconds: readNumber('IMPORT_PREVIEW_TTL_SECONDS', 1800),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  defaultUserId: process.env.DEFAULT_USER_ID ?? '00000000-0000-0000-0000-000000000001',
}

export function isProduction(): boolean {
  return env.nodeEnv === 'production'
}
