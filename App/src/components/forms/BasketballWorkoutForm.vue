<script setup lang="ts">
import { reactive } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import type { BasketballWorkoutInput } from '@/utils/workoutFactories'
import { todayKey } from '@/utils/dateRanges'

const emit = defineEmits<{
  submit: [input: BasketballWorkoutInput]
}>()

const form = reactive({
  date: todayKey(),
  durationMinutes: 70,
  sessionType: 'pickup' as const,
  highIntensityMinutes: 22,
  averageHeartRate: 150,
  maxHeartRate: 184,
  perceivedEffort: 8,
  perceivedPerformance: 8,
  notes: '',
})

const sessionOptions = [
  { label: 'Game', value: 'game' },
  { label: 'Pickup', value: 'pickup' },
  { label: 'Practice', value: 'practice' },
  { label: 'Conditioning', value: 'conditioning' },
]

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="form-grid" @submit.prevent="submit">
    <BaseInput id="basketball-date" v-model="form.date" label="Date" type="date" />
    <BaseInput id="basketball-duration" v-model.number="form.durationMinutes" label="Duration" type="number" min="1" />
    <BaseSelect id="basketball-type" v-model="form.sessionType" label="Session type" :options="sessionOptions" />
    <BaseInput id="basketball-high" v-model.number="form.highIntensityMinutes" label="High intensity min" type="number" min="0" />
    <BaseInput id="basketball-avg-hr" v-model.number="form.averageHeartRate" label="Average HR" type="number" min="35" />
    <BaseInput id="basketball-max-hr" v-model.number="form.maxHeartRate" label="Max HR" type="number" min="35" />
    <BaseInput id="basketball-effort" v-model.number="form.perceivedEffort" label="Effort 1-10" type="number" min="1" max="10" />
    <BaseInput id="basketball-performance" v-model.number="form.perceivedPerformance" label="Performance 1-10" type="number" min="1" max="10" />
    <div class="form-grid__wide">
      <BaseTextarea id="basketball-notes" v-model="form.notes" label="Notes" />
    </div>
    <BaseButton class="form-grid__wide" type="submit">Save basketball session</BaseButton>
  </form>
</template>
