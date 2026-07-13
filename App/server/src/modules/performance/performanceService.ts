import { env } from '../../config/env.js'
import { transaction } from '../../database/pool.js'
import { average, sum } from '../../utils/numbers.js'

function weekStartKey(value: unknown): string {
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() - day + 1)
  return utc.toISOString().slice(0, 10)
}

export class PerformanceService {
  async running(userId = env.defaultUserId): Promise<any> {
    return transaction(async (client) => {
      const result = await client.query(
        `
        select w.id, w.date, w.duration_seconds, m.distance_meters, m.pace_seconds_per_km, j.training_purpose, j.perceived_effort, j.perceived_performance
        from workouts w
        join running_workout_metrics m on m.workout_id = w.id
        left join running_journal_entries j on j.workout_id = w.id
        where w.user_id = $1
        order by w.date desc
        `,
        [userId],
      )
      const grouped = new Map<string, any[]>()
      for (const row of result.rows) {
        const purpose = row.training_purpose ?? 'unreviewed'
        grouped.set(purpose, [...(grouped.get(purpose) ?? []), row])
      }

      return {
        sessions: result.rows,
        groupedByTrainingPurpose: [...grouped.entries()].map(([trainingPurpose, rows]) => {
          const recent = rows.slice(0, Math.ceil(rows.length / 2))
          const previous = rows.slice(Math.ceil(rows.length / 2))
          const recentAveragePaceSecondsPerKm = recent.length >= 2 ? (average(recent.map((row: any) => Number(row.pace_seconds_per_km))) ?? null) : null
          const previousAveragePaceSecondsPerKm = previous.length >= 2 ? (average(previous.map((row: any) => Number(row.pace_seconds_per_km))) ?? null) : null
          return {
            trainingPurpose,
            workoutCount: rows.length,
            totalDistanceMeters: sum(rows.map((row: any) => Number(row.distance_meters))),
            averagePaceSecondsPerKm: average(rows.map((row: any) => Number(row.pace_seconds_per_km))),
            recentAveragePaceSecondsPerKm,
            previousAveragePaceSecondsPerKm,
            paceChangeSecondsPerKm:
              recentAveragePaceSecondsPerKm !== null && previousAveragePaceSecondsPerKm !== null
                ? recentAveragePaceSecondsPerKm - previousAveragePaceSecondsPerKm
                : null,
            averagePerceivedEffort: average(rows.map((row: any) => Number(row.perceived_effort))),
            averagePerceivedPerformance: average(rows.map((row: any) => Number(row.perceived_performance))),
            insufficientData: rows.length < 2,
          }
        }),
        summary: {
          totalDistanceMeters: sum(result.rows.map((row: any) => Number(row.distance_meters))),
          averagePaceSecondsPerKm: average(result.rows.map((row: any) => Number(row.pace_seconds_per_km))),
        },
      }
    })
  }

