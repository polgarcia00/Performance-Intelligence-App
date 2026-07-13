import type { Sport } from '../types/domain.js'

const sportTypeMap: Record<string, Sport> = {
  '1': 'running',
  '6': 'running',
  '52': 'strength',
  '85': 'basketball',
}

export function mapZeppSportType(code: unknown): Sport {
  const normalized = String(code ?? '').trim()
  return sportTypeMap[normalized] ?? 'unknown'
}

export function isKnownSportType(code: unknown): boolean {
  return mapZeppSportType(code) !== 'unknown'
}
