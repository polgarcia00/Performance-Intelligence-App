<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import WorkoutTrendChart from '@/components/charts/WorkoutTrendChart.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import { useImportHistoryStore } from '@/stores/importHistoryStore'
import { usePerformanceStore } from '@/stores/performanceStore'
import { formatDate, formatDuration } from '@/utils/formatters'

const dashboardStore = useDashboardStore()
const performanceStore = usePerformanceStore()
const importHistoryStore = useImportHistoryStore()

onMounted(async () => {
  await Promise.all([
    dashboardStore.loadSummary(),
    performanceStore.loadBackendAnalysis(),
    importHistoryStore.loadHistory(),
  ])
})

const summary = computed(() => dashboardStore.summary)
const hasWorkoutData = computed(() => dashboardStore.hasWorkouts || importHistoryStore.hasImports)
const latestImport = computed(() => importHistoryStore.latestImport)
const recentWorkouts = computed(() => summary.value?.whatHappened?.recentWorkouts ?? [])
const workoutsNeedingReview = computed(() => summary.value?.needsAttention?.workoutsNeedingEnrichment ?? [])
const totalNeedingReview = computed(() => summary.value?.needsAttention?.missingWorkoutDetailsCount ?? 0)
const weeklyWorkoutDuration = computed(() => Number(summary.value?.whatHappened?.totalDurationSeconds ?? 0) / 60)
const weeklyWorkoutCount = computed(() => Number(summary.value?.whatHappened?.workoutCount ?? 0))
const weeklyWorkoutLabel = computed(() => `${weeklyWorkoutCount.value} ${weeklyWorkoutCount.value === 1 ? 'workout' : 'workouts'}`)
const weeklyReport = computed(() => performanceStore.weeklyReport)
const insightCards = computed(() => summary.value?.whatILearned?.insightCards ?? [])
const sportDistribution = computed(() => summary.value?.whatHappened?.sportDistribution ?? { running: 0, strength: 0, basketball: 0 })
const weeklyLoadData = computed(() => ({
  labels: ['Running', 'Strength', 'Basketball'],
  values: [sportDistribution.value.running ?? 0, sportDistribution.value.strength ?? 0, sportDistribution.value.basketball ?? 0],
}))
</script>

