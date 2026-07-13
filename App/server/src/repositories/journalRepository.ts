import type { BasketballJournalInput, RunningJournalInput, StrengthJournalInput } from '../types/domain.js'
import { estimateOneRepMaxKg } from '../utils/numbers.js'

export class JournalRepository {
  async upsertRunningJournal(client: any, workoutId: string, input: RunningJournalInput): Promise<void> {
    await client.query(
      `
      insert into running_journal_entries (
        workout_id, training_purpose, perceived_effort, perceived_performance, route_type, felt_strong, notes
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      on conflict (workout_id) do update
      set training_purpose = excluded.training_purpose,
          perceived_effort = excluded.perceived_effort,
          perceived_performance = excluded.perceived_performance,
          route_type = excluded.route_type,
          felt_strong = excluded.felt_strong,
          notes = excluded.notes,
          updated_at = now()
      `,
      [workoutId, input.trainingPurpose, input.perceivedEffort, input.perceivedPerformance, input.routeType, input.feltStrong, input.notes],
    )
  }

  async upsertBasketballJournal(client: any, workoutId: string, input: BasketballJournalInput): Promise<void> {
    await client.query(
      `
      insert into basketball_journal_entries (
        workout_id, session_type, perceived_performance, perceived_effort, energy, explosiveness,
        shooting, defense, role, outcome, notes
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      on conflict (workout_id) do update
      set session_type = excluded.session_type,
          perceived_performance = excluded.perceived_performance,
          perceived_effort = excluded.perceived_effort,
          energy = excluded.energy,
          explosiveness = excluded.explosiveness,
          shooting = excluded.shooting,
          defense = excluded.defense,
          role = excluded.role,
          outcome = excluded.outcome,
          notes = excluded.notes,
          updated_at = now()
      `,
      [
        workoutId,
        input.sessionType,
        input.perceivedPerformance,
        input.perceivedEffort,
        input.energy,
        input.explosiveness,
        input.shooting,
        input.defense,
        input.role,
        input.outcome,
        input.notes,
      ],
    )
  }

  async replaceStrengthJournal(client: any, workoutId: string, input: StrengthJournalInput): Promise<void> {
    await client.query(
      `
      insert into strength_journal_entries (workout_id, session_type, notes)
      values ($1, $2, $3)
      on conflict (workout_id) do update
      set session_type = excluded.session_type,
          notes = excluded.notes,
          updated_at = now()
      `,
      [workoutId, input.sessionType, input.notes],
    )

    await client.query('delete from strength_exercises where workout_id = $1', [workoutId])

    for (const [exerciseIndex, exercise] of input.exercises.entries()) {
      const exerciseResult = await client.query(
        'insert into strength_exercises (workout_id, name, muscle_group, sort_order) values ($1, $2, $3, $4) returning id',
        [workoutId, exercise.name, exercise.muscleGroup, exerciseIndex],
      )
      const exerciseId = exerciseResult.rows[0].id

      for (const [setIndex, set] of exercise.sets.entries()) {
        await client.query(
          `
          insert into strength_sets (exercise_id, set_number, reps, weight_kg, rpe, estimated_one_rep_max_kg, sort_order)
          values ($1, $2, $3, $4, $5, $6, $7)
          `,
          [exerciseId, set.setNumber, set.reps, set.weightKg, set.rpe, estimateOneRepMaxKg(set.weightKg, set.reps), setIndex],
        )
      }
    }
  }
}
