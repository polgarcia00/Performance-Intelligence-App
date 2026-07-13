import { useWorkoutStore } from '@/stores/workoutStore'
import {
  createBasketballWorkout,
  createRunningWorkout,
  createStrengthWorkout,
  type BasketballWorkoutInput,
  type RunningWorkoutInput,
  type StrengthWorkoutInput,
} from '@/utils/workoutFactories'
import {
  throwIfInvalid,
  validateBasketballWorkout,
  validateRunningWorkout,
  validateStrengthWorkout,
} from '@/utils/validation'

export type { BasketballWorkoutInput, RunningWorkoutInput, StrengthWorkoutInput }

export function useWorkoutSubmission() {
  const workoutStore = useWorkoutStore()

  async function submitRunningWorkout(input: RunningWorkoutInput) {
    throwIfInvalid(validateRunningWorkout(input))
    const { workout, session } = createRunningWorkout(input)

    await workoutStore.addRunningWorkout(workout, session)
  }

  async function submitStrengthWorkout(input: StrengthWorkoutInput) {
    throwIfInvalid(validateStrengthWorkout(input))
    const { workout, session } = createStrengthWorkout(input)

    await workoutStore.addStrengthWorkout(workout, session)
  }

  async function submitBasketballWorkout(input: BasketballWorkoutInput) {
    throwIfInvalid(validateBasketballWorkout(input))
    const { workout, session } = createBasketballWorkout(input)

    await workoutStore.addBasketballWorkout(workout, session)
  }

  return {
    submitRunningWorkout,
    submitStrengthWorkout,
    submitBasketballWorkout,
  }
}
