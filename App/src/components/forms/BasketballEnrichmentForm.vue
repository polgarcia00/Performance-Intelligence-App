<script setup lang="ts">
import { reactive } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import type { BasketballWorkoutEnrichment } from '@/types'

const props = defineProps<{
  workoutId: string
  enrichment?: BasketballWorkoutEnrichment
}>()

const emit = defineEmits<{
  submit: [enrichment: BasketballWorkoutEnrichment]
}>()

const form = reactive({
  sessionType: props.enrichment?.sessionType ?? '',
  perceivedPerformance: props.enrichment?.perceivedPerformance ?? 0,
  perceivedEffort: props.enrichment?.perceivedEffort ?? 0,
  energyLevel: props.enrichment?.energyLevel ?? 0,
  shootingQuality: props.enrichment?.shootingQuality ?? 0,
  defenseQuality: props.enrichment?.defenseQuality ?? 0,
  explosiveness: props.enrichment?.explosiveness ?? 0,
  role: props.enrichment?.role ?? '',
  outcome: props.enrichment?.outcome ?? 'unknown',
  notes: props.enrichment?.notes ?? '',
})

const sessionOptions = [
  { label: 'Select session', value: '' },
  { label: 'Game', value: 'game' },
  { label: 'Pickup', value: 'pickup' },
  { label: 'Practice', value: 'practice' },
  { label: 'Shootaround', value: 'shootaround' },
  { label: 'Conditioning', value: 'conditioning' },
]

const roleOptions = [
  { label: 'Select role', value: '' },
  { label: 'Primary scorer', value: 'primaryScorer' },
  { label: 'Facilitator', value: 'facilitator' },
  { label: 'Defender', value: 'defender' },
  { label: 'Rebounder', value: 'rebounder' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'Other', value: 'other' },
]

const outcomeOptions = [
  { label: 'Unknown', value: 'unknown' },
  { label: 'Win', value: 'win' },
  { label: 'Loss', value: 'loss' },
]

function optionalRating(value: number): number | undefined {
  return value > 0 ? value : undefined
}

function submit() {
  emit('submit', {
    workoutId: props.workoutId,
    sessionType: form.sessionType ? (form.sessionType as BasketballWorkoutEnrichment['sessionType']) : undefined,
    perceivedPerformance: optionalRating(Number(form.perceivedPerformance)),
    perceivedEffort: optionalRating(Number(form.perceivedEffort)),
    energyLevel: optionalRating(Number(form.energyLevel)),
    shootingQuality: optionalRating(Number(form.shootingQuality)),
    defenseQuality: optionalRating(Number(form.defenseQuality)),
    explosiveness: optionalRating(Number(form.explosiveness)),
    role: form.role ? (form.role as BasketballWorkoutEnrichment['role']) : undefined,
    outcome: form.outcome as BasketballWorkoutEnrichment['outcome'],
    notes: form.notes.trim() || undefined,
  })
}
</script>

<template>
  <form class="form-grid" @submit.prevent="submit">
    <BaseSelect id="basketball-session" v-model="form.sessionType" label="Session type" :options="sessionOptions" />
    <BaseSelect id="basketball-role" v-model="form.role" label="Role" :options="roleOptions" />
    <BaseSelect id="basketball-outcome" v-model="form.outcome" label="Outcome" :options="outcomeOptions" />
    <BaseInput id="basketball-performance" v-model="form.perceivedPerformance" label="Perceived performance" type="number" min="0" max="10" />
    <BaseInput id="basketball-effort" v-model="form.perceivedEffort" label="Perceived effort" type="number" min="0" max="10" />
    <BaseInput id="basketball-energy" v-model="form.energyLevel" label="Energy" type="number" min="0" max="10" />
    <BaseInput id="basketball-shooting" v-model="form.shootingQuality" label="Shooting" type="number" min="0" max="10" />
    <BaseInput id="basketball-defense" v-model="form.defenseQuality" label="Defense" type="number" min="0" max="10" />
    <BaseInput id="basketball-explosiveness" v-model="form.explosiveness" label="Explosiveness" type="number" min="0" max="10" />
    <BaseTextarea id="basketball-notes" v-model="form.notes" label="Journal notes" />
    <BaseButton type="submit">Save journal</BaseButton>
  </form>
</template>
