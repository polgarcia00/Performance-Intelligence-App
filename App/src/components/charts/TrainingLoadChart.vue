<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import { computed } from 'vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{
  labels: string[]
  values: number[]
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Training load',
      data: props.values,
      backgroundColor: '#35d2a4',
      borderRadius: 6,
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
  <div class="chart-panel" aria-label="Training load chart">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-panel {
  height: 260px;
  min-width: 0;
}
</style>

