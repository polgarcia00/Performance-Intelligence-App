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
    return workoutStore.createManualWorkout(createRunningWorkout(input))
  }

  async function submitStrengthWorkout(input: StrengthWorkoutInput) {
    throwIfInvalid(validateStrengthWorkout(input))
    return workoutStore.createManualWorkout(createStrengthWorkout(input))
  }

  async function submitBasketballWorkout(input: BasketballWorkoutInput) {
    throwIfInvalid(validateBasketballWorkout(input))
    return workoutStore.createManualWorkout(createBasketballWorkout(input))
  }

  return {
    submitRunningWorkout,
    submitStrengthWorkout,
    submitBasketballWorkout,
  }
}
