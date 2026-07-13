<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import WorkoutEnrichmentForm from '@/components/forms/WorkoutEnrichmentForm.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import { useWorkoutStore } from '@/stores/workoutStore'
import type { BasketballWorkoutEnrichment, RunningWorkoutEnrichment, StrengthWorkoutEnrichment } from '@/types'
import { formatCalories, formatDate, formatDistance, formatDuration, formatHeartRate, formatPace } from '@/utils/formatters'

const route = useRoute()
const workoutStore = useWorkoutStore()
const successMessage = ref('')

const workoutId = computed(() => String(route.params.id ?? ''))
const workout = computed(() => workoutStore.getWorkoutById(workoutId.value))
const runningSession = computed(() => workoutStore.runningSessions.find((session) => session.workoutId === workoutId.value))
const basketballSession = computed(() => workoutStore.basketballSessions.find((session) => session.workoutId === workoutId.value))
const runningEnrichment = computed(() => workoutStore.runningEnrichments.find((entry) => entry.workoutId === workoutId.value))
const strengthEnrichment = computed(() => workoutStore.strengthEnrichments.find((entry) => entry.workoutId === workoutId.value))
const basketballEnrichment = computed(() => workoutStore.basketballEnrichments.find((entry) => entry.workoutId === workoutId.value))
const journalStatus = computed(() => workout.value ? workoutStore.getJournalStatusByWorkoutId(workout.value.id) : null)

onMounted(() => {
  if (workoutId.value) {
    void workoutStore.loadWorkoutById(workoutId.value)
  }
})

async function saveRunning(enrichment: RunningWorkoutEnrichment) {
  await workoutStore.updateRunningEnrichment(workoutId.value, enrichment)
  successMessage.value = 'Running details saved.'
}

async function saveStrength(enrichment: StrengthWorkoutEnrichment) {
  await workoutStore.updateStrengthEnrichment(workoutId.value, enrichment)
  successMessage.value = 'Strength details saved.'
}

async function saveBasketball(enrichment: BasketballWorkoutEnrichment) {
  await workoutStore.updateBasketballEnrichment(workoutId.value, enrichment)
  successMessage.value = 'Basketball details saved.'
}
</script>

<template>
  <PageContainer
    title="Workout Details"
    eyebrow="Objective data + journal meaning"
    description="Review imported Zepp facts, then record what the workout meant."
  >
    <BaseEmptyState v-if="!workout" title="Workout not found" message="Import Zepp workouts or choose another workout.">
      <RouterLink to="/workouts"><BaseButton>Back to workouts</BaseButton></RouterLink>
    </BaseEmptyState>

    <template v-else>
      <BaseCard title="Objective Zepp Data" subtitle="Imported data is read-only here and is never overwritten by journal edits.">
        <div class="objective-grid">
          <div>
            <span>Sport</span>
            <strong>{{ workout.type }}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{{ formatDate(workout.date) }}</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>{{ formatDuration(workout.durationMinutes) }}</strong>
          </div>
          <div>
            <span>Source</span>
            <strong>{{ workout.source }}</strong>
          </div>
          <div v-if="workout.calories">
            <span>Calories</span>
            <strong>{{ formatCalories(workout.calories) }}</strong>
          </div>
          <div v-if="workout.distanceKm || runningSession?.distanceKm">
            <span>Distance</span>
            <strong>{{ formatDistance(workout.distanceKm ?? runningSession?.distanceKm) }}</strong>
          </div>
          <div v-if="runningSession?.paceSecondsPerKm">
            <span>Pace</span>
            <strong>{{ formatPace(runningSession.paceSecondsPerKm) }}</strong>
          </div>
          <div v-if="workout.averageHeartRate">
            <span>Average HR</span>
            <strong>{{ formatHeartRate(workout.averageHeartRate) }}</strong>
          </div>
          <div v-if="workout.maxHeartRate">
            <span>Max HR</span>
            <strong>{{ formatHeartRate(workout.maxHeartRate) }}</strong>
          </div>
          <div v-if="basketballSession?.courtTimeMinutes">
            <span>Court time</span>
            <strong>{{ formatDuration(basketballSession.courtTimeMinutes) }}</strong>
          </div>
        </div>
      </BaseCard>

      <BaseCard title="Journal Entry" subtitle="This editable context is saved separately from objective Zepp data.">
        <div v-if="journalStatus" class="journal-status">
          <BaseBadge :tone="journalStatus.tone">{{ journalStatus.label }}</BaseBadge>
          <span>{{ journalStatus.missingFields.length ? `Missing: ${journalStatus.missingFields.join(', ')}` : 'Journal context is complete enough for analysis.' }}</span>
        </div>
        <p v-if="successMessage" role="status" class="form-alert form-alert--success">{{ successMessage }}</p>
        <WorkoutEnrichmentForm
          :workout="workout"
          :running-enrichment="runningEnrichment"
          :strength-enrichment="strengthEnrichment"
          :basketball-enrichment="basketballEnrichment"
          @save-running="saveRunning"
          @save-strength="saveStrength"
          @save-basketball="saveBasketball"
        />
      </BaseCard>
    </template>
  </PageContainer>
</template>

<style scoped>
.objective-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-3);
}

.objective-grid div {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
}

.objective-grid span {
  display: block;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.objective-grid strong {
  display: block;
  margin-top: var(--space-1);
  text-transform: capitalize;
}

.journal-status {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  margin-bottom: var(--space-4);
  color: var(--color-text-muted);
}
</style>
