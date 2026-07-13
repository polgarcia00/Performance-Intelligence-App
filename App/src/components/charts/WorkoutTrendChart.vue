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
    labels: string[]
    values: number[]
    title?: string
  }>(),
  {
    title: 'Workout trend',
  },
)

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.title,
      data: props.values,
      borderColor: '#35d2a4',
      backgroundColor: 'rgba(53, 210, 164, 0.16)',
      tension: 0.35,
      fill: true,
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
    x: { ticks: { color: '#9fb3ad' }, grid: { color: 'rgba(255,255,255,0.06)' } },
    y: { ticks: { color: '#9fb3ad' }, grid: { color: 'rgba(255,255,255,0.06)' } },
  },
}
</script>

<template>
  <div class="chart-frame">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-frame {
  height: 240px;
}
</style>
