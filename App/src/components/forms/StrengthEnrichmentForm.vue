<script setup lang="ts">
import { reactive } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import type { StrengthWorkoutEnrichment } from '@/types'
import { createId } from '@/utils/id'

const props = defineProps<{
  workoutId: string
  enrichment?: StrengthWorkoutEnrichment
}>()

const emit = defineEmits<{
  submit: [enrichment: StrengthWorkoutEnrichment]
}>()

const form = reactive({
  workoutId: props.workoutId,
  sessionType: props.enrichment?.sessionType ?? '',
  exercises: props.enrichment?.exercises.length
    ? props.enrichment.exercises.map((exercise) => ({
        ...exercise,
        muscleGroup: exercise.muscleGroup ?? '',
        sets: exercise.sets.map((set) => ({ ...set, rpe: set.rpe ?? 0 })),
      }))
    : [],
  notes: props.enrichment?.notes ?? '',
})

const sessionOptions = [
  { label: 'Select session', value: '' },
  { label: 'Upper', value: 'upper' },
  { label: 'Lower', value: 'lower' },
  { label: 'Full body', value: 'fullBody' },
  { label: 'Push', value: 'push' },
  { label: 'Pull', value: 'pull' },
  { label: 'Legs', value: 'legs' },
  { label: 'Other', value: 'other' },
]

function addExercise() {
  form.exercises.push({
    id: createId('exercise'),
    name: '',
    muscleGroup: '',
    sets: [{ id: createId('set'), setNumber: 1, reps: 5, weightKg: 0, rpe: 0 }],
  })
}

function addSet(exerciseIndex: number) {
  const exercise = form.exercises[exerciseIndex]
  if (!exercise) return

  exercise.sets.push({
    id: createId('set'),
    setNumber: exercise.sets.length + 1,
    reps: 5,
    weightKg: 0,
    rpe: 0,
  })
}

function submit() {
  emit('submit', {
    workoutId: props.workoutId,
    sessionType: form.sessionType ? (form.sessionType as StrengthWorkoutEnrichment['sessionType']) : undefined,
    exercises: form.exercises
      .filter((exercise) => exercise.name.trim())
      .map((exercise) => ({
        ...exercise,
        name: exercise.name.trim(),
        muscleGroup: exercise.muscleGroup?.trim() || undefined,
        sets: exercise.sets.map((set, index) => ({
          ...set,
          setNumber: index + 1,
          reps: Number(set.reps),
          weightKg: Number(set.weightKg),
          rpe: set.rpe ? Number(set.rpe) : undefined,
        })),
      })),
    notes: form.notes?.trim() || undefined,
  })
}
</script>

<template>
  <form class="strength-form" @submit.prevent="submit">
    <div class="form-grid">
      <BaseSelect id="strength-session" v-model="form.sessionType" label="Session type" :options="sessionOptions" />
      <BaseTextarea id="strength-notes" v-model="form.notes" label="Journal notes" />
    </div>

    <div class="exercise-list">
      <article v-for="(exercise, exerciseIndex) in form.exercises" :key="exercise.id" class="exercise-panel">
        <div class="form-grid">
          <BaseInput :id="`exercise-${exercise.id}`" v-model="exercise.name" label="Exercise" />
          <BaseInput :id="`muscle-${exercise.id}`" v-model="exercise.muscleGroup" label="Muscle group" />
        </div>

        <div class="set-grid">
          <div v-for="set in exercise.sets" :key="set.id" class="set-row">
            <BaseInput :id="`reps-${set.id}`" v-model="set.reps" label="Reps" type="number" min="1" />
            <BaseInput :id="`weight-${set.id}`" v-model="set.weightKg" label="Weight kg" type="number" min="0" step="0.5" />
            <BaseInput :id="`rpe-${set.id}`" v-model="set.rpe" label="RPE" type="number" min="0" max="10" />
          </div>
        </div>

        <BaseButton variant="secondary" @click="addSet(exerciseIndex)">Add set</BaseButton>
      </article>
    </div>

    <div class="button-row">
      <BaseButton variant="secondary" @click="addExercise">Add exercise</BaseButton>
      <BaseButton type="submit">Save journal</BaseButton>
    </div>
  </form>
</template>

<style scoped>
.strength-form,
.exercise-list,
.set-grid {
  display: grid;
  gap: var(--space-4);
}

.exercise-panel {
  display: grid;
  gap: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-4);
}

.set-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-3);
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
</style>
