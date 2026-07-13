<script setup lang="ts">
import BasketballEnrichmentForm from './BasketballEnrichmentForm.vue'
import RunningEnrichmentForm from './RunningEnrichmentForm.vue'
import StrengthEnrichmentForm from './StrengthEnrichmentForm.vue'
import type {
  BasketballWorkoutEnrichment,
  RunningWorkoutEnrichment,
  StrengthWorkoutEnrichment,
  Workout,
} from '@/types'

defineProps<{
  workout: Workout
  runningEnrichment?: RunningWorkoutEnrichment
  strengthEnrichment?: StrengthWorkoutEnrichment
  basketballEnrichment?: BasketballWorkoutEnrichment
}>()

defineEmits<{
  saveRunning: [enrichment: RunningWorkoutEnrichment]
  saveStrength: [enrichment: StrengthWorkoutEnrichment]
  saveBasketball: [enrichment: BasketballWorkoutEnrichment]
}>()
</script>

<template>
  <RunningEnrichmentForm
    v-if="workout.type === 'running'"
    :workout-id="workout.id"
    :enrichment="runningEnrichment"
    @submit="$emit('saveRunning', $event)"
  />
  <StrengthEnrichmentForm
    v-else-if="workout.type === 'strength'"
    :workout-id="workout.id"
    :enrichment="strengthEnrichment"
    @submit="$emit('saveStrength', $event)"
  />
  <BasketballEnrichmentForm
    v-else
    :workout-id="workout.id"
    :enrichment="basketballEnrichment"
    @submit="$emit('saveBasketball', $event)"
  />
</template>
