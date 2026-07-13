<script setup lang="ts">
import { reactive } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import type { StrengthWorkoutInput } from '@/utils/workoutFactories'
import { DEFAULT_MUSCLE_GROUPS } from '@/constants/workouts'
import { todayKey } from '@/utils/dateRanges'

const emit = defineEmits<{
  submit: [input: StrengthWorkoutInput]
}>()

const form = reactive({
  date: todayKey(),
  durationMinutes: 55,
  exerciseName: 'Back squat',
  muscleGroup: 'Legs',
  sets: 3,
  reps: 5,
  weightKg: 80,
  averageHeartRate: 112,
  maxHeartRate: 150,
  perceivedEffort: 7,
  notes: '',
})

const muscleGroupOptions = DEFAULT_MUSCLE_GROUPS.map((group) => ({ label: group, value: group }))

function submit() {
  emit('submit', { ...form })
}
</script>

<template>
  <form class="form-grid" @submit.prevent="submit">
    <BaseInput id="strength-date" v-model="form.date" label="Date" type="date" />
    <BaseInput id="strength-duration" v-model.number="form.durationMinutes" label="Duration" type="number" min="1" />
    <BaseInput id="strength-exercise" v-model="form.exerciseName" label="Exercise" />
    <BaseSelect id="strength-muscle" v-model="form.muscleGroup" label="Muscle group" :options="muscleGroupOptions" />
    <BaseInput id="strength-sets" v-model.number="form.sets" label="Sets" type="number" min="1" />
    <BaseInput id="strength-reps" v-model.number="form.reps" label="Reps" type="number" min="1" />
    <BaseInput id="strength-weight" v-model.number="form.weightKg" label="Weight kg" type="number" min="0" step="0.5" />
    <BaseInput id="strength-effort" v-model.number="form.perceivedEffort" label="Effort 1-10" type="number" min="1" max="10" />
    <div class="form-grid__wide">
      <BaseTextarea id="strength-notes" v-model="form.notes" label="Notes" />
    </div>
    <BaseButton class="form-grid__wide" type="submit">Save strength workout</BaseButton>
  </form>
</template>
