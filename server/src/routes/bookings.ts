import { and, eq, inArray } from 'drizzle-orm'
import { Router } from 'express'
import { db, schema } from '../db/client.ts'
import { env } from '../env.ts'
import { getAvailability, getDayAvailability, isISODate } from '../lib/availability.ts'
import { ApiError, route } from '../lib/http.ts'
import { newId } from '../lib/ids.ts'
import { notifyBookingReceived } from '../lib/email/index.ts'
import { toBooking } from '../lib/serialize.ts'
import { availabilityQuerySchema, bookingRequestSchema, normalisePhone } from '../lib/validators.ts'
import type { BookingRequestResult, ISODate } from '../../../shared/types.ts'

/* ------------------------------------------------------------------
   Public booking endpoints.

   A submission is a *request*, not a confirmation: the venue calls the
   family back and confirms in the dashboard. That is why this route never
   marks a slot as taken — see `lib/availability.ts`.
------------------------------------------------------------------- */

export const bookingsRouter: Router = Router()

/**
 * The switch, in front of every booking endpoint.
 *
 * With `BOOKING_ENABLED=false` the routes below stay registered but are
 * never reached, so no request can be made while the venue is not taking
 * them — including from a stale tab or a script calling the API directly,
 * neither of which the site's own switch reaches. 503 rather than 404: the
 * endpoint exists, it is just closed for now.
 */
bookingsRouter.use((_req, _res, next) => {
  if (env.bookingEnabled) {
    next()
    return
  }
  next(
    ApiError.unavailable(
      'BOOKING_DISABLED',
      'ონლაინ ჯავშანი დროებით გათიშულია. გთხოვთ, დაგვიკავშირდეთ ტელეფონით ან Facebook-ით.',
    ),
  )
})

/** How far ahead the calendar may be queried, from site settings. */
async function bookingWindow(): Promise<{ minLeadDays: number; maxAheadDays: number; maxChildren: number }> {
  const rows = await db
    .select({
      minLeadDays: schema.siteSettings.minLeadDays,
      maxAheadDays: schema.siteSettings.maxAheadDays,
      maxChildren: schema.siteSettings.maxChildren,
    })
    .from(schema.siteSettings)
    .limit(1)

  return rows[0] ?? { minLeadDays: 1, maxAheadDays: 90, maxChildren: 40 }
}

const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date)
  copy.setUTCDate(copy.getUTCDate() + days)
  return copy
}

const toISO = (date: Date): ISODate => date.toISOString().slice(0, 10)

/** Human-friendly reference the family can quote when the venue calls back. */
function buildReference(date: ISODate): string {
  const compact = date.replaceAll('-', '').slice(2)
  const suffix = String(Math.floor(Math.random() * 9000) + 1000)
  return `MK-${compact}-${suffix}`
}

bookingsRouter.get(
  '/availability',
  route(async (req, res) => {
    const query = availabilityQuerySchema.parse(req.query)
    if (query.from > query.to) {
      throw ApiError.badRequest('`from` თარიღი `to`-ზე გვიან ვერ იქნება.')
    }

    const { minLeadDays, maxAheadDays } = await bookingWindow()
    const today = new Date(`${toISO(new Date())}T12:00:00Z`)
    const earliest = toISO(addDays(today, minLeadDays))
    const latest = toISO(addDays(today, maxAheadDays))

    // Clamp rather than reject: the calendar asks for whole months, and the
    // window cuts across them at both ends.
    const from = query.from < earliest ? earliest : query.from
    const to = query.to > latest ? latest : query.to
    if (from > to) {
      res.json([])
      return
    }

    const days = await getAvailability(from, to)
    res.set('Cache-Control', 'no-store')
    res.json(days)
  }),
)

bookingsRouter.post(
  '/booking-requests',
  route(async (req, res) => {
    const { minLeadDays, maxAheadDays, maxChildren } = await bookingWindow()
    const body = bookingRequestSchema(maxChildren).parse(req.body)

    if (!isISODate(body.date)) {
      throw ApiError.badRequest('თარიღის ფორმატი არასწორია.', { date: 'თარიღი არასწორია' })
    }

    // The window is re-checked here: a form left open overnight must not be
    // able to book a date that has since fallen inside the lead time.
    const today = new Date(`${toISO(new Date())}T12:00:00Z`)
    const earliest = toISO(addDays(today, minLeadDays))
    const latest = toISO(addDays(today, maxAheadDays))
    if (body.date < earliest || body.date > latest) {
      throw ApiError.badRequest('არჩეული თარიღი ჯავშნის პერიოდში არ არის.', {
        date: 'აირჩიეთ სხვა თარიღი',
      })
    }

    // Distinguish "we are closed" from "that hour is taken" — they lead the
    // family to different next steps.
    const day = await getDayAvailability(body.date)
    if (!day.open) {
      throw ApiError.conflict('DAY_CLOSED', 'ამ დღეს დაკეტილი ვართ. გთხოვთ, აირჩიოთ სხვა თარიღი.')
    }
    if (!day.slots.some((slot) => slot.time === body.time && slot.available)) {
      throw ApiError.conflict(
        'SLOT_UNAVAILABLE',
        'ეს დრო უკვე დაკავებულია. გთხოვთ, აირჩიოთ სხვა საათი.',
      )
    }

    // Referenced content must exist and be published, so the dashboard never
    // shows a booking pointing at a programme nobody offers.
    const program = await db
      .select({ id: schema.programs.id })
      .from(schema.programs)
      .where(and(eq(schema.programs.id, body.programId), eq(schema.programs.published, true)))
      .limit(1)

    if (program.length === 0) {
      throw ApiError.badRequest('არჩეული პროგრამა ვერ მოიძებნა.', {
        programId: 'აირჩიეთ პროგრამა თავიდან',
      })
    }

    const validExtras =
      body.extraIds.length === 0
        ? []
        : await db
            .select({ id: schema.extras.id })
            .from(schema.extras)
            .where(and(inArray(schema.extras.id, body.extraIds), eq(schema.extras.published, true)))

    const submittedAt = new Date().toISOString()

    // A duplicate reference is astronomically unlikely but not impossible;
    // retry rather than fail a family's booking on a collision.
    let reference = buildReference(body.date)
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const clash = await db
        .select({ id: schema.bookings.id })
        .from(schema.bookings)
        .where(eq(schema.bookings.reference, reference))
        .limit(1)
      if (clash.length === 0) break
      reference = buildReference(body.date)
    }

    const bookingId = newId()

    const [inserted] = await db
      .insert(schema.bookings)
      .values({
        id: bookingId,
        reference,
        date: body.date,
        time: body.time,
        programId: body.programId,
        extraIds: JSON.stringify(validExtras.map((extra) => extra.id)),
        childName: body.childName,
        childAge: body.childAge,
        childrenCount: body.childrenCount,
        parentName: body.parentName,
        phone: normalisePhone(body.phone),
        email: body.email || null,
        notes: body.notes,
        status: 'received',
        createdAt: submittedAt,
        updatedAt: submittedAt,
      })
      .returning()

    const result: BookingRequestResult = { reference, status: 'received', submittedAt }
    res.status(201).json(result)

    // After the response, deliberately. The family should not wait on an
    // email provider, and a provider being down must never turn a saved
    // booking into an error on their screen — the request is already safe
    // in the database, and a failure here is logged, not thrown.
    if (inserted) {
      void notifyBookingReceived(toBooking(inserted))
    }
  }),
)
