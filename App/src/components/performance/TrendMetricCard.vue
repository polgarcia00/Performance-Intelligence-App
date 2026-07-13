<script setup lang="ts">
import BaseBadge from '@/components/base/BaseBadge.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import { formatMetricDelta, formatMetricValue, type DistanceUnit, type MetricFormat } from '@/utils/formatters'

defineProps<{
  title: string
  value: number
  unit?: string
  format?: MetricFormat
  distanceUnit?: DistanceUnit
  decimals?: number
  delta?: number
  description: string
}>()
</script>

<template>
  <BaseCard>
    <div class="trend-card">
      <div>
        <p>{{ title }}</p>
        <strong>{{ formatMetricValue(value, format, { unit, decimals, distanceUnit }) }}</strong>
      </div>
      <BaseBadge v-if="delta !== undefined" :tone="delta >= 0 ? 'positive' : 'warning'">
        {{ formatMetricDelta(delta, format, { unit, decimals, distanceUnit }) }}
      </BaseBadge>
    </div>
    <span>{{ description }}</span>
  </BaseCard>
</template>

<style scoped>
.trend-card {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  justify-content: space-between;
}

p,
span {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

strong {
  display: block;
  margin: var(--space-2) 0;
  font-size: var(--font-size-2xl);
}
</style>
