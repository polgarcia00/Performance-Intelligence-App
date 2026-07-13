import { env } from '../../config/env.js'
import { transaction } from '../../database/pool.js'
import { sum } from '../../utils/numbers.js'
import { getWeekRange } from '../../utils/dates.js'

export class DashboardService {
  async summary(userId = env.defaultUserId): Promise<any> {
    return transaction(async (client) => {
      const week = getWeekRange()
      const workouts = await client.query('select * from workouts where user_id = $1 and date between $2 and $3 order by date desc', [userId, week.weekStart, week.weekEnd])
      const latestImport = await client.query('select * from import_batches where user_id = $1 order by imported_at desc limit 1', [userId])
      const inbox = await client.query(
        `
        select w.id, w.sport, w.date, w.duration_seconds
        from workouts w
        left join running_journal_entries rj on rj.workout_id = w.id
        left join strength_journal_entries sj on sj.workout_id = w.id
        left join lateral (
          select
            count(distinct e.id) as exercise_count,
            count(distinct e.id) filter (where s.id is not null) as exercise_with_set_count,
            count(s.id) as set_count,
            count(s.id) filter (where s.reps > 0 and s.weight_kg >= 0) as valid_set_count
          from strength_exercises e
          left join strength_sets s on s.exercise_id = e.id
          where e.workout_id = w.id
        ) strength_counts on true
        left join basketball_journal_entries bj on bj.workout_id = w.id
        where w.user_id = $1
          and (
            (w.sport = 'running' and (rj.training_purpose is null or rj.perceived_effort is null or rj.perceived_performance is null))
            or (
              w.sport = 'strength'
              and (
                coalesce(strength_counts.exercise_count, 0) = 0
                or coalesce(strength_counts.exercise_with_set_count, 0) <> coalesce(strength_counts.exercise_count, 0)
                or coalesce(strength_counts.set_count, 0) = 0
                or coalesce(strength_counts.set_count, 0) <> coalesce(strength_counts.valid_set_count, 0)
              )
            )
            or (w.sport = 'basketball' and (bj.session_type is null or bj.perceived_performance is null or bj.perceived_effort is null or bj.energy is null or bj.shooting is null or bj.defense is null or bj.role is null))
            or w.sport = 'unknown'
          )
        order by w.date desc
        limit 10
        `,
        [userId],
      )
      const running = workouts.rows.filter((workout: any) => workout.sport === 'running')
      const strength = workouts.rows.filter((workout: any) => workout.sport === 'strength')
      const basketball = workouts.rows.filter((workout: any) => workout.sport === 'basketball')
      const recentWorkouts = workouts.rows.slice(0, 4).map((workout: any) => ({
        id: workout.id,
        sport: workout.sport,
        date: workout.date,
        duration_seconds: workout.duration_seconds,
      }))

      return {
        whatHappened: {
          week,
          workoutCount: workouts.rows.length,
          sportDistribution: {
            running: running.length,
            strength: strength.length,
            basketball: basketball.length,
          },
          totalDurationSeconds: sum(workouts.rows.map((workout: any) => Number(workout.duration_seconds))),
          recentWorkouts,
          latestImport: latestImport.rows[0] ?? null,
        },
        needsAttention: {
          workoutsNeedingEnrichment: inbox.rows,
          missingWorkoutDetailsCount: inbox.rows.length,
        },
        whatILearned: {
          insightCards: [
            {
              title: inbox.rows.length ? 'Journal review is the next best step' : 'Journal is current',
              message: inbox.rows.length
                ? `${inbox.rows.length} imported workouts need subjective context before analysis is meaningful.`
                : 'Imported workouts have enough context for the current analysis views.',
            },
          ],
        },
        progress: {
          running: { sessions: running.length },
          strength: { sessions: strength.length },
          basketball: { sessions: basketball.length },
          longTermTrends: 'Use Performance tabs for sport-specific trends.',
        },
        weeklyFocusSuggestion: inbox.rows.length ? 'Complete missing journal entries for the workouts waiting in your inbox.' : 'Keep importing workouts and reviewing the sessions that mattered most.',
      }
    })
  }
}
