import { beforeEach, describe, expect, it, vi } from 'vitest'
import DashboardView from '@/views/DashboardView.vue'
import { mountWithAppContext } from '../test-utils'

const serviceMocks = vi.hoisted(() => ({
  fetchDashboardSummary: vi.fn(),
  fetchImportHistory: vi.fn(),
  performanceResponses: {
    fetchBackendPerformanceAnalysis: vi.fn(),
    fetchRunningPerformance: vi.fn(),
    fetchStrengthPerformance: vi.fn(),
    fetchBasketballPerformance: vi.fn(),
    fetchPerformanceTrends: vi.fn(),
  },
}))

vi.mock('@/services/dashboardApiService', () => ({ fetchDashboardSummary: serviceMocks.fetchDashboardSummary }))
vi.mock('@/services/importApiService', () => ({
  fetchImportHistory: serviceMocks.fetchImportHistory,
}))
vi.mock('@/services/performanceApiService', () => serviceMocks.performanceResponses)

const emptyDashboard = {
  whatHappened: {
    workoutCount: 0,
    sportDistribution: { running: 0, strength: 0, basketball: 0 },
    totalDurationSeconds: 0,
    recentWorkouts: [],
    latestImport: null,
  },
  needsAttention: { workoutsNeedingEnrichment: [], missingWorkoutDetailsCount: 0 },
  whatILearned: { insightCards: [] },
  progress: { running: { sessions: 0 }, strength: { sessions: 0 }, basketball: { sessions: 0 } },
}

describe('DashboardView', () => {
  beforeEach(() => {
    serviceMocks.fetchDashboardSummary.mockResolvedValue(emptyDashboard)
    serviceMocks.fetchImportHistory.mockResolvedValue([])
    serviceMocks.performanceResponses.fetchBackendPerformanceAnalysis.mockResolvedValue({ records: [], weeklyReport: null })
    serviceMocks.performanceResponses.fetchRunningPerformance.mockResolvedValue({ sessions: [], groupedByTrainingPurpose: [], summary: {} })
    serviceMocks.performanceResponses.fetchStrengthPerformance.mockResolvedValue({ sets: [], summary: {} })
    serviceMocks.performanceResponses.fetchBasketballPerformance.mockResolvedValue({ sessions: [], summary: {} })
    serviceMocks.performanceResponses.fetchPerformanceTrends.mockResolvedValue({ trends: [] })
  })

  it('renders an import-first empty state when no imported data exists', async () => {
    const { wrapper } = await mountWithAppContext(DashboardView)

    expect(wrapper.text()).toContain('Import Zepp workout data to start')
    expect(wrapper.text()).toContain('Import Zepp workouts')
    expect(wrapper.text()).toContain('Add a missing workout manually')
  })

  it('renders journal workflow sections after imported data exists', async () => {
    serviceMocks.fetchDashboardSummary.mockResolvedValue({
      whatHappened: {
        workoutCount: 3,
        sportDistribution: { running: 1, strength: 1, basketball: 1 },
        totalDurationSeconds: 9000,
        recentWorkouts: [{ id: 'run-1', sport: 'running', date: '2026-07-07', duration_seconds: 2520 }],
        latestImport: { file_name: 'SPORT.csv' },
      },
      needsAttention: {
        workoutsNeedingEnrichment: [{ id: 'run-1', sport: 'running', date: '2026-07-07', duration_seconds: 2520 }],
        missingWorkoutDetailsCount: 1,
      },
      whatILearned: { insightCards: [{ title: 'Review the inbox', message: 'One workout needs journal context.' }] },
      progress: { running: { sessions: 1 }, strength: { sessions: 1 }, basketball: { sessions: 1 } },
    })
    serviceMocks.fetchImportHistory.mockResolvedValue([
      {
        id: 'import-test',
        fileName: 'zepp.json',
        importedAt: new Date().toISOString(),
        summary: { running: 1, strength: 1, basketball: 1, unknown: 0 },
        savedWorkouts: 3,
        duplicateCount: 0,
        errorCount: 0,
      },
    ])
    serviceMocks.performanceResponses.fetchBackendPerformanceAnalysis.mockResolvedValue({
      records: [{ id: 'record-1', category: 'running', metricName: 'Longest run', value: 7200, unit: 'm', date: '2026-07-07' }],
      weeklyReport: { runningSummary: 'Running appeared.', strengthSummary: 'Strength appeared.', basketballSummary: 'Basketball appeared.', suggestedFocus: 'Review workouts.' },
    })
    const { wrapper } = await mountWithAppContext(DashboardView)

    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('What happened?')
    expect(wrapper.text()).toContain('What needs attention?')
    expect(wrapper.text()).toContain('What did I learn?')
    expect(wrapper.text()).toContain('How am I progressing?')
    expect(wrapper.text()).toContain('Workout Inbox')
    expect(wrapper.text()).toContain('Recent insights')
    expect(wrapper.text()).toContain('Latest imported data')
  })
})
