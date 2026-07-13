export function dateKey(value: string | Date | undefined): string | undefined {
  if (!value) return undefined
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    const direct = String(value).match(/\d{4}-\d{2}-\d{2}/)?.[0]
    return direct
  }
  return parsed.toISOString().slice(0, 10)
}

export function isoDateTime(value: string | undefined): string | undefined {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

export function getWeekRange(date = new Date()): { weekStart: string; weekEnd: string } {
  const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = current.getUTCDay() || 7
  current.setUTCDate(current.getUTCDate() - day + 1)
  const weekStart = current.toISOString().slice(0, 10)
  current.setUTCDate(current.getUTCDate() + 6)
  return { weekStart, weekEnd: current.toISOString().slice(0, 10) }
}

export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000)
}
