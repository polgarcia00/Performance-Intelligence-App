import { computed } from 'vue'
import { usePerformanceStore } from '@/stores/performanceStore'
import { formatDate, formatDistance, formatDuration, formatNumber, formatPace } from '@/utils/formatters'

export function usePerformanceOverview() {
  const performanceStore = usePerformanceStore()

  const runningSummary = computed(() => {
    const data = performanceStore.runningPerformance ?? {}
    const sessions = data.sessions ?? []
    const groups = data.groupedByTrainingPurpose ?? []

    return {
      totalDistance: Number(data.summary?.totalDistanceMeters ?? 0) / 1000,
      averagePace: Number(data.summary?.averagePaceSecondsPerKm ?? 0),
      sessions: sessions.length,
      goalBreakdown: groups.map((group: any) => ({
        id: group.trainingPurpose,
        goal: group.trainingPurpose,
        date: `${group.workoutCount} run(s)`,
        pace: Number(group.averagePaceSecondsPerKm ?? 0),
        distanceKm: Number(group.totalDistanceMeters ?? 0) / 1000,
      })),
      labels: sessions.map((item: any) => formatDate(item.date, 'short')),
      paceValues: sessions.map((item: any) => Number(item.pace_seconds_per_km ?? 0)),
      history: sessions.map((item: any) => ({
        id: item.id,
        date: formatDate(item.date),
        detail: `${formatDistance(Number(item.distance_meters ?? 0) / 1000)} at ${formatPace(Number(item.pace_seconds_per_km ?? 0))}`,
      })),
    }
  })

  const strengthSummary = computed(() => {
    const data = performanceStore.strengthPerformance ?? {}
    const sets = data.sets ?? []
    const workoutIds = new Set(sets.map((set: any) => set.id).filter(Boolean))

    return {
      totalVolume: Number(data.summary?.totalVolumeKg ?? 0),
      bestOneRepMax: Number(data.summary?.bestEstimatedOneRepMaxKg ?? 0),
      sessions: workoutIds.size,
      labels: sets.map((set: any) => formatDate(set.date, 'short')),
      volumeValues: sets.map((set: any) => Number(set.reps ?? 0) * Number(set.weight_kg ?? 0)),
      history: sets.slice(0, 8).map((set: any, index: number) => ({
        id: `${set.id ?? 'strength'}-${index}`,
        title: set.name ?? 'Journaled strength set',
        detail: `${formatNumber(Number(set.reps ?? 0) * Number(set.weight_kg ?? 0), 'kg')} total volume`,
      })),
    }
  })

  const basketballSummary = computed(() => {
    const data = performanceStore.basketballPerformance ?? {}
    const sessions = data.sessions ?? []

    return {
      highIntensityMinutes: Number(data.summary?.totalCourtTimeSeconds ?? 0) / 60,
      averagePerformance: Number(data.summary?.averagePerformance ?? 0),
      sessions: sessions.length,
      labels: sessions.map((item: any) => formatDate(item.date, 'short')),
      highIntensityValues: sessions.map((item: any) => Number(item.high_intensity_seconds ?? item.court_time_seconds ?? item.duration_seconds ?? 0) / 60),
      history: sessions.map((item: any) => ({
        id: item.id,
        title: `${formatDate(item.date)} - ${item.session_type ?? 'imported session'}`,
        detail: `${formatDuration(Number(item.court_time_seconds ?? item.duration_seconds ?? 0) / 60)} court time`,
      })),
    }
  })

  const trendSummary = computed(() => {
    const rows = performanceStore.trends?.trends ?? []
    return {
      labels: rows.map((item: any) => formatDate(item.week_start, 'short')),
      values: rows.map((item: any) => Number(item.duration_seconds ?? 0) / 60),
      totalDurationMinutes: rows.reduce((total: number, item: any) => total + Number(item.duration_seconds ?? 0) / 60, 0),
      sessionCount: rows.reduce((total: number, item: any) => total + Number(item.sessions ?? 0), 0),
      sportCount: new Set(rows.map((item: any) => item.sport).filter(Boolean)).size,
      history: rows.map((item: any, index: number) => ({
        id: `${item.week_start}-${item.sport}-${index}`,
        title: `${formatDate(item.week_start)} - ${item.sport}`,
        detail: `${formatDuration(Number(item.duration_seconds ?? 0) / 60)} across ${item.sessions} session(s)`,
      })),
    }
  })

  return {
    runningSummary,
    strengthSummary,
    basketballSummary,
    trendSummary,
    records: computed(() => performanceStore.records),
  }
}
