<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    type: 'button',
  },
)
</script>

<template>
  <button class="base-button" :class="`base-button--${variant}`" :type="type">
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: 0 var(--space-4);
  color: var(--color-text);
  cursor: pointer;
  font-weight: 700;
  transition:
    transform 150ms ease,
    border-color 150ms ease,
    background 150ms ease;
}

.base-button:hover {
  transform: translateY(-1px);
}

.base-button--primary {
  background: var(--color-accent);
  color: #041210;
}

.base-button--secondary {
  border-color: var(--color-border);
  background: var(--color-surface-muted);
}

.base-button--ghost {
  border-color: var(--color-border);
  background: transparent;
}

.base-button--danger {
  background: var(--color-risk);
  color: #160308;
}
</style>

