<script setup lang="ts">
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import type { Insight } from '@/types'

defineProps<{
  insight: Insight
}>()

defineEmits<{
  save: [id: string]
  dismiss: [id: string]
}>()
</script>

<template>
  <BaseCard :title="insight.title" :subtitle="insight.relatedMetric">
    <div class="insight-card">
      <BaseBadge>{{ insight.category }}</BaseBadge>
      <p>{{ insight.message }}</p>
      <strong>{{ insight.suggestedAction }}</strong>
      <div class="insight-card__actions">
        <BaseButton variant="secondary" @click="$emit('save', insight.id)">Save</BaseButton>
        <BaseButton variant="ghost" @click="$emit('dismiss', insight.id)">Dismiss</BaseButton>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.insight-card {
  display: grid;
  gap: var(--space-3);
}

p,
strong {
  margin: 0;
}

p {
  color: var(--color-text-muted);
}

.insight-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>

