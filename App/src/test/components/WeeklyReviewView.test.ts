import { beforeEach, describe, expect, it, vi } from 'vitest'
import WeeklyReviewView from '@/views/WeeklyReviewView.vue'
import { mountWithAppContext } from '../test-utils'

const performanceResponses = vi.hoisted(() => ({
  fetchBackendPerformanceAnalysis: vi.fn(),
  fetchRunningPerformance: vi.fn(),
  fetchStrengthPerformance: vi.fn(),
  fetchBasketballPerformance: vi.fn(),
  fetchPerformanceTrends: vi.fn(),
}))

vi.mock('@/services/performanceApiService', () => performanceResponses)

describe('WeeklyReviewView', () => {
  beforeEach(() => {
    performanceResponses.fetchBackendPerformanceAnalysis.mockResolvedValue({
      records: [],
      weeklyReport: {
        id: 'week-1',
        weekStart: '2026-07-06',
        weekEnd: '2026-07-12',
        overallChange: 0,
        workoutsCompleted: 3,
        totalTrainingTimeMinutes: 150,
        sportDistribution: { running: 1, strength: 1, basketball: 1 },
        intensityDistribution: { easy: 1, moderate: 1, hard: 1 },
        bestPerformance: '',
        weakestArea: '',
        comparisonToPreviousWeek: 'A fuller training week.',
        trainingLoadSummary: 'Workout volume came from backend weekly review.',
        runningSummary: 'Running appeared this week.',
        strengthSummary: 'Strength appeared this week.',
        basketballSummary: 'Basketball appeared this week.',
        consistencySummary: 'Consistency was solid.',
        lessonsLearned: ['Review the inbox before drawing conclusions.'],
        suggestedFocus: 'Complete journal details.',
        insightIds: [],
        actionableInsightIds: [],
      },
    })
    performanceResponses.fetchRunningPerformance.mockResolvedValue({ sessions: [], groupedByTrainingPurpose: [], summary: {} })
    performanceResponses.fetchStrengthPerformance.mockResolvedValue({ sets: [], summary: {} })
    performanceResponses.fetchBasketballPerformance.mockResolvedValue({ sessions: [], summary: {} })
    performanceResponses.fetchPerformanceTrends.mockResolvedValue({ trends: [] })
  })

  it('renders coaching-style reflection sections', async () => {
    const { wrapper } = await mountWithAppContext(WeeklyReviewView, {}, '/weekly-review')

    expect(wrapper.text()).toContain('Week story')
    expect(wrapper.text()).toContain('Sport reflections')
    expect(wrapper.text()).toContain('Lessons learned')
    expect(wrapper.text()).toContain('Facts from Zepp, meaning from the journal')
  })
})
