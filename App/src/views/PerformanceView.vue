<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseEmptyState from '@/components/base/BaseEmptyState.vue'
import BaseTabs from '@/components/base/BaseTabs.vue'
import SportTrendChart from '@/components/charts/SportTrendChart.vue'
import WorkoutTrendChart from '@/components/charts/WorkoutTrendChart.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import TrendMetricCard from '@/components/performance/TrendMetricCard.vue'
import { usePerformanceOverview } from '@/composables/usePerformanceOverview'
import { usePerformanceStore } from '@/stores/performanceStore'
import { formatDate, formatDistance, formatNumber, formatPace } from '@/utils/formatters'

const activeTab = ref('running')
const tabs = [
  { label: 'Running', value: 'running' },
  { label: 'Strength', value: 'strength' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Records', value: 'records' },
  { label: 'Trends', value: 'trends' },
]

const performanceStore = usePerformanceStore()
const { runningSummary, strengthSummary, basketballSummary, trendSummary, records } = usePerformanceOverview()

onMounted(() => {
  void performanceStore.loadBackendAnalysis()
})
</script>

<template>
  <PageContainer
    title="Performance"
    eyebrow="Explore trends"
    description="Running, strength, basketball, records, and trends built from objective Zepp data plus journal context."
  >
    <BaseEmptyState
      v-if="!performanceStore.hasAnalysis && !performanceStore.isLoading"
      title="No imported performance data yet"
      message="Import Zepp workouts first, then enrich them to unlock meaningful sport trends."
    >
      <RouterLink to="/import"><BaseButton>Import Zepp workout data</BaseButton></RouterLink>
    </BaseEmptyState>

    <BaseCard>
      <BaseTabs v-model="activeTab" :tabs="tabs" />
    </BaseCard>

    <section v-if="activeTab === 'running'" class="section-stack">
      <div class="card-grid">
        <TrendMetricCard title="Total distance" :value="runningSummary.totalDistance" format="distance" description="Objective imported running distance." />
        <TrendMetricCard title="Average pace" :value="runningSummary.averagePace" format="pace" description="Objective pace across imported runs." />
        <TrendMetricCard title="Runs reviewed" :value="runningSummary.goalBreakdown.length" description="Runs with journaled training purpose." />
      </div>
      <BaseCard title="Running pace trend" subtitle="Pace in minutes per kilometre">
        <SportTrendChart title="Running pace" :labels="runningSummary.labels" :values="runningSummary.paceValues" color="#4fb3ff" />
      </BaseCard>
      <BaseCard title="Runs by goal" subtitle="Subjective run context from enrichment">
        <div class="list-stack">
          <article v-for="item in runningSummary.goalBreakdown" :key="item.id">
            <strong>{{ item.goal }}</strong>
            <span>{{ formatDate(item.date) }} · {{ formatDistance(item.distanceKm) }} · {{ formatPace(item.pace) }}</span>
          </article>
          <p v-if="!runningSummary.goalBreakdown.length" class="muted">Add a goal on workout details to compare similar runs.</p>
        </div>
      </BaseCard>
      <BaseCard title="Running history">
        <div class="list-stack">
          <article v-for="item in runningSummary.history" :key="item.id">
            <strong>{{ item.date }}</strong>
            <span>{{ item.detail }}</span>
          </article>
        </div>
      </BaseCard>
    </section>

    <section v-if="activeTab === 'strength'" class="section-stack">
      <div class="card-grid">
        <TrendMetricCard title="Total volume" :value="strengthSummary.totalVolume" unit="kg" description="Volume from journaled strength exercises." />
        <TrendMetricCard title="Best e1RM" :value="strengthSummary.bestOneRepMax" unit="kg" description="Highest estimated one-rep max from journaled sets." />
        <TrendMetricCard title="Sessions reviewed" :value="strengthSummary.sessions" description="Strength workouts with exercise context." />
      </div>
      <BaseCard title="Strength volume" subtitle="Total lifted volume by session">
        <SportTrendChart title="Strength volume" :labels="strengthSummary.labels" :values="strengthSummary.volumeValues" color="#ff6f61" />
      </BaseCard>
      <BaseCard title="Exercise history">
        <div class="list-stack">
          <article v-for="item in strengthSummary.history" :key="item.id">
            <strong>{{ item.title }}</strong>
            <span>{{ item.detail }}</span>
          </article>
        </div>
      </BaseCard>
    </section>

    <section v-if="activeTab === 'basketball'" class="section-stack">
      <div class="card-grid">
        <TrendMetricCard title="Court time" :value="basketballSummary.highIntensityMinutes" format="duration" description="Objective imported basketball court time." />
        <TrendMetricCard title="Performance feel" :value="basketballSummary.averagePerformance" description="Average journaled session performance." />
        <TrendMetricCard title="Sessions imported" :value="basketballSummary.sessions" description="Basketball sessions from Zepp data." />
      </div>
      <BaseCard title="Basketball intensity" subtitle="High-intensity minutes by session">
        <SportTrendChart title="High-intensity minutes" :labels="basketballSummary.labels" :values="basketballSummary.highIntensityValues" color="#ffb33f" />
      </BaseCard>
      <BaseCard title="Basketball history">
        <div class="list-stack">
          <article v-for="item in basketballSummary.history" :key="item.id">
            <strong>{{ item.title }}</strong>
            <span>{{ item.detail }}</span>
          </article>
        </div>
      </BaseCard>
    </section>

    <section v-if="activeTab === 'records'" class="section-stack">
      <BaseEmptyState
        v-if="!records.length"
        title="No records yet"
        message="Import and enrich workouts to start building meaningful personal benchmarks."
      />
      <div v-else class="card-grid">
        <BaseCard v-for="record in records" :key="record.id" :title="record.metricName" :subtitle="record.category">
          <strong class="record-value">{{ formatNumber(record.value, record.unit, 1) }}</strong>
          <p class="muted">{{ formatDate(record.date) }}</p>
        </BaseCard>
      </div>
    </section>

    <section v-if="activeTab === 'trends'" class="section-stack">
      <div class="card-grid">
        <TrendMetricCard title="Trend volume" :value="trendSummary.totalDurationMinutes" format="duration" description="Workout duration from backend trends." />
        <TrendMetricCard title="Trend sessions" :value="trendSummary.sessionCount" description="Sessions represented in backend trend rows." />
        <TrendMetricCard title="Sports represented" :value="trendSummary.sportCount" description="Sports represented in the current trend response." />
      </div>
      <BaseCard title="Training trend" subtitle="Weekly imported workout duration from backend analysis">
        <WorkoutTrendChart title="Weekly workout duration" :labels="trendSummary.labels" :values="trendSummary.values" />
        <div class="list-stack">
          <article v-for="item in trendSummary.history" :key="item.id">
            <strong>{{ item.title }}</strong>
            <span>{{ item.detail }}</span>
          </article>
        </div>
      </BaseCard>
    </section>
  </PageContainer>
</template>

<style scoped>
.list-stack {
  display: grid;
  gap: var(--space-3);
}

article {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-3);
}

span {
  color: var(--color-text-muted);
}

.record-value {
  display: block;
  font-size: var(--font-size-2xl);
}
</style>