<template>
  <PageContainer
    title="Dashboard"
    eyebrow="My Performance Journal"
    description="A training diary for imported Zepp data, workout review, reflection, and long-term athletic meaning."
  >
    <template #actions>
      <div class="metric-row">
        <RouterLink to="/import"><BaseButton>Import Zepp workout data</BaseButton></RouterLink>
        <RouterLink to="/workouts"><BaseButton variant="secondary">Open Workout Inbox</BaseButton></RouterLink>
      </div>
    </template>

    <BaseEmptyState
      v-if="!hasWorkoutData"
      title="Import Zepp workout data to start"
      message="Zepp records what happened. My Performance Journal starts once those workouts are imported and reviewed."
    >
      <div class="metric-row">
        <RouterLink to="/import"><BaseButton>Import Zepp workouts</BaseButton></RouterLink>
        <RouterLink to="/workouts/add-missing"><BaseButton variant="secondary">Add a missing workout manually</BaseButton></RouterLink>
      </div>
    </BaseEmptyState>

    <template v-else>
      <section class="journal-section">
        <h2>What happened?</h2>
        <div class="two-column-grid">
          <BaseCard title="Recent workouts" subtitle="Objective workout facts">
            <div class="mini-list">
              <RouterLink v-for="workout in recentWorkouts" :key="workout.id" :to="`/workouts/${workout.id}`">
                <strong>{{ workout.sport }}</strong>
                <span>{{ formatDate(workout.date) }} · {{ formatDuration(Number(workout.duration_seconds ?? 0) / 60) }}</span>
              </RouterLink>
            </div>
          </BaseCard>

          <BaseCard title="Weekly volume" subtitle="Workout volume this week">
            <div class="summary-line">
              <strong>{{ formatDuration(weeklyWorkoutDuration) }}</strong>
              <span>{{ weeklyWorkoutLabel }} in your journal</span>
            </div>
            <WorkoutTrendChart title="Weekly sport distribution" :labels="weeklyLoadData.labels" :values="weeklyLoadData.values" />
          </BaseCard>
        </div>

        <BaseCard v-if="latestImport" title="Latest imported data" :subtitle="latestImport.fileName">
          <div class="import-summary">
            <span>{{ latestImport.savedWorkouts }} workouts saved</span>
            <span>{{ latestImport.duplicateCount }} duplicates skipped</span>
            <span>{{ latestImport.errorCount }} import messages</span>
          </div>
        </BaseCard>
      </section>

      <section class="journal-section">
        <h2>What needs attention?</h2>
        <div class="two-column-grid">
          <BaseCard title="Workout Inbox" :subtitle="`${totalNeedingReview} workouts waiting for review`">
            <div v-if="workoutsNeedingReview.length" class="review-list">
              <article v-for="workout in workoutsNeedingReview" :key="workout.id">
                <div>
                  <strong>{{ workout.sport }}</strong>
                  <span>{{ formatDate(workout.date) }} · {{ formatDuration(Number(workout.duration_seconds ?? 0) / 60) }}</span>
                </div>
                <BaseBadge tone="warning">Needs enrichment</BaseBadge>
                <RouterLink :to="`/workouts/${workout.id}`" :aria-label="`Open ${workout.sport} workout from ${formatDate(workout.date)}`">
                  <BaseButton variant="secondary">Open</BaseButton>
                </RouterLink>
              </article>
            </div>
            <p v-else class="muted">All workouts have enough journal context for analysis.</p>
            <template #action>
              <RouterLink to="/workouts"><BaseButton variant="secondary">Review inbox</BaseButton></RouterLink>
            </template>
          </BaseCard>

          <BaseCard title="Journal coverage" subtitle="Objective data becomes more useful after enrichment">
            <div class="coverage-grid">
              <span>{{ totalNeedingReview }} workouts needing review</span>
              <span>{{ sportDistribution.running ?? 0 }} running workouts this week</span>
              <span>{{ sportDistribution.strength ?? 0 }} strength workouts this week</span>
              <span>{{ sportDistribution.basketball ?? 0 }} basketball workouts this week</span>
            </div>
          </BaseCard>
        </div>
      </section>

      <section class="journal-section">
        <h2>What did I learn?</h2>
        <div class="two-column-grid">
          <BaseCard title="Weekly reflection" subtitle="Coaching-style readout">
            <div class="summary-list">
              <p>{{ weeklyReport?.runningSummary }}</p>
              <p>{{ weeklyReport?.strengthSummary }}</p>
              <p>{{ weeklyReport?.basketballSummary }}</p>
              <p>{{ weeklyReport?.suggestedFocus }}</p>
            </div>
            <template #action>
              <RouterLink to="/weekly-review"><BaseButton variant="secondary">Open weekly review</BaseButton></RouterLink>
            </template>
          </BaseCard>

          <BaseCard title="Recent insights" subtitle="Meaning generated from facts plus journal context">
            <div class="insight-grid">
              <article v-for="insight in insightCards.slice(0, 2)" :key="insight.title" class="insight-summary">
                <strong>{{ insight.title }}</strong>
                <span>{{ insight.message }}</span>
              </article>
            </div>
          </BaseCard>
        </div>
      </section>

      <section class="journal-section">
        <h2>How am I progressing?</h2>
        <div class="card-grid">
          <BaseCard title="Running" subtitle="Objective pace and distance with training purpose context">
            <strong>{{ summary?.progress?.running?.sessions ?? 0 }}</strong>
            <p class="muted">Running sessions this week.</p>
          </BaseCard>
          <BaseCard title="Strength" subtitle="Progressive overload from journaled exercises">
            <strong>{{ summary?.progress?.strength?.sessions ?? 0 }}</strong>
            <p class="muted">Strength sessions this week.</p>
          </BaseCard>
          <BaseCard title="Basketball" subtitle="Qualitative performance layered onto Zepp sessions">
            <strong>{{ summary?.progress?.basketball?.sessions ?? 0 }}</strong>
            <p class="muted">Basketball sessions this week.</p>
          </BaseCard>
          <BaseCard title="Long-term trend" subtitle="Backend analysis">
            <strong>{{ performanceStore.records.length }}</strong>
            <p class="muted">Personal records available from backend analysis.</p>
          </BaseCard>
        </div>
      </section>
    </template>
  </PageContainer>
</template>

<style scoped>
.journal-section {
  display: grid;
  gap: var(--space-4);
  margin-bottom: var(--space-7);
}

.journal-section h2 {
  margin: 0;
  font-size: var(--font-size-xl);
}

.insight-grid,
.summary-list,
.mini-list,
.review-list,
.coverage-grid {
  display: grid;
  gap: var(--space-3);
}

.mini-list a,
.review-list article {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  padding-bottom: var(--space-2);
  text-decoration: none;
}

.review-list article {
  flex-wrap: wrap;
}

.mini-list span,
.review-list span,
.muted,
.summary-list p,
.summary-line span,
.coverage-grid span {
  color: var(--color-text-muted);
}

.summary-line {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: baseline;
  margin-bottom: var(--space-4);
}

.summary-line strong,
.card-grid strong {
  font-size: var(--font-size-2xl);
}

.import-summary,
.coverage-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.import-summary span,
.coverage-grid span {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
}

@media (max-width: 720px) {
  .mini-list a,
  .review-list article {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
