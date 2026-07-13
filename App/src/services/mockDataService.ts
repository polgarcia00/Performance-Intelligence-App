import type { PerformanceAppState, StrengthSession, Workout, ZeppImportFile } from '@/types'
import { enrichStrengthSession } from '@/utils/performanceMetrics'
import { daysAgo } from '@/utils/dateRanges'

const MOCK_API_URL = '/api/mock/performance-state'
const MOCK_ZEPP_EXPORT_URL = '/api/mock/zepp-export'

function workout(id: string, type: Workout['type'], days: number, durationMinutes: number, overrides: Partial<Workout> = {}): Workout {
  return {
    id,
    type,
    date: daysAgo(days),
    durationMinutes,
    source: 'mock',
    perceivedEffort: 6,
    ...overrides,
  }
}

export function createMockPerformanceState(): PerformanceAppState {
  const workouts: Workout[] = [
    workout('run-1', 'running', 3, 42, {
      averageHeartRate: 142,
      maxHeartRate: 171,
      calories: 420,
      perceivedEffort: 6,
    }),
    workout('strength-1', 'strength', 2, 58, {
      averageHeartRate: 112,
      maxHeartRate: 151,
      calories: 360,
      perceivedEffort: 7,
    }),
    workout('basketball-1', 'basketball', 1, 72, {
      averageHeartRate: 151,
      maxHeartRate: 186,
      calories: 680,
      perceivedEffort: 8,
    }),
    workout('run-2', 'running', 9, 36, {
      averageHeartRate: 145,
      maxHeartRate: 169,
      calories: 370,
      perceivedEffort: 6,
    }),
    workout('strength-2', 'strength', 8, 52, {
      averageHeartRate: 109,
      maxHeartRate: 144,
      calories: 320,
      perceivedEffort: 6,
    }),
    workout('basketball-2', 'basketball', 6, 64, {
      averageHeartRate: 154,
      maxHeartRate: 184,
      calories: 610,
      perceivedEffort: 8,
    }),
  ]

  const strengthSessions: StrengthSession[] = [
    enrichStrengthSession({
      workoutId: 'strength-1',
      totalVolumeKg: 0,
      primaryMuscleGroups: ['Legs', 'Core'],
      sessionType: 'lower',
      exercises: [
        {
          id: 'exercise-squat-1',
          workoutId: 'strength-1',
          name: 'Back squat',
          muscleGroup: 'Legs',
          sets: [
            { id: 'set-squat-1', setNumber: 1, reps: 5, weightKg: 80 },
            { id: 'set-squat-2', setNumber: 2, reps: 5, weightKg: 82.5 },
            { id: 'set-squat-3', setNumber: 3, reps: 4, weightKg: 85 },
          ],
        },
        {
          id: 'exercise-rdl-1',
          workoutId: 'strength-1',
          name: 'Romanian deadlift',
          muscleGroup: 'Legs',
          sets: [
            { id: 'set-rdl-1', setNumber: 1, reps: 8, weightKg: 70 },
            { id: 'set-rdl-2', setNumber: 2, reps: 8, weightKg: 70 },
          ],
        },
      ],
    }),
    enrichStrengthSession({
      workoutId: 'strength-2',
      totalVolumeKg: 0,
      primaryMuscleGroups: ['Chest', 'Back'],
      sessionType: 'upper',
      exercises: [
        {
          id: 'exercise-bench-1',
          workoutId: 'strength-2',
          name: 'Bench press',
          muscleGroup: 'Chest',
          sets: [
            { id: 'set-bench-1', setNumber: 1, reps: 6, weightKg: 62.5 },
            { id: 'set-bench-2', setNumber: 2, reps: 6, weightKg: 62.5 },
          ],
        },
      ],
    }),
  ]

  return {
    workouts,
    runningSessions: [
      {
        workoutId: 'run-1',
        distanceKm: 7.2,
        paceSecondsPerKm: 350,
        vo2Max: 48,
        cadence: 171,
        zone1Minutes: 5,
        zone2Minutes: 24,
        zone3Minutes: 10,
        zone4Minutes: 3,
        runType: 'easy',
      },
      {
        workoutId: 'run-2',
        distanceKm: 6.1,
        paceSecondsPerKm: 365,
        vo2Max: 47,
        cadence: 168,
        zone1Minutes: 4,
        zone2Minutes: 20,
        zone3Minutes: 9,
        zone4Minutes: 3,
        runType: 'tempo',
      },
    ],
    strengthSessions,
    basketballSessions: [
      {
        workoutId: 'basketball-1',
        sessionType: 'pickup',
        highIntensityMinutes: 24,
        explosiveEffortEstimate: 78,
        perceivedPerformance: 8,
        courtTimeMinutes: 68,
      },
      {
        workoutId: 'basketball-2',
        sessionType: 'practice',
        highIntensityMinutes: 19,
        explosiveEffortEstimate: 72,
        perceivedPerformance: 7,
        courtTimeMinutes: 58,
      },
    ],
    runningEnrichments: [
      {
        workoutId: 'run-1',
        goal: 'zone2',
        perceivedEffort: 6,
        perceivedPerformance: 7,
        routeType: 'road',
        feltStrong: true,
        notes: 'Smooth aerobic effort.',
      },
    ],
    strengthEnrichments: [
      {
        workoutId: 'strength-1',
        sessionType: 'lower',
        exercises: [
          {
            id: 'enrich-exercise-squat-1',
            name: 'Back squat',
            muscleGroup: 'Legs',
            sets: [
              { id: 'enrich-set-squat-1', setNumber: 1, reps: 5, weightKg: 80 },
              { id: 'enrich-set-squat-2', setNumber: 2, reps: 5, weightKg: 82.5 },
            ],
          },
        ],
      },
    ],
    basketballEnrichments: [
      {
        workoutId: 'basketball-1',
        sessionType: 'pickup',
        perceivedPerformance: 8,
        perceivedEffort: 8,
        energyLevel: 7,
        shootingQuality: 8,
        defenseQuality: 7,
        explosiveness: 8,
        role: 'balanced',
        outcome: 'unknown',
      },
    ],
    performanceScores: [],
    personalRecords: [],
    insights: [],
    weeklyReports: [],
    trainingLoads: [],
  }
}

