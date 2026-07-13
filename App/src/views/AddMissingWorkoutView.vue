<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import WorkoutEntryForm from '@/components/forms/WorkoutEntryForm.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
</script>

<template>
  <PageContainer title="Add Missing Workout" eyebrow="Manual fallback" description="Add a workout that Zepp missed. Zepp import remains the primary workflow.">
    <BaseCard title="Missing workout details" subtitle="Enter the objective facts now, then add performance journal context on the workout details page.">
      <WorkoutEntryForm />
    </BaseCard>
  </PageContainer>
</template>
