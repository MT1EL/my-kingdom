import { and, asc, eq } from 'drizzle-orm'
import { Router } from 'express'
import { db, schema } from '../../db/client.ts'
import { ApiError, param, route } from '../../lib/http.ts'
import { newId } from '../../lib/ids.ts'
import {
  blackoutDateSchema,
  scheduleSlotSchema,
  scheduleSlotUpdateSchema,
} from '../../lib/validators.ts'
import type { BlackoutDate, ScheduleSlot } from '../../../../shared/types.ts'

/* ------------------------------------------------------------------
   When the venue is open.

   Two things drive the booking calendar:
     - `schedule_slots` — the recurring weekly pattern,
     - `blackout_dates` — one-off closures that override it.

   Both are edited here; `lib/availability.ts` reads them.
------------------------------------------------------------------- */

export const scheduleRouter: Router = Router()

const toScheduleSlot = (row: typeof schema.scheduleSlots.$inferSelect): ScheduleSlot & {
  published: boolean
} => ({
  id: row.id,
  weekday: row.weekday,
  time: row.time,
  durationMinutes: row.durationMinutes,
  published: row.published,
})

const toBlackout = (row: typeof schema.blackoutDates.$inferSelect): BlackoutDate => ({
  id: row.id,
  date: row.date,
  reason: row.reason ?? null,
})

/* ----------------------------- slots ----------------------------- */

scheduleRouter.get(
  '/slots',
  route(async (_req, res) => {
    const rows = await db
      .select()
      .from(schema.scheduleSlots)
      .orderBy(asc(schema.scheduleSlots.weekday), asc(schema.scheduleSlots.time))

    res.json(rows.map(toScheduleSlot))
  }),
)

/**
 * `(weekday, time)` is unique in the database. Checking it here turns what
 * would be a 500 from the constraint into a message the dashboard can show.
 */
async function assertSlotIsFree(weekday: number, time: string, ignoreId?: string): Promise<void> {
  const rows = await db
    .select({ id: schema.scheduleSlots.id })
    .from(schema.scheduleSlots)
    .where(and(eq(schema.scheduleSlots.weekday, weekday), eq(schema.scheduleSlots.time, time)))

  if (rows.some((row) => row.id !== ignoreId)) {
    throw ApiError.conflict('SLOT_EXISTS', 'ამ დღეს ეს საათი უკვე დამატებულია.')
  }
}

scheduleRouter.post(
  '/slots',
  route(async (req, res) => {
    const input = scheduleSlotSchema.parse(req.body)
    await assertSlotIsFree(input.weekday, input.time)

    const id = newId()
    await db.insert(schema.scheduleSlots).values({ id, ...input })

    const rows = await db.select().from(schema.scheduleSlots).where(eq(schema.scheduleSlots.id, id))
    res.status(201).json(rows.map(toScheduleSlot)[0])
  }),
)

scheduleRouter.patch(
  '/slots/:id',
  route(async (req, res) => {
    const id = param(req, 'id')
    const input = scheduleSlotUpdateSchema.parse(req.body)

    const current = (
      await db.select().from(schema.scheduleSlots).where(eq(schema.scheduleSlots.id, id)).limit(1)
    )[0]

    if (!current) throw ApiError.notFound()

    await assertSlotIsFree(input.weekday ?? current.weekday, input.time ?? current.time, id)

    await db
      .update(schema.scheduleSlots)
      .set({ ...input, updatedAt: new Date().toISOString() })
      .where(eq(schema.scheduleSlots.id, id))

    const rows = await db.select().from(schema.scheduleSlots).where(eq(schema.scheduleSlots.id, id))
    res.json(rows.map(toScheduleSlot)[0])
  }),
)

scheduleRouter.delete(
  '/slots/:id',
  route(async (req, res) => {
    await db.delete(schema.scheduleSlots).where(eq(schema.scheduleSlots.id, param(req, 'id')))
    res.status(204).end()
  }),
)

/* --------------------------- blackouts --------------------------- */

scheduleRouter.get(
  '/blackouts',
  route(async (_req, res) => {
    const rows = await db
      .select()
      .from(schema.blackoutDates)
      .orderBy(asc(schema.blackoutDates.date))

    res.json(rows.map(toBlackout))
  }),
)

scheduleRouter.post(
  '/blackouts',
  route(async (req, res) => {
    const input = blackoutDateSchema.parse(req.body)

    const existing = await db
      .select({ id: schema.blackoutDates.id })
      .from(schema.blackoutDates)
      .where(eq(schema.blackoutDates.date, input.date))
      .limit(1)

    if (existing.length > 0) {
      throw ApiError.conflict('BLACKOUT_EXISTS', 'ეს თარიღი უკვე დახურულია.')
    }

    const id = newId()
    await db.insert(schema.blackoutDates).values({ id, date: input.date, reason: input.reason })

    res.status(201).json({ id, date: input.date, reason: input.reason })
  }),
)

scheduleRouter.delete(
  '/blackouts/:id',
  route(async (req, res) => {
    await db.delete(schema.blackoutDates).where(eq(schema.blackoutDates.id, param(req, 'id')))
    res.status(204).end()
  }),
)
