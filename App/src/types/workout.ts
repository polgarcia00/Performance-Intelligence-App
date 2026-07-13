export type WorkoutType = 'running' | 'strength' | 'basketball'
export type WorkoutSource = 'manual' | 'mock' | 'csv' | 'zepp' | 'appleHealth' | 'healthConnect'

export interface ManualWorkoutInput {
  sport: WorkoutType
  startedAt: string
  durationSeconds: number
  distanceMeters?: number
  calories?: number
  averageHeartRate?: number
  maxHeartRate?: number
}

export interface Workout {
  id: string
  type: WorkoutType
  date: string
  startTime?: string
  durationMinutes: number
  source: WorkoutSource
  distanceKm?: number
  averageHeartRate?: number
  maxHeartRate?: number
  calories?: number
  trainingLoad?: number
  perceivedEffort?: number
  notes?: string
}

export type RunningSessionType = 'easy' | 'tempo' | 'intervals' | 'long' | 'race' | 'other'
export type RunningGoal = 'maxEffort' | 'longRun' | 'zone2' | 'tempo' | 'intervals' | 'casualJog' | 'recoveryRun' | 'other'

export interface RunningSession {
  workoutId: string
  distanceKm: number
  paceSecondsPerKm?: number
  averageSpeedMetersPerSecond?: number
  maxSpeedMetersPerSecond?: number
  minSpeedMetersPerSecond?: number
  vo2Max?: number
  cadence?: number
  zone1Minutes?: number
  zone2Minutes?: number
  zone3Minutes?: number
  zone4Minutes?: number
  zone5Minutes?: number
  runType?: RunningSessionType
}

export interface RunningWorkoutEnrichment {
  workoutId: string
  goal?: RunningGoal
  perceivedEffort?: number
  perceivedPerformance?: number
  routeType?: 'road' | 'trail' | 'track' | 'treadmill' | 'mixed'
  feltStrong?: boolean
  notes?: string
  updatedAt?: string
}

export interface StrengthSet {
  id: string
  setNumber: number
  reps: number
  weightKg: number
  rpe?: number
  estimatedOneRepMaxKg?: number
}

export interface StrengthExercise {
  id: string
  workoutId: string
  name: string
  muscleGroup: string
  sets: StrengthSet[]
}

export interface StrengthSession {
  workoutId: string
  exercises: StrengthExercise[]
  totalVolumeKg: number
  primaryMuscleGroups: string[]
  sessionType?: 'upper' | 'lower' | 'fullBody' | 'push' | 'pull' | 'legs' | 'other'
}

export interface StrengthEnrichmentSet {
  id: string
  setNumber: number
  reps: number
  weightKg: number
  rpe?: number
  estimatedOneRepMaxKg?: number
}

export interface StrengthEnrichmentExercise {
  id: string
  name: string
  muscleGroup?: string
  sets: StrengthEnrichmentSet[]
}

export interface StrengthWorkoutEnrichment {
  workoutId: string
  sessionType?: 'upper' | 'lower' | 'fullBody' | 'push' | 'pull' | 'legs' | 'other'
  exercises: StrengthEnrichmentExercise[]
  notes?: string
  updatedAt?: string
}

export interface BasketballSession {
  workoutId: string
  sessionType?: 'game' | 'pickup' | 'practice' | 'shootaround' | 'conditioning'
  highIntensityMinutes?: number
  explosiveEffortEstimate?: number
  perceivedPerformance?: number
  courtTimeMinutes?: number
}

export interface BasketballWorkoutEnrichment {
  workoutId: string
  sessionType?: 'game' | 'pickup' | 'practice' | 'shootaround' | 'conditioning'
  perceivedPerformance?: number
  perceivedEffort?: number
  energyLevel?: number
  shootingQuality?: number
  defenseQuality?: number
  explosiveness?: number
  role?: 'primaryScorer' | 'facilitator' | 'defender' | 'rebounder' | 'balanced' | 'other'
  outcome?: 'win' | 'loss' | 'unknown'
  notes?: string
  updatedAt?: string
}

export interface WorkoutBundle {
  workouts: Workout[]
  runningSessions: RunningSession[]
  strengthSessions: StrengthSession[]
  basketballSessions: BasketballSession[]
  runningEnrichments: RunningWorkoutEnrichment[]
  strengthEnrichments: StrengthWorkoutEnrichment[]
  basketballEnrichments: BasketballWorkoutEnrichment[]
}
