<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import { SPORT_ACCENTS } from '@/constants/workouts'
import { formatNumber } from '@/utils/formatters'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    tone?: keyof typeof SPORT_ACCENTS
    detail?: string
  }>(),
  {
    tone: 'overall',
  },
)
</script>

<template>
  <BaseCard class="score-card" :accent="SPORT_ACCENTS[props.tone]">
    <p class="score-card__label">{{ label }}</p>
    <strong>{{ formatNumber(value) }}</strong>
    <span>{{ detail ?? 'Current personal trend' }}</span>
  </BaseCard>
</template>

<style scoped>
.score-card {
  min-height: 9rem;
}

.score-card__label,
span {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

strong {
  display: block;
  margin: var(--space-2) 0;
  font-size: var(--font-size-3xl);
  line-height: 1;
}
</style>
