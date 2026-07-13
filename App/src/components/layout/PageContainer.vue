<script setup lang="ts">
defineProps<{
  title?: string
  eyebrow?: string
  description?: string
}>()
</script>

<template>
  <main class="page-container">
    <header v-if="title || eyebrow || description" class="page-header">
      <p v-if="eyebrow" class="page-header__eyebrow">{{ eyebrow }}</p>
      <div class="page-header__row">
        <div>
          <h1 v-if="title">{{ title }}</h1>
          <p v-if="description">{{ description }}</p>
        </div>
        <slot name="actions" />
      </div>
    </header>
    <div class="page-stack">
      <slot />
    </div>
  </main>
</template>

<style scoped>
.page-container {
  width: min(100%, var(--layout-max));
  margin: 0 auto;
  padding: var(--space-8);
}

.page-header {
  margin-bottom: var(--space-6);
}

.page-header__eyebrow {
  margin: 0 0 var(--space-2);
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 900;
  text-transform: uppercase;
}

.page-header__row {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
  justify-content: space-between;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, var(--font-size-3xl));
  line-height: 1;
}

p {
  max-width: 62rem;
  margin: var(--space-2) 0 0;
  color: var(--color-text-muted);
}

@media (max-width: 720px) {
  .page-container {
    padding: var(--space-5) var(--space-4) calc(5rem + var(--space-5));
  }

  .page-header__row {
    display: grid;
  }
}
</style>

