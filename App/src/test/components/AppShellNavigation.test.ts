import { describe, expect, it } from 'vitest'
import AppShell from '@/components/layout/AppShell.vue'
import { mountWithAppContext } from '../test-utils'

describe('AppShell navigation', () => {
  it('renders main navigation links with a real router', async () => {
    const { wrapper } = await mountWithAppContext(AppShell)

    expect(wrapper.text()).toContain('My Performance Journal')
    expect(wrapper.text()).toContain('Powered by Performance Intelligence')
    expect(wrapper.text()).toContain('Workout Inbox')
    expect(wrapper.text()).toContain('Performance')
    expect(wrapper.text()).toContain('Import Zepp Workouts')
    expect(wrapper.text()).not.toContain('Fallback Workout Entry')
    expect(wrapper.text()).not.toContain('Log Workout')
    expect(wrapper.find('a[href="/performance"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/workouts"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/import"]').exists()).toBe(true)
    expect(wrapper.find('.desktop-nav a[href="/workouts/add-missing"]').exists()).toBe(false)
    expect(wrapper.find('.mobile-nav a[href="/workouts/add-missing"]').exists()).toBe(false)
  })
})
