import { defineStore } from 'pinia'
import type {
  BasketballWorkoutEnrichment,
  ManualWorkoutInput,
  RunningWorkoutEnrichment,
  StrengthWorkoutEnrichment,
  Workout,
  WorkoutBundle,
  WorkoutType,
} from '@/types'
import {
  createManualWorkout as createManualWorkoutRequest,
  fetchWorkoutDetail,
  fetchWorkoutInbox,
  fetchWorkouts,
  type WorkoutListFilters,
} from '@/services/workoutApiService'
import { saveBasketballJournal, saveRunningJournal, saveStrengthJournal } from '@/services/journalApiService'
import { enrichStrengthEnrichment, enrichStrengthSession } from '@/utils/performanceMetrics'
import { getWorkoutJournalStatus, type WorkoutJournalStatusSummary } from '@/utils/workoutJournal'

interface WorkoutState extends WorkoutBundle {
  journalStatuses: Record<string, WorkoutJournalStatusSummary>
  isLoading: boolean
  error: string | null
}

export const useWorkoutStore = defineStore('workouts', {
  state: (): WorkoutState => ({
    workouts: [],
    runningSessions: [],
    strengthSessions: [],
    basketballSessions: [],
    runningEnrichments: [],
    strengthEnrichments: [],
    basketballEnrichments: [],
    journalStatuses: {},
    isLoading: false,
    error: null,
  }),
  getters: {
    workoutsByType: (state) => (type: WorkoutType) =>
      state.workouts.filter((workout) => workout.type === type),
    recentWorkouts: (state) =>
      [...state.workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    workoutCount: (state) => state.workouts.length,
    getWorkoutById: (state) => (workoutId: string) =>
      state.workouts.find((workout) => workout.id === workoutId),
    getEnrichmentByWorkoutId: (state) => (workoutId: string) =>
      state.runningEnrichments.find((entry) => entry.workoutId === workoutId) ??
      state.strengthEnrichments.find((entry) => entry.workoutId === workoutId) ??
      state.basketballEnrichments.find((entry) => entry.workoutId === workoutId),
    getJournalStatusByWorkoutId: (state) => (workoutId: string) => {
      if (state.journalStatuses[workoutId]) return state.journalStatuses[workoutId]

      const workout = state.workouts.find((entry) => entry.id === workoutId)
      if (!workout) return null

      const enrichment =
        state.runningEnrichments.find((entry) => entry.workoutId === workoutId) ??
        state.strengthEnrichments.find((entry) => entry.workoutId === workoutId) ??
        state.basketballEnrichments.find((entry) => entry.workoutId === workoutId)

      return getWorkoutJournalStatus(workout, enrichment)
    },
    workoutsNeedingEnrichment: (state) =>
      state.workouts.filter((workout) => {
        const enrichment =
          state.runningEnrichments.find((entry) => entry.workoutId === workout.id) ??
          state.strengthEnrichments.find((entry) => entry.workoutId === workout.id) ??
          state.basketballEnrichments.find((entry) => entry.workoutId === workout.id)

        return getWorkoutJournalStatus(workout, enrichment).status !== 'completed'
      }),
    recentlyEnrichedWorkouts: (state) => {
      const enrichedIds = [
        ...state.runningEnrichments,
        ...state.strengthEnrichments,
        ...state.basketballEnrichments,
      ]
        .filter((entry) => Boolean(entry.updatedAt))
        .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
        .map((entry) => entry.workoutId)

      return enrichedIds
        .map((workoutId) => state.workouts.find((workout) => workout.id === workoutId))
        .filter((workout): workout is Workout => Boolean(workout))
        .slice(0, 5)
    },
  },
  actions: {
    applyWorkoutBundle(bundle: WorkoutBundle & { journalStatuses?: Record<string, WorkoutJournalStatusSummary> }) {
      this.workouts = bundle.workouts
      this.runningSessions = bundle.runningSessions
      this.strengthSessions = bundle.strengthSessions.map(enrichStrengthSession)
      this.basketballSessions = bundle.basketballSessions
      this.runningEnrichments = bundle.runningEnrichments
      this.strengthEnrichments = bundle.strengthEnrichments.map(enrichStrengthEnrichment)
      this.basketballEnrichments = bundle.basketballEnrichments
      this.journalStatuses = bundle.journalStatuses ?? {}
    },
    mergeWorkoutDetail(bundle: WorkoutBundle & { journalStatuses?: Record<string, WorkoutJournalStatusSummary> }) {
      const incomingIds = new Set(bundle.workouts.map((workout) => workout.id))
      const replaceByWorkoutId = <T extends { workoutId: string }>(current: T[], incoming: T[]) => [
        ...incoming,
        ...current.filter((entry) => !incomingIds.has(entry.workoutId)),
      ]

      this.workouts = [...bundle.workouts, ...this.workouts.filter((workout) => !incomingIds.has(workout.id))]
      this.runningSessions = replaceByWorkoutId(this.runningSessions, bundle.runningSessions)
      this.strengthSessions = replaceByWorkoutId(this.strengthSessions, bundle.strengthSessions.map(enrichStrengthSession))
      this.basketballSessions = replaceByWorkoutId(this.basketballSessions, bundle.basketballSessions)
      this.runningEnrichments = replaceByWorkoutId(this.runningEnrichments, bundle.runningEnrichments)
      this.strengthEnrichments = replaceByWorkoutId(this.strengthEnrichments, bundle.strengthEnrichments.map(enrichStrengthEnrichment))
      this.basketballEnrichments = replaceByWorkoutId(this.basketballEnrichments, bundle.basketballEnrichments)
      this.journalStatuses = { ...this.journalStatuses, ...(bundle.journalStatuses ?? {}) }
    },
    async loadWorkouts(filters: WorkoutListFilters = { pageSize: 50 }) {
      this.isLoading = true
      this.error = null

      try {
        const bundle = await fetchWorkouts(filters)
        this.applyWorkoutBundle(bundle)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to load workout data.'
      } finally {
        this.isLoading = false
      }
    },
    async loadInbox(filters: WorkoutListFilters = { pageSize: 50 }) {
      this.isLoading = true
      this.error = null

      try {
        const bundle = await fetchWorkoutInbox(filters)
        this.applyWorkoutBundle(bundle)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to load workout inbox.'
      } finally {
        this.isLoading = false
      }
    },
    async loadWorkoutById(workoutId: string) {
      this.isLoading = true
      this.error = null

      try {
        this.mergeWorkoutDetail(await fetchWorkoutDetail(workoutId))
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to load workout details.'
      } finally {
        this.isLoading = false
      }
    },
    async createManualWorkout(input: ManualWorkoutInput): Promise<Workout> {
      this.isLoading = true
      this.error = null

      try {
        const detail = await createManualWorkoutRequest(input)
        const workout = detail.workouts[0]
        if (!workout) throw new Error('The saved workout could not be loaded.')

        this.mergeWorkoutDetail(detail)
        return workout
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to save the missing workout.'
        throw error
      } finally {
        this.isLoading = false
      }
    },
    async updateRunningEnrichment(workoutId: string, enrichment: Partial<RunningWorkoutEnrichment>) {
      await saveRunningJournal(workoutId, enrichment)
      const next = { workoutId, ...enrichment, updatedAt: new Date().toISOString() }
      this.runningEnrichments = [next, ...this.runningEnrichments.filter((entry) => entry.workoutId !== workoutId)]
      await this.loadWorkoutById(workoutId)
    },
    async updateStrengthEnrichment(workoutId: string, enrichment: Partial<StrengthWorkoutEnrichment>) {
      await saveStrengthJournal(workoutId, enrichment)
      const next = enrichStrengthEnrichment({
        workoutId,
        exercises: [],
        ...enrichment,
        updatedAt: new Date().toISOString(),
      })
      this.strengthEnrichments = [next, ...this.strengthEnrichments.filter((entry) => entry.workoutId !== workoutId)]
      await this.loadWorkoutById(workoutId)
    },
    async updateBasketballEnrichment(workoutId: string, enrichment: Partial<BasketballWorkoutEnrichment>) {
      await saveBasketballJournal(workoutId, enrichment)
      const next = { workoutId, ...enrichment, updatedAt: new Date().toISOString() }
      this.basketballEnrichments = [next, ...this.basketballEnrichments.filter((entry) => entry.workoutId !== workoutId)]
      await this.loadWorkoutById(workoutId)
    },
  },
})
