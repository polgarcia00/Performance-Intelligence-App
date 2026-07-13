<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'neutral' | 'positive' | 'warning' | 'risk'
  }>(),
  {
    tone: 'neutral',
  },
)
</script>

<template>
  <span class="base-badge" :class="`base-badge--${tone}`">
    <slot />
  </span>
</template>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.base-badge--neutral {
  background: rgba(168, 187, 181, 0.14);
  color: var(--color-text-muted);
}

.base-badge--positive {
  background: rgba(115, 223, 127, 0.18);
  color: var(--color-positive);
}

.base-badge--warning {
  background: rgba(255, 209, 102, 0.18);
  color: var(--color-warning);
}

.base-badge--risk {
  background: rgba(255, 92, 122, 0.18);
  color: var(--color-risk);
}
</style>
