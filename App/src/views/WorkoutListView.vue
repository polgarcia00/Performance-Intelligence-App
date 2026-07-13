<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import { useWorkoutStore } from '@/stores/workoutStore'
import { formatDate, formatDuration } from '@/utils/formatters'

const workoutStore = useWorkoutStore()

onMounted(() => {
  void workoutStore.loadInbox()
})

const sortedWorkouts = computed(() =>
  [...workoutStore.workouts].sort((a, b) => `${b.date}${b.startTime ?? ''}`.localeCompare(`${a.date}${a.startTime ?? ''}`)),
)

function statusFor(workoutId: string) {
  return workoutStore.getJournalStatusByWorkoutId(workoutId)
}
</script>

<template>
  <PageContainer
    title="Workout Inbox"
    eyebrow="Review journal workouts"
    description="Imported Zepp workouts wait here until you add the context Zepp cannot capture."
  >
    <BaseEmptyState
      v-if="!sortedWorkouts.length"
      title="Import Zepp workouts first"
      message="Workout enrichment starts after Zepp workout data is imported."
    >
      <RouterLink to="/import"><BaseButton>Import Zepp workouts</BaseButton></RouterLink>
    </BaseEmptyState>

    <BaseCard v-else title="Journal workouts" subtitle="Review status is based only on journal data. Objective values stay read-only after creation or import.">
      <div class="workout-list">
        <article v-for="workout in sortedWorkouts" :key="workout.id" class="workout-row">
          <div class="workout-main">
            <strong>{{ workout.type }}</strong>
            <p>{{ formatDate(workout.date) }} · {{ formatDuration(workout.durationMinutes) }}</p>
          </div>
          <div class="row-meta">
            <BaseBadge :tone="statusFor(workout.id)?.tone">
              {{ statusFor(workout.id)?.label }}
            </BaseBadge>
            <span>{{ statusFor(workout.id)?.missingFields.join(', ') || 'Journal ready' }}</span>
            <RouterLink :to="`/workouts/${workout.id}`" :aria-label="`Open ${workout.type} workout from ${formatDate(workout.date)}`">
              <BaseButton variant="secondary">Open workout</BaseButton>
            </RouterLink>
          </div>
        </article>
      </div>
    </BaseCard>
  </PageContainer>
</template>

<style scoped>
.workout-list {
  display: grid;
  gap: var(--space-2);
}

.workout-row {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  padding: var(--space-3) 0;
}

.workout-main p,
.row-meta span {
  margin: var(--space-1) 0 0;
  color: var(--color-text-muted);
}

.row-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .workout-row,
  .row-meta {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
