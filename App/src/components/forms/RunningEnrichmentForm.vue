<script setup lang="ts">
import { reactive } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import type { RunningGoal, RunningWorkoutEnrichment } from '@/types'

const props = defineProps<{
  workoutId: string
  enrichment?: RunningWorkoutEnrichment
}>()

const emit = defineEmits<{
  submit: [enrichment: RunningWorkoutEnrichment]
}>()

const form = reactive({
  goal: props.enrichment?.goal ?? '',
  perceivedEffort: props.enrichment?.perceivedEffort ?? 0,
  perceivedPerformance: props.enrichment?.perceivedPerformance ?? 0,
  routeType: props.enrichment?.routeType ?? '',
  feltStrong: props.enrichment?.feltStrong ?? false,
  notes: props.enrichment?.notes ?? '',
})

const goalOptions = [
  { label: 'Select goal', value: '' },
  { label: 'Max effort', value: 'maxEffort' },
  { label: 'Long run', value: 'longRun' },
  { label: 'Zone 2', value: 'zone2' },
  { label: 'Tempo', value: 'tempo' },
  { label: 'Intervals', value: 'intervals' },
  { label: 'Casual jog', value: 'casualJog' },
  { label: 'Easy run', value: 'recoveryRun' },
  { label: 'Other', value: 'other' },
]

const routeOptions = [
  { label: 'Select route', value: '' },
  { label: 'Road', value: 'road' },
  { label: 'Trail', value: 'trail' },
  { label: 'Track', value: 'track' },
  { label: 'Treadmill', value: 'treadmill' },
  { label: 'Mixed', value: 'mixed' },
]

function optionalRating(value: number): number | undefined {
  return value > 0 ? value : undefined
}

function submit() {
  emit('submit', {
    workoutId: props.workoutId,
    goal: form.goal ? (form.goal as RunningGoal) : undefined,
    perceivedEffort: optionalRating(Number(form.perceivedEffort)),
    perceivedPerformance: optionalRating(Number(form.perceivedPerformance)),
    routeType: form.routeType ? (form.routeType as RunningWorkoutEnrichment['routeType']) : undefined,
    feltStrong: form.feltStrong,
    notes: form.notes.trim() || undefined,
  })
}
</script>

<template>
  <form class="form-grid" @submit.prevent="submit">
    <BaseSelect id="running-goal" v-model="form.goal" label="Training purpose" :options="goalOptions" />
    <BaseSelect id="running-route" v-model="form.routeType" label="Route type" :options="routeOptions" />
    <BaseInput id="running-effort" v-model="form.perceivedEffort" label="Perceived effort" type="number" min="0" max="10" />
    <BaseInput id="running-performance" v-model="form.perceivedPerformance" label="Perceived performance" type="number" min="0" max="10" />
    <label class="check-field">
      <input v-model="form.feltStrong" type="checkbox" />
      Felt strong
    </label>
    <BaseTextarea id="running-notes" v-model="form.notes" label="Journal notes" />
    <BaseButton type="submit">Save journal</BaseButton>
  </form>
</template>

<style scoped>
.check-field {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: 700;
}
</style>
