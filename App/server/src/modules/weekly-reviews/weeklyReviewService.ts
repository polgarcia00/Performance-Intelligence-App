import { env } from '../../config/env.js'
import { transaction } from '../../database/pool.js'
import { AppError } from '../../middleware/errors.js'
import { getWeekRange } from '../../utils/dates.js'

export class WeeklyReviewService {
  async getCurrent(userId = env.defaultUserId): Promise<any> {
    const week = getWeekRange()
    return this.getByWeek(week.weekStart, userId)
  }

  async getByWeek(weekStart: string, userId = env.defaultUserId): Promise<any> {
    return transaction(async (client) => {
      const saved = await client.query('select * from weekly_reviews where user_id = $1 and week_start = $2', [userId, weekStart])
      if (saved.rows[0]) return saved.rows[0]
      return this.generate(client, userId, weekStart)
    })
  }

  async save(weekStart: string, body: Record<string, unknown>, userId = env.defaultUserId): Promise<any> {
    return transaction(async (client) => {
      const generated = await this.generate(client, userId, weekStart)
      const result = await client.query(
        `
        insert into weekly_reviews (
          user_id, week_start, week_end, generated_summary, running_reflection, strength_reflection,
          basketball_reflection, consistency_reflection, lessons_learned, suggested_focus, user_notes
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        on conflict (user_id, week_start) do update
        set generated_summary = excluded.generated_summary,
            running_reflection = excluded.running_reflection,
            strength_reflection = excluded.strength_reflection,
            basketball_reflection = excluded.basketball_reflection,
            consistency_reflection = excluded.consistency_reflection,
            lessons_learned = excluded.lessons_learned,
            suggested_focus = excluded.suggested_focus,
            user_notes = excluded.user_notes,
            updated_at = now()
        returning *
        `,
        [
          userId,
          generated.week_start,
          generated.week_end,
          generated.generated_summary,
          generated.running_reflection,
          generated.strength_reflection,
          generated.basketball_reflection,
          generated.consistency_reflection,
          JSON.stringify(generated.lessons_learned),
          generated.suggested_focus,
          typeof body.userNotes === 'string' ? body.userNotes : null,
        ],
      )
      return result.rows[0]
    })
  }

  async update(id: string, body: Record<string, unknown>, userId = env.defaultUserId): Promise<any> {
    return transaction(async (client) => {
      const result = await client.query(
        `
        update weekly_reviews
        set user_notes = $3,
            updated_at = now()
        where user_id = $1 and id = $2
        returning *
        `,
        [userId, id, typeof body.userNotes === 'string' ? body.userNotes : null],
      )

      if (!result.rows[0]) {
        throw new AppError(404, 'weekly_review_not_found', 'Weekly review was not found.')
      }

      return result.rows[0]
    })
  }

  private async generate(client: any, userId: string, weekStart: string): Promise<any> {
    const weekStartDate = new Date(`${weekStart}T00:00:00Z`)
    weekStartDate.setUTCDate(weekStartDate.getUTCDate() + 6)
    const weekEnd = weekStartDate.toISOString().slice(0, 10)
    const workouts = await client.query('select sport, count(*) as count, sum(duration_seconds) as duration from workouts where user_id = $1 and date between $2 and $3 group by sport', [userId, weekStart, weekEnd])
    const countBySport = Object.fromEntries(workouts.rows.map((row: any) => [row.sport, Number(row.count)]))
    const total = workouts.rows.reduce((sum: number, row: any) => sum + Number(row.count), 0)

    return {
      week_start: weekStart,
      week_end: weekEnd,
      generated_summary: total
        ? `This week had ${total} imported workouts. The journal should explain which sessions mattered most.`
        : 'No imported workouts were found for this week yet.',
      running_reflection: countBySport.running ? `Running appeared ${countBySport.running} time(s). Compare runs by training purpose before judging progress.` : 'No running sessions appeared this week.',
      strength_reflection: countBySport.strength ? `Strength appeared ${countBySport.strength} time(s). Journal exercises and RPE to understand overload.` : 'No strength sessions appeared this week.',
      basketball_reflection: countBySport.basketball ? `Basketball appeared ${countBySport.basketball} time(s). Add role, energy, shooting, and defense notes.` : 'No basketball sessions appeared this week.',
      consistency_reflection: total ? `Consistency was ${total >= 3 ? 'solid' : 'light'} based on imported workouts.` : 'Consistency cannot be assessed without imported workouts.',
      lessons_learned: ['Review the Workout Inbox before drawing conclusions from the week.'],
      suggested_focus: total ? 'Complete missing journal entries for the most important workouts.' : 'Import Zepp workouts to start the weekly story.',
    }
  }
}
