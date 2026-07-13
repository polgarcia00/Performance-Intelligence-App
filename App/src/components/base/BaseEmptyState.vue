<script setup lang="ts">
defineProps<{
  title: string
  message: string
}>()
</script>

<template>
  <div class="empty-state">
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  display: grid;
  justify-items: start;
  gap: var(--space-3);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  color: var(--color-text-muted);
}

h2,
p {
  margin: 0;
}

h2 {
  color: var(--color-text);
}
</style>

