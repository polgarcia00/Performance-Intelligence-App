<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    accent?: string
  }>(),
  {
    accent: 'var(--color-accent)',
  },
)
</script>

<template>
  <section class="base-card" :style="{ '--card-accent': accent }">
    <div v-if="title || subtitle" class="base-card__header">
      <div>
        <h2 v-if="title">{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <slot name="action" />
    </div>
    <slot />
  </section>
</template>

<style scoped>
.base-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, rgba(23, 35, 38, 0.96), rgba(13, 24, 26, 0.96));
  box-shadow: var(--shadow-card);
  padding: var(--space-5);
}

.base-card::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--card-accent);
  content: '';
}

.base-card__header {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.base-card h2 {
  margin: 0;
  font-size: var(--font-size-lg);
}

.base-card p {
  margin: var(--space-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>

