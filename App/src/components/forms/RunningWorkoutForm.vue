<script setup lang="ts">
import { reactive } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import type { RunningWorkoutInput } from '@/utils/workoutFactories'
import { todayKey } from '@/utils/dateRanges'

const emit = defineEmits<{
  submit: [input: RunningWorkoutInput]
}>()

const form = reactive({
  date: todayKey(),
  durationMinutes: 40,
  distanceKm: 6,
  averageHeartRate: 145,
  maxHeartRate: 170,
  perceivedEffort: 6,
  notes: '',
})

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="form-grid" @submit.prevent="submit">
    <BaseInput id="run-date" v-model="form.date" label="Date" type="date" />
    <BaseInput id="run-duration" v-model.number="form.durationMinutes" label="Duration" type="number" min="1" />
    <BaseInput id="run-distance" v-model.number="form.distanceKm" label="Distance km" type="number" min="0.1" step="0.1" />
    <BaseInput id="run-avg-hr" v-model.number="form.averageHeartRate" label="Average HR" type="number" min="35" />
    <BaseInput id="run-max-hr" v-model.number="form.maxHeartRate" label="Max HR" type="number" min="35" />
    <BaseInput id="run-effort" v-model.number="form.perceivedEffort" label="Effort 1-10" type="number" min="1" max="10" />
    <div class="form-grid__wide">
      <BaseTextarea id="run-notes" v-model="form.notes" label="Notes" />
    </div>
    <BaseButton class="form-grid__wide" type="submit">Save running workout</BaseButton>
  </form>
</template>