export async function fetchMockPerformanceState(): Promise<PerformanceAppState> {
  if (typeof window === 'undefined') {
    return createMockPerformanceState()
  }

  try {
    const response = await window.fetch(MOCK_API_URL)
    if (!response.ok) {
      return createMockPerformanceState()
    }

    return (await response.json()) as PerformanceAppState
  } catch {
    return createMockPerformanceState()
  }
}

export function createMockZeppExport(): string {
  return JSON.stringify(
    {
      workouts: [
        {
          date: '2026-07-06',
          sport: 'running',
          durationMinutes: 42,
          distanceKm: 7.2,
          averageHeartRate: 142,
          maxHeartRate: 171,
          calories: 420,
          cadence: 171,
          zone2Minutes: 24,
        },
        {
          date: '2026-07-07',
          sport: 'basketball',
          durationMinutes: 72,
          averageHeartRate: 151,
          maxHeartRate: 186,
          calories: 680,
          highIntensityMinutes: 24,
          perceivedPerformance: 8,
        },
        {
          date: '2026-07-05',
          sport: 'strength',
          durationMinutes: 58,
          averageHeartRate: 112,
          maxHeartRate: 151,
          exerciseName: 'Back squat',
          muscleGroup: 'Legs',
          sets: 3,
          reps: 5,
          weightKg: 82.5,
        },
      ],
    },
    null,
    2,
  )
}

export function createMockZeppExportFiles(): ZeppImportFile[] {
  return [
    {
      fileName: 'SPORT/SPORT_sample.csv',
      content: [
        'type,startTime,sportTime(s),maxPace(/meter),minPace(/meter),distance(m),avgPace(/meter),calories(kcal)',
        '1,2026-07-06 18:03:16+0000,2520,3.4,2.2,7200,2.86,420',
        '85,2026-07-07 18:03:16+0000,4320,0,0,0,0,680',
        '52,2026-07-05 17:15:00+0000,3480,0,0,0,0,360',
        '999,2026-07-04 17:15:00+0000,1800,0,0,500,0,120',
      ].join('\n'),
    },
  ]
}

export async function fetchMockZeppExport(): Promise<string> {
  if (typeof window === 'undefined') {
    return createMockZeppExport()
  }

  try {
    const response = await window.fetch(MOCK_ZEPP_EXPORT_URL)
    if (!response.ok) {
      return createMockZeppExport()
    }

    return response.text()
  } catch {
    return createMockZeppExport()
  }
}

export async function fetchMockZeppExportFiles(): Promise<ZeppImportFile[]> {
  if (typeof window === 'undefined') {
    return createMockZeppExportFiles()
  }

  try {
    const response = await window.fetch(MOCK_ZEPP_EXPORT_URL)
    if (!response.ok) {
      return createMockZeppExportFiles()
    }

    const text = await response.text()
    try {
      const parsed = JSON.parse(text) as unknown
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === 'object' && item !== null && 'fileName' in item && 'content' in item)
      ) {
        return parsed as ZeppImportFile[]
      }
    } catch {
      return [{ fileName: 'sample-zepp-export.json', content: text }]
    }

    return createMockZeppExportFiles()
  } catch {
    return createMockZeppExportFiles()
  }
}
