const STORAGE_PREFIX = 'performance-intelligence'

// Browser persistence is limited to UI preferences and legacy migration backups.
// PostgreSQL remains the durable source of truth for workouts, imports, and journals.
export function readPersistedState<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(`${STORAGE_PREFIX}:${key}`)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as T
  } catch {
    return null
  }
}

export function writePersistedState<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(value))
}

export function clearAllPersistedState(): void {
  if (typeof window === 'undefined') {
    return
  }

  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(`${STORAGE_PREFIX}:`))
    .forEach((key) => window.localStorage.removeItem(key))
}
