<script setup lang="ts">
import { ref } from 'vue'
import BaseTabs from '@/components/base/BaseTabs.vue'
import BasketballWorkoutForm from './BasketballWorkoutForm.vue'
import RunningWorkoutForm from './RunningWorkoutForm.vue'
import StrengthWorkoutForm from './StrengthWorkoutForm.vue'
import { useWorkoutSubmission } from '@/composables/useWorkoutSubmission'

const activeType = ref('running')
const wasSaved = ref(false)
const errorMessage = ref('')
const { submitRunningWorkout, submitStrengthWorkout, submitBasketballWorkout } = useWorkoutSubmission()

const tabs = [
  { label: 'Running', value: 'running' },
  { label: 'Strength', value: 'strength' },
  { label: 'Basketball', value: 'basketball' },
]

async function markSaved(action: () => Promise<void>) {
  errorMessage.value = ''
  wasSaved.value = false

  try {
    await action()
    wasSaved.value = true
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to save workout.'
  }
}
</script>

<template>
  <div class="entry-form">
    <BaseTabs v-model="activeType" :tabs="tabs" />
    <p v-if="wasSaved" role="status" class="form-alert form-alert--success">
      Saved. Your performance dashboard has been updated.
    </p>
    <p v-if="errorMessage" role="alert" class="form-alert form-alert--error">{{ errorMessage }}</p>

    <RunningWorkoutForm
      v-if="activeType === 'running'"
      @submit="(input) => markSaved(() => submitRunningWorkout(input))"
    />
    <StrengthWorkoutForm
      v-if="activeType === 'strength'"
      @submit="(input) => markSaved(() => submitStrengthWorkout(input))"
    />
    <BasketballWorkoutForm
      v-if="activeType === 'basketball'"
      @submit="(input) => markSaved(() => submitBasketballWorkout(input))"
    />
  </div>
</template>
