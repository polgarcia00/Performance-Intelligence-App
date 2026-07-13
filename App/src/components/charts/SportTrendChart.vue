<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { computed } from 'vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = withDefaults(
  defineProps<{
    title: string
    labels: string[]
    values: number[]
    color?: string
  }>(),
  {
    color: '#35d2a4',
  },
)

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.title,
      data: props.values,
      borderColor: props.color,
      backgroundColor: `${props.color}22`,
      borderWidth: 2,
      fill: true,
      tension: 0.35,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: { ticks: { color: '#a8bbb5' }, grid: { display: false } },
    y: { ticks: { color: '#a8bbb5' }, grid: { color: 'rgba(221, 238, 233, 0.08)' } },
  },
}
</script>

<template>
  <div class="chart-panel" :aria-label="title">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-panel {
  height: 260px;
  min-width: 0;
}
</style>

