<script setup lang="ts">
defineProps<{
  id: string
  label: string
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label class="field" :for="id">
    <span>{{ label }}</span>
    <textarea
      :id="id"
      :value="modelValue"
      rows="3"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
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

textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: rgba(8, 16, 17, 0.82);
  color: var(--color-text);
  padding: 0.75rem 0.85rem;
}
</style>

