import { and, desc, eq, gte, like, lte, or, sql, type SQL } from 'drizzle-orm'
import { Router } from 'express'
import { db, schema } from '../../db/client.ts'
import { ApiError, param, route } from '../../lib/http.ts'
import { toBooking } from '../../lib/serialize.ts'
import { bookingQuerySchema, bookingUpdateSchema } from '../../lib/validators.ts'

/* ------------------------------------------------------------------
   Booking requests, as the venue works through them.

   Confirming a booking is the only action with a side effect beyond the
   row itself: it takes the slot off the public calendar. So confirming
   re-checks that no other booking already holds that slot.
------------------------------------------------------------------- */

export const bookingsAdminRouter: Router = Router()

bookingsAdminRouter.get(
  '/',
  route(async (req, res) => {
    const query = bookingQuerySchema.parse(req.query)

    const filters: SQL[] = []
    if (query.status) filters.push(eq(schema.bookings.status, query.status))
    if (query.from) filters.push(gte(schema.bookings.date, query.from))
    if (query.to) filters.push(lte(schema.bookings.date, query.to))

    if (query.q) {
      const term = `%${query.q}%`
      const search = or(
        like(schema.bookings.reference, term),
        like(schema.bookings.parentName, term),
        like(schema.bookings.childName, term),
        like(schema.bookings.phone, term),
      )
      if (search) filters.push(search)
    }

    const where = filters.length > 0 ? and(...filters) : undefined

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(schema.bookings)
        .where(where)
        .orderBy(desc(schema.bookings.date), desc(schema.bookings.createdAt))
        .limit(query.limit)
        .offset(query.offset),
      db.select({ count: sql<number>`count(*)` }).from(schema.bookings).where(where),
    ])

    res.set('Cache-Control', 'no-store')
    res.json({
      bookings: rows.map(toBooking),
      total: totals[0]?.count ?? 0,
      limit: query.limit,
      offset: query.offset,
    })
  }),
)

/** Counts for the dashboard's landing screen. */
bookingsAdminRouter.get(
  '/summary',
  route(async (_req, res) => {
    const today = new Date().toISOString().slice(0, 10)

    const [byStatus, upcoming] = await Promise.all([
      db
        .select({ status: schema.bookings.status, count: sql<number>`count(*)` })
        .from(schema.bookings)
        .groupBy(schema.bookings.status),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.bookings)
        .where(and(gte(schema.bookings.date, today), eq(schema.bookings.status, 'confirmed'))),
    ])

    res.set('Cache-Control', 'no-store')
    res.json({
      byStatus: Object.fromEntries(byStatus.map((row) => [row.status, row.count])),
      upcomingConfirmed: upcoming[0]?.count ?? 0,
    })
  }),
)

bookingsAdminRouter.get(
  '/:id',
  route(async (req, res) => {
    const rows = await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, param(req, 'id')))
      .limit(1)

    const row = rows[0]
    if (!row) throw ApiError.notFound()
    res.json(toBooking(row))
  }),
)

bookingsAdminRouter.patch(
  '/:id',
  route(async (req, res) => {
    const id = param(req, 'id')
    const input = bookingUpdateSchema.parse(req.body)

    const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1)
    const booking = rows[0]
    if (!booking) throw ApiError.notFound()

    if (input.status === 'confirmed' && booking.status !== 'confirmed') {
      const holders = await db
        .select({ id: schema.bookings.id })
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.date, booking.date),
            eq(schema.bookings.time, booking.time),
            eq(schema.bookings.status, 'confirmed'),
          ),
        )

      if (holders.some((row) => row.id !== id)) {
        throw ApiError.conflict(
          'SLOT_ALREADY_CONFIRMED',
          'ამ დროზე უკვე დადასტურებულია სხვა ჯავშანი.',
        )
      }
    }

    await db
      .update(schema.bookings)
      .set({
        ...(input.status ? { status: input.status } : {}),
        ...(input.staffNote !== undefined ? { staffNote: input.staffNote } : {}),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.bookings.id, id))

    const updated = await db
      .select()
      .from(schema.bookings)
      .where(eq(schema.bookings.id, id))
      .limit(1)

    res.json(toBooking(updated[0]!))
  }),
)

/**
 * Deletion is deliberately restricted to admins: a request holds a family's
 * phone number and the venue's own record of what was agreed. Moderators
 * cancel instead, which keeps the row.
 */
bookingsAdminRouter.delete(
  '/:id',
  route(async (req, res) => {
    if (req.user?.role !== 'admin') {
      throw ApiError.forbidden('ჯავშნის წაშლა მხოლოდ ადმინისტრატორს შეუძლია.')
    }

    await db.delete(schema.bookings).where(eq(schema.bookings.id, param(req, 'id')))
    res.status(204).end()
  }),
)
