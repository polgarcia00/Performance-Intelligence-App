import { flushPromises, mount, type ComponentMountingOptions } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { vi } from 'vitest'
import { routes } from '@/router/routes'

export async function createReadyRouter(path = '/'): Promise<Router> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })

  router.push(path)
  await router.isReady()
  return router
}

export async function mountWithAppContext(
  component: Parameters<typeof mount>[0],
  options: ComponentMountingOptions<never> = {},
  path = '/',
) {
  const router = await createReadyRouter(path)
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: false,
  })

  const wrapper = mount(component, {
    ...options,
    global: {
      ...(options.global ?? {}),
      plugins: [pinia, router, ...(options.global?.plugins ?? [])],
      stubs: {
        SportTrendChart: true,
        WorkoutTrendChart: true,
        ...(options.global?.stubs ?? {}),
      },
    },
  })

  await flushPromises()
  return { wrapper, router, pinia }
}
