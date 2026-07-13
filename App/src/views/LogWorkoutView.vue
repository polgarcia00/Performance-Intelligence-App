<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import WorkoutEntryForm from '@/components/forms/WorkoutEntryForm.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
</script>

<template>
  <PageContainer title="Add Missing Workout" eyebrow="Fallback tool" description="Use this only when a workout is missing from Zepp and cannot be imported. Imported Zepp workouts remain the primary workflow.">
    <BaseCard title="Fallback workout entry" subtitle="This creates a manual-only workout in temporary frontend state for review/debug use.">
      <WorkoutEntryForm />
    </BaseCard>
  </PageContainer>
</template>
