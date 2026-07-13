<script setup lang="ts">
import { reactive } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import type { StrengthWorkoutInput } from '@/utils/workoutFactories'
import { localDateTimeKey } from '@/utils/dateRanges'

const emit = defineEmits<{
  submit: [input: StrengthWorkoutInput]
}>()

const form = reactive({
  startedAt: localDateTimeKey(),
  durationMinutes: 55,
  calories: 330,
  averageHeartRate: 112,
  maxHeartRate: 150,
})

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="form-grid" @submit.prevent="submit">
    <BaseInput id="strength-started-at" v-model="form.startedAt" label="Start date and time" type="datetime-local" />
    <BaseInput id="strength-duration" v-model.number="form.durationMinutes" label="Duration" type="number" min="1" />
    <BaseInput id="strength-calories" v-model.number="form.calories" label="Calories" type="number" min="0" />
    <BaseInput id="strength-avg-hr" v-model.number="form.averageHeartRate" label="Average HR" type="number" min="35" />
    <BaseInput id="strength-max-hr" v-model.number="form.maxHeartRate" label="Max HR" type="number" min="35" />
    <BaseButton class="form-grid__wide" type="submit">Save strength workout</BaseButton>
  </form>
</template>
