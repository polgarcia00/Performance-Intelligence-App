<script setup lang="ts">
import { onMounted } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import WeeklyFocusCard from '@/components/dashboard/WeeklyFocusCard.vue'
import { useWeeklyReport } from '@/composables/useWeeklyReport'
import { usePerformanceStore } from '@/stores/performanceStore'
import { formatDuration } from '@/utils/formatters'

const performanceStore = usePerformanceStore()
const { weeklyReport } = useWeeklyReport()

onMounted(() => {
  void performanceStore.loadBackendAnalysis()
})
</script>

<template>
  <PageContainer title="Weekly Review" eyebrow="Reflect on the week" description="A coaching-style reflection on what improved, what declined, what patterns appeared, and what should change next week.">
    <WeeklyFocusCard :focus="weeklyReport?.suggestedFocus ?? 'Review journal workouts to generate your weekly focus.'" />

    <BaseCard title="Week story" subtitle="Facts from Zepp, meaning from the journal">
      <div class="summary-list">
        <p>{{ weeklyReport?.workoutsCompleted ?? 0 }} workouts · {{ formatDuration(weeklyReport?.totalTrainingTimeMinutes ?? 0) }} training time</p>
        <p>{{ weeklyReport?.comparisonToPreviousWeek }}</p>
        <p>{{ weeklyReport?.weekStorySummary }}</p>
      </div>
    </BaseCard>

    <BaseCard title="Sport reflections">
      <div class="summary-list">
        <p>{{ weeklyReport?.runningSummary }}</p>
        <p>{{ weeklyReport?.strengthSummary }}</p>
        <p>{{ weeklyReport?.basketballSummary }}</p>
        <p>{{ weeklyReport?.consistencySummary }}</p>
      </div>
    </BaseCard>

    <BaseCard title="Lessons learned">
      <div class="summary-list">
        <p v-for="lesson in weeklyReport?.lessonsLearned ?? []" :key="lesson">{{ lesson }}</p>
      </div>
    </BaseCard>
  </PageContainer>
</template>

<style scoped>
.summary-list {
  display: grid;
  gap: var(--space-3);
}

p {
  margin: 0;
  color: var(--color-text-muted);
}
</style>
