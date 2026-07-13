import { beforeEach, describe, expect, it, vi } from 'vitest'
import PerformanceView from '@/views/PerformanceView.vue'
import { mountWithAppContext } from '../test-utils'

const performanceResponses = vi.hoisted(() => ({
  fetchBackendPerformanceAnalysis: vi.fn(),
  fetchRunningPerformance: vi.fn(),
  fetchStrengthPerformance: vi.fn(),
  fetchBasketballPerformance: vi.fn(),
  fetchPerformanceTrends: vi.fn(),
}))

vi.mock('@/services/performanceApiService', () => performanceResponses)

describe('PerformanceView', () => {
  beforeEach(() => {
    performanceResponses.fetchBackendPerformanceAnalysis.mockResolvedValue({
      records: [{ id: 'record-1', category: 'running', metricName: 'Longest run', value: 7200, unit: 'm', date: '2026-07-07' }],
      weeklyReport: null,
    })
    performanceResponses.fetchRunningPerformance.mockResolvedValue({
      sessions: [{ id: 'run-1', date: '2026-07-07', distance_meters: 7200, pace_seconds_per_km: 350 }],
      groupedByTrainingPurpose: [{ trainingPurpose: 'zone2', workoutCount: 1, totalDistanceMeters: 7200, averagePaceSecondsPerKm: 350 }],
      summary: { totalDistanceMeters: 7200, averagePaceSecondsPerKm: 350 },
    })
    performanceResponses.fetchStrengthPerformance.mockResolvedValue({
      sets: [{ id: 'strength-1', date: '2026-07-06', name: 'Squat', reps: 5, weight_kg: 80 }],
      summary: { totalVolumeKg: 400, bestEstimatedOneRepMaxKg: 93.3 },
    })
    performanceResponses.fetchBasketballPerformance.mockResolvedValue({
      sessions: [{ id: 'basketball-1', date: '2026-07-05', duration_seconds: 3600, court_time_seconds: 3600, session_type: 'pickup' }],
      summary: { totalCourtTimeSeconds: 3600, averagePerformance: 8 },
    })
    performanceResponses.fetchPerformanceTrends.mockResolvedValue({ trends: [{ week_start: '2026-07-06', sport: 'running', sessions: 1, duration_seconds: 2520 }] })
  })

  it('renders consolidated performance tabs and running summary', async () => {
    const { wrapper } = await mountWithAppContext(PerformanceView, {}, '/performance')

    expect(wrapper.text()).toContain('Performance')
    expect(wrapper.text()).toContain('Running')
    expect(wrapper.text()).toContain('Trends')
    expect(wrapper.text()).toContain('Total distance')
  })
})
