import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RunningWorkoutForm from '@/components/forms/RunningWorkoutForm.vue'

describe('RunningWorkoutForm', () => {
  it('emits fallback running workout values on submit', async () => {
    const wrapper = mount(RunningWorkoutForm)

    await wrapper.find('#run-distance').setValue('8')
    await wrapper.find('#run-duration').setValue('44')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')?.[0]?.[0]).toMatchObject({
      distanceKm: 8,
      durationMinutes: 44,
    })
  })
})