  async strength(userId = env.defaultUserId): Promise<any> {
    return transaction(async (client) => {
      const result = await client.query(
        `
        select w.id, w.date, e.name, e.muscle_group, s.reps, s.weight_kg, s.rpe, s.estimated_one_rep_max_kg
        from workouts w
        left join strength_exercises e on e.workout_id = w.id
        left join strength_sets s on s.exercise_id = e.id
        where w.user_id = $1 and w.sport = 'strength'
        order by w.date desc, e.sort_order, s.sort_order
        `,
        [userId],
      )
      const rows = result.rows
      const totalVolumeByExercise = new Map<string, { exerciseName: string; totalVolumeKg: number; setCount: number; bestEstimatedOneRepMaxKg: number; workoutIds: Set<string> }>()
      const weeklyVolume = new Map<string, number>()

      for (const row of rows) {
        if (!row.name) continue
        const volume = Number(row.reps ?? 0) * Number(row.weight_kg ?? 0)
        const exerciseName = String(row.name)
        const current = totalVolumeByExercise.get(exerciseName) ?? {
          exerciseName,
          totalVolumeKg: 0,
          setCount: 0,
          bestEstimatedOneRepMaxKg: 0,
          workoutIds: new Set<string>(),
        }
        current.totalVolumeKg += volume
        current.setCount += row.reps === null || row.weight_kg === null ? 0 : 1
        current.bestEstimatedOneRepMaxKg = Math.max(current.bestEstimatedOneRepMaxKg, Number(row.estimated_one_rep_max_kg ?? 0))
        current.workoutIds.add(String(row.id))
        totalVolumeByExercise.set(exerciseName, current)

        const weekStart = weekStartKey(row.date)
        weeklyVolume.set(weekStart, (weeklyVolume.get(weekStart) ?? 0) + volume)
      }

      const exerciseSummaries = [...totalVolumeByExercise.values()].map((item) => ({
        exerciseName: item.exerciseName,
        totalVolumeKg: item.totalVolumeKg,
        setCount: item.setCount,
        sessionCount: item.workoutIds.size,
        bestEstimatedOneRepMaxKg: item.bestEstimatedOneRepMaxKg,
      }))

      return {
        sets: rows,
        summary: {
          totalVolumeKg: sum(rows.map((row: any) => Number(row.reps ?? 0) * Number(row.weight_kg ?? 0))),
          bestEstimatedOneRepMaxKg: Math.max(0, ...rows.map((row: any) => Number(row.estimated_one_rep_max_kg ?? 0))),
          insufficientData: !rows.some((row: any) => row.name && row.reps !== null && row.weight_kg !== null),
        },
        weeklyVolumeTrend: [...weeklyVolume.entries()].map(([weekStart, totalVolumeKg]) => ({ weekStart, totalVolumeKg })),
        exerciseVolume: exerciseSummaries.map(({ exerciseName, totalVolumeKg, setCount }) => ({ exerciseName, totalVolumeKg, setCount })),
        exerciseFrequency: exerciseSummaries.map(({ exerciseName, sessionCount }) => ({ exerciseName, sessionCount })),
        recentProgression: exerciseSummaries.map(({ exerciseName, bestEstimatedOneRepMaxKg }) => ({ exerciseName, bestEstimatedOneRepMaxKg })),
      }
    })
  }

  async basketball(userId = env.defaultUserId): Promise<any> {
    return transaction(async (client) => {
      const result = await client.query(
        `
        select w.id, w.date, w.duration_seconds, m.court_time_seconds, m.high_intensity_seconds,
          j.session_type, j.perceived_performance, j.perceived_effort, j.energy, j.explosiveness, j.shooting, j.defense, j.role
        from workouts w
        left join basketball_workout_metrics m on m.workout_id = w.id
        left join basketball_journal_entries j on j.workout_id = w.id
        where w.user_id = $1 and w.sport = 'basketball'
        order by w.date desc
        `,
        [userId],
      )
      const rows = result.rows
      const recent = rows.slice(0, Math.ceil(rows.length / 2))
      const previous = rows.slice(Math.ceil(rows.length / 2))
      const recentAveragePerformance = recent.length >= 2 ? (average(recent.map((row: any) => Number(row.perceived_performance))) ?? null) : null
      const previousAveragePerformance = previous.length >= 2 ? (average(previous.map((row: any) => Number(row.perceived_performance))) ?? null) : null

      return {
        sessions: rows,
        summary: {
          sessionCount: rows.length,
          totalCourtTimeSeconds: sum(rows.map((row: any) => Number(row.court_time_seconds ?? row.duration_seconds ?? 0))),
          averagePerformance: average(rows.map((row: any) => Number(row.perceived_performance))),
          averageEffort: average(rows.map((row: any) => Number(row.perceived_effort))),
          averageEnergy: average(rows.map((row: any) => Number(row.energy))),
          averageShooting: average(rows.map((row: any) => Number(row.shooting))),
          averageDefense: average(rows.map((row: any) => Number(row.defense))),
          averageExplosiveness: average(rows.map((row: any) => Number(row.explosiveness))),
          performanceChange:
            recentAveragePerformance !== null && previousAveragePerformance !== null
              ? recentAveragePerformance - previousAveragePerformance
              : null,
          insufficientData: rows.length < 2 || !rows.some((row: any) => row.perceived_performance !== null),
        },
      }
    })
  }

