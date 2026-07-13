import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { label: 'Dashboard' },
  },
  {
    path: '/import',
    redirect: '/settings',
  },
  {
    path: '/workouts',
    name: 'workouts',
    component: () => import('@/views/WorkoutListView.vue'),
    meta: { label: 'Workout Inbox' },
  },
  {
    path: '/workouts/add-missing',
    name: 'add-missing-workout',
    component: () => import('@/views/AddMissingWorkoutView.vue'),
    meta: { label: 'Add Missing Workout' },
  },
  {
    path: '/workouts/:id',
    name: 'workout-detail',
    component: () => import('@/views/WorkoutDetailView.vue'),
    meta: { label: 'Workout Details' },
  },
  {
    path: '/performance',
    name: 'performance',
    component: () => import('@/views/PerformanceView.vue'),
    meta: { label: 'Performance' },
  },
  {
    path: '/weekly-review',
    name: 'weekly-review',
    component: () => import('@/views/WeeklyReviewView.vue'),
    meta: { label: 'Weekly Review' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsDataImportView.vue'),
    meta: { label: 'Settings / Data Import' },
  },
  {
    path: '/settings/import',
    redirect: '/settings',
  },
]
