<script setup lang="ts">
const props = defineProps<{
  id: string
  label: string
  modelValue: string | number
  type?: string
  min?: string | number
  max?: string | number
  step?: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

function emitValue(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', props.type === 'number' ? Number(value) : value)
}
</script>

<template>
  <label class="field" :for="id">
    <span>{{ label }}</span>
    <input
      :id="id"
      :type="type ?? 'text'"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      @input="emitValue"
    />
  </label>
</template>

<style scoped>
.field {
  display: grid;
  gap: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: rgba(8, 16, 17, 0.82);
  color: var(--color-text);
  padding: 0.75rem 0.85rem;
}
</style>
