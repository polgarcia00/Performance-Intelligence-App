<script setup lang="ts">
import { reactive } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import type { RunningWorkoutInput } from '@/utils/workoutFactories'
import { localDateTimeKey } from '@/utils/dateRanges'

const emit = defineEmits<{
  submit: [input: RunningWorkoutInput]
}>()

const form = reactive({
  startedAt: localDateTimeKey(),
  durationMinutes: 40,
  distanceKm: 6,
  calories: 450,
  averageHeartRate: 145,
  maxHeartRate: 170,
})

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="form-grid" @submit.prevent="submit">
    <BaseInput id="run-started-at" v-model="form.startedAt" label="Start date and time" type="datetime-local" />
    <BaseInput id="run-duration" v-model.number="form.durationMinutes" label="Duration" type="number" min="1" />
    <BaseInput id="run-distance" v-model.number="form.distanceKm" label="Distance km" type="number" min="0.1" step="0.1" />
    <BaseInput id="run-calories" v-model.number="form.calories" label="Calories" type="number" min="0" />
    <BaseInput id="run-avg-hr" v-model.number="form.averageHeartRate" label="Average HR" type="number" min="35" />
    <BaseInput id="run-max-hr" v-model.number="form.maxHeartRate" label="Max HR" type="number" min="35" />
    <BaseButton class="form-grid__wide" type="submit">Save running workout</BaseButton>
  </form>
</template>
