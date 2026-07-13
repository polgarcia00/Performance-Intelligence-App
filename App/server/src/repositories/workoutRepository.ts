import type { ManualWorkoutInput } from '../types/domain.js'

export interface WorkoutFilters {
  sport?: string
  status?: string
  from?: string
  to?: string
  page: number
  pageSize: number
  sort?: string
}

export class WorkoutRepository {
  async createManualWorkout(client: any, userId: string, workout: ManualWorkoutInput): Promise<string> {
    const result = await client.query(
      `
      insert into workouts (
        user_id, source, sport, started_at, date, duration_seconds, distance_meters,
        calories, average_heart_rate, max_heart_rate
      )
      values ($1, 'manual', $2, $3, $4, $5, $6, $7, $8, $9)
      returning id
      `,
      [
        userId,
        workout.sport,
        workout.startedAt,
        workout.date,
        workout.durationSeconds,
        workout.distanceMeters,
        workout.calories,
        workout.averageHeartRate,
        workout.maxHeartRate,
      ],
    )
    return result.rows[0].id
  }

  async createManualWorkoutMetrics(client: any, workoutId: string, workout: ManualWorkoutInput, paceSecondsPerKm?: number): Promise<void> {
    if (workout.sport === 'running') {
      await client.query(
        `
        insert into running_workout_metrics (workout_id, distance_meters, pace_seconds_per_km)
        values ($1, $2, $3)
        `,
        [workoutId, workout.distanceMeters, paceSecondsPerKm],
      )
      return
    }

    if (workout.sport === 'strength') {
      await client.query(
        `
        insert into strength_workout_metrics (
          workout_id, detected_duration_seconds, detected_calories, detected_average_heart_rate
        )
        values ($1, $2, $3, $4)
        `,
        [workoutId, workout.durationSeconds, workout.calories, workout.averageHeartRate],
      )
      return
    }

    await client.query(
      `
      insert into basketball_workout_metrics (workout_id, court_time_seconds)
      values ($1, $2)
      `,
      [workoutId, workout.durationSeconds],
    )
  }

  async listWorkouts(client: any, userId: string, filters: WorkoutFilters): Promise<any[]> {
    const conditions = ['w.user_id = $1']
    const params: unknown[] = [userId]

    if (filters.sport) {
      params.push(filters.sport)
      conditions.push(`w.sport = $${params.length}`)
    }
    if (filters.from) {
      params.push(filters.from)
      conditions.push(`w.date >= $${params.length}`)
    }
    if (filters.to) {
      params.push(filters.to)
      conditions.push(`w.date <= $${params.length}`)
    }

    const statusCondition = this.statusCondition(filters.status)
    params.push(filters.pageSize, (filters.page - 1) * filters.pageSize)
    const result = await client.query(
      `
      with workout_status_base as (
        select w.*,
          rj.training_purpose, rj.route_type as running_route_type, rj.notes as running_notes,
          rj.perceived_effort as running_effort, rj.perceived_performance as running_performance,
          sj.session_type as strength_session_type, sj.notes as strength_notes,
          coalesce(strength_counts.exercise_count, 0) as strength_exercise_count,
          coalesce(strength_counts.exercise_with_set_count, 0) as strength_exercise_with_set_count,
          coalesce(strength_counts.set_count, 0) as strength_set_count,
          coalesce(strength_counts.valid_set_count, 0) as strength_valid_set_count,
          bj.session_type as basketball_session_type, bj.perceived_performance as basketball_performance,
          bj.perceived_effort as basketball_effort, bj.energy as basketball_energy,
          bj.shooting as basketball_shooting, bj.defense as basketball_defense,
          bj.role as basketball_role, bj.notes as basketball_notes
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
        where ${conditions.join(' and ')}
      )
      select *
      from workout_status_base
      ${statusCondition ? `where ${statusCondition}` : ''}
      order by date ${filters.sort === 'asc' ? 'asc' : 'desc'}, started_at ${filters.sort === 'asc' ? 'asc' : 'desc'}
      limit $${params.length - 1} offset $${params.length}
      `,
      params,
    )
    return result.rows
  }

  private statusCondition(status?: string): string {
    const runningComplete = "(sport = 'running' and training_purpose is not null and running_effort between 1 and 10 and running_performance between 1 and 10)"
    const strengthComplete =
      "(sport = 'strength' and strength_exercise_count > 0 and strength_exercise_with_set_count = strength_exercise_count and strength_set_count > 0 and strength_set_count = strength_valid_set_count)"
    const basketballComplete =
      "(sport = 'basketball' and basketball_session_type is not null and basketball_performance between 1 and 10 and basketball_effort between 1 and 10 and basketball_energy between 1 and 10 and basketball_shooting between 1 and 10 and basketball_defense between 1 and 10 and basketball_role is not null)"
    const complete = `(${runningComplete} or ${strengthComplete} or ${basketballComplete})`
    const touched =
      "((sport = 'running' and (training_purpose is not null or running_route_type is not null or running_notes is not null or running_effort is not null or running_performance is not null)) or " +
      "(sport = 'strength' and (strength_session_type is not null or strength_notes is not null or strength_exercise_count > 0)) or " +
      "(sport = 'basketball' and (basketball_session_type is not null or basketball_role is not null or basketball_notes is not null or basketball_performance is not null or basketball_effort is not null or basketball_energy is not null or basketball_shooting is not null or basketball_defense is not null)))"

    if (status === 'completed') return complete
    if (status === 'partially_enriched') return `(${touched} and not ${complete})`
    if (status === 'needs_enrichment') return `(not ${touched})`
    return ''
  }

  async getWorkoutById(client: any, userId: string, workoutId: string): Promise<any | null> {
    const result = await client.query('select * from workouts where user_id = $1 and id = $2', [userId, workoutId])
    return result.rows[0] ?? null
  }

  async getWorkoutDetail(client: any, userId: string, workoutId: string): Promise<any | null> {
    const workout = await this.getWorkoutById(client, userId, workoutId)
    if (!workout) return null

    const runningMetrics = await client.query('select * from running_workout_metrics where workout_id = $1', [workoutId])
    const strengthMetrics = await client.query('select * from strength_workout_metrics where workout_id = $1', [workoutId])
    const basketballMetrics = await client.query('select * from basketball_workout_metrics where workout_id = $1', [workoutId])
    const runningJournal = await client.query('select * from running_journal_entries where workout_id = $1', [workoutId])
    const strengthJournal = await client.query('select * from strength_journal_entries where workout_id = $1', [workoutId])
    const strengthExercises = await client.query(
      `
      select e.*, coalesce(json_agg(s.* order by s.sort_order) filter (where s.id is not null), '[]') as sets
      from strength_exercises e
      left join strength_sets s on s.exercise_id = e.id
      where e.workout_id = $1
      group by e.id
      order by e.sort_order
      `,
      [workoutId],
    )
    const basketballJournal = await client.query('select * from basketball_journal_entries where workout_id = $1', [workoutId])

    return {
      workout,
      objectiveMetrics: {
        running: runningMetrics.rows[0] ?? null,
        strength: strengthMetrics.rows[0] ?? null,
        basketball: basketballMetrics.rows[0] ?? null,
      },
      journal: {
        running: runningJournal.rows[0] ?? null,
        strength: strengthJournal.rows[0] ? { ...strengthJournal.rows[0], exercises: strengthExercises.rows } : null,
        basketball: basketballJournal.rows[0] ?? null,
      },
    }
  }
}
