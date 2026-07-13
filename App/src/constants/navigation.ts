export interface NavigationItem {
  label: string
  to: string
  group: 'Overview' | 'Input' | 'Performance' | 'System'
  icon: string
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: 'Dashboard', to: '/dashboard', group: 'Overview', icon: 'grid' },
  { label: 'Import Zepp Workouts', to: '/import', group: 'Input', icon: 'import' },
  { label: 'Workout Inbox', to: '/workouts', group: 'Input', icon: 'list' },
  { label: 'Weekly Review', to: '/weekly-review', group: 'Overview', icon: 'calendar' },
  { label: 'Performance', to: '/performance', group: 'Performance', icon: 'chart' },
  { label: 'Settings', to: '/settings', group: 'System', icon: 'settings' },
]

export const MOBILE_NAVIGATION_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
  { label: 'Import', to: '/import', icon: 'import' },
  { label: 'Inbox', to: '/workouts', icon: 'list' },
  { label: 'Performance', to: '/performance', icon: 'chart' },
  { label: 'Settings', to: '/settings', icon: 'settings' },
] as const