  async records(userId = env.defaultUserId): Promise<any> {
    return transaction(async (client) => {
      const recordQueries = [
          `
          select w.id as workout_id, 'running' as sport, 'Longest run' as metric_name, w.distance_meters as value, 'm' as unit, w.started_at as achieved_at
          from workouts w
          where w.user_id = $1 and w.sport = 'running' and w.distance_meters is not null
          order by w.distance_meters desc nulls last
          limit 1
          `,
          `
          select w.id as workout_id, 'running' as sport, 'Fastest comparable pace' as metric_name, m.pace_seconds_per_km as value, 's/km' as unit, w.started_at as achieved_at
          from workouts w
          join running_workout_metrics m on m.workout_id = w.id
          left join running_journal_entries j on j.workout_id = w.id
          where w.user_id = $1 and w.sport = 'running' and m.pace_seconds_per_km is not null and j.training_purpose is not null
          order by m.pace_seconds_per_km asc
          limit 1
          `,
          `
          select w.id as workout_id, w.sport, 'Longest workout' as metric_name, w.duration_seconds as value, 's' as unit, w.started_at as achieved_at
          from workouts w
          where w.user_id = $1
          order by w.duration_seconds desc
          limit 1
          `,
          `
          select w.id as workout_id, 'strength' as sport, concat('Highest weight - ', e.name) as metric_name, s.weight_kg as value, 'kg' as unit, w.started_at as achieved_at
          from workouts w
          join strength_exercises e on e.workout_id = w.id
          join strength_sets s on s.exercise_id = e.id
          where w.user_id = $1
          order by s.weight_kg desc
          limit 1
          `,
          `
          select w.id as workout_id, 'strength' as sport, concat('Best e1RM - ', e.name) as metric_name, s.estimated_one_rep_max_kg as value, 'kg' as unit, w.started_at as achieved_at
          from workouts w
          join strength_exercises e on e.workout_id = w.id
          join strength_sets s on s.exercise_id = e.id
          where w.user_id = $1 and s.estimated_one_rep_max_kg is not null
          order by s.estimated_one_rep_max_kg desc
          limit 1
          `,
          "select w.id as workout_id, 'basketball' as sport, 'Best perceived performance' as metric_name, j.perceived_performance as value, '/10' as unit, w.started_at as achieved_at from workouts w join basketball_journal_entries j on j.workout_id = w.id where w.user_id = $1 and j.perceived_performance is not null order by j.perceived_performance desc limit 1",
          "select w.id as workout_id, 'basketball' as sport, 'Best shooting rating' as metric_name, j.shooting as value, '/10' as unit, w.started_at as achieved_at from workouts w join basketball_journal_entries j on j.workout_id = w.id where w.user_id = $1 and j.shooting is not null order by j.shooting desc limit 1",
          "select w.id as workout_id, 'basketball' as sport, 'Best explosiveness rating' as metric_name, j.explosiveness as value, '/10' as unit, w.started_at as achieved_at from workouts w join basketball_journal_entries j on j.workout_id = w.id where w.user_id = $1 and j.explosiveness is not null order by j.explosiveness desc limit 1",
          "select w.id as workout_id, 'basketball' as sport, 'Longest basketball session' as metric_name, w.duration_seconds as value, 's' as unit, w.started_at as achieved_at from workouts w where w.user_id = $1 and w.sport = 'basketball' order by w.duration_seconds desc limit 1",
      ]
      const recordResults = []
      for (const query of recordQueries) {
        recordResults.push(await client.query(query, [userId]))
      }
      const records = recordResults
        .flatMap((result) => result.rows)
        .map((row: any, index: number) => ({ id: `${row.sport}-${row.metric_name}-${index}`, ...row }))
      return { records }
    })
  }

  async trends(userId = env.defaultUserId): Promise<any> {
    return transaction(async (client) => {
      const result = await client.query(
        `
        select date_trunc('week', date)::date as week_start, sport, count(*) as sessions, sum(duration_seconds) as duration_seconds
        from workouts
        where user_id = $1
        group by week_start, sport
        order by week_start desc
        `,
        [userId],
      )
      return { trends: result.rows }
    })
  }
}
