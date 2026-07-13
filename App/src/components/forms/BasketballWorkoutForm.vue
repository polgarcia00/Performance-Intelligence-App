<script setup lang="ts">
import { reactive } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import type { BasketballWorkoutInput } from '@/utils/workoutFactories'
import { localDateTimeKey } from '@/utils/dateRanges'

const emit = defineEmits<{
  submit: [input: BasketballWorkoutInput]
}>()

const form = reactive({
  startedAt: localDateTimeKey(),
  durationMinutes: 70,
  calories: 640,
  averageHeartRate: 150,
  maxHeartRate: 184,
})

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="form-grid" @submit.prevent="submit">
    <BaseInput id="basketball-started-at" v-model="form.startedAt" label="Start date and time" type="datetime-local" />
    <BaseInput id="basketball-duration" v-model.number="form.durationMinutes" label="Duration" type="number" min="1" />
    <BaseInput id="basketball-calories" v-model.number="form.calories" label="Calories" type="number" min="0" />
    <BaseInput id="basketball-avg-hr" v-model.number="form.averageHeartRate" label="Average HR" type="number" min="35" />
    <BaseInput id="basketball-max-hr" v-model.number="form.maxHeartRate" label="Max HR" type="number" min="35" />
    <BaseButton class="form-grid__wide" type="submit">Save basketball session</BaseButton>
  </form>
</template>
