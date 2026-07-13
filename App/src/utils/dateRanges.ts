export function todayKey(now = new Date()): string {
  return now.toISOString().slice(0, 10)
}

export function localDateTimeKey(now = new Date()): string {
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return localTime.toISOString().slice(0, 16)
}
