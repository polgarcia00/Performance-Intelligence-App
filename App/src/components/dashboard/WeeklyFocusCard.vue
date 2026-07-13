<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'

defineProps<{
  focus: string
}>()
</script>

<template>
  <BaseCard title="Recommended focus" subtitle="Based on current trends">
    <p>{{ focus }}</p>
  </BaseCard>
</template>

<style scoped>
p {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 800;
  line-height: 1.3;
}
</style>

