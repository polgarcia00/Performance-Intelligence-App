import { DAYS_PER_WEEK, PREVIOUS_DAYS, RECENT_DAYS } from '@/constants/performance'

export interface DateRange {
  start: string
  end: string
  label: string
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`)
}

export function addDays(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

export function daysAgo(days: number, now = new Date()): string {
  const date = new Date(now)
  date.setDate(date.getDate() - days)
  return toDateKey(date)
}

export function todayKey(now = new Date()): string {
  return toDateKey(now)
}

export function isWithinRange(dateKey: string, range: DateRange): boolean {
  return dateKey >= range.start && dateKey <= range.end
}

export function getRecentRange(days = RECENT_DAYS, now = new Date()): DateRange {
  return {
    start: daysAgo(days - 1, now),
    end: todayKey(now),
    label: `Last ${days} days`,
  }
}

export function getPreviousRange(days = PREVIOUS_DAYS, now = new Date()): DateRange {
  const recentStart = daysAgo(days - 1, now)
  return {
    start: addDays(recentStart, -days),
    end: addDays(recentStart, -1),
    label: `Previous ${days} days`,
  }
}

export function getWeekRange(dateKey = todayKey()): DateRange {
  const date = parseDateKey(dateKey)
  const day = date.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diffToMonday)
  const start = toDateKey(date)

  return {
    start,
    end: addDays(start, DAYS_PER_WEEK - 1),
    label: 'This week',
  }
}

export function getPreviousWeekRange(dateKey = todayKey()): DateRange {
  const currentWeek = getWeekRange(dateKey)
  const start = addDays(currentWeek.start, -DAYS_PER_WEEK)
  return {
    start,
    end: addDays(start, DAYS_PER_WEEK - 1),
    label: 'Previous week',
  }
}

export function daysBetween(start: string, end: string): number {
  return Math.round((parseDateKey(end).getTime() - parseDateKey(start).getTime()) / DAY_IN_MS) + 1
}

