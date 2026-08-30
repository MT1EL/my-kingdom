import { and, eq, gte, inArray, lte } from 'drizzle-orm'
import { db, schema } from '../db/client.ts'
import type { DayAvailability, ISODate, TimeSlot } from '../../../shared/types.ts'

/* ------------------------------------------------------------------
   Availability.

   A slot is bookable when all three hold:
     1. the weekly schedule has that slot on that weekday,
     2. the date is not in `blackout_dates`,
     3. no *confirmed* booking already holds it.

   A booking that is only `received` does not block the slot — two families
   may ask for the same time, and the venue decides. Confirming one is what
   takes it off the calendar.
------------------------------------------------------------------- */

/** Statuses that hold a slot against other families. */
const BLOCKING_STATUSES = ['confirmed']

export function addMinutes(time: string, minutes: number): string {
  const [h = 0, m = 0] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

/** Weekday of an ISO date, read at midday so no timezone can shift it. */
export function weekdayOf(date: ISODate): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay()
}

export function isISODate(value: unknown): value is ISODate {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

/** Every date from `from` to `to`, inclusive. Capped so one request cannot scan a decade. */
export function datesBetween(from: ISODate, to: ISODate, limit = 400): ISODate[] {
  const dates: ISODate[] = []
  const cursor = new Date(`${from}T12:00:00Z`)
  const end = new Date(`${to}T12:00:00Z`)

  while (cursor.getTime() <= end.getTime() && dates.length < limit) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return dates
}

interface AvailabilityContext {
  slotsByWeekday: Map<number, { time: string; durationMinutes: number }[]>
  blackouts: Set<string>
  /** "YYYY-MM-DD HH:MM" of every slot already held by a confirmed booking. */
  taken: Set<string>
}

/** Loads the whole window in three queries, rather than three per day. */
async function loadContext(dates: ISODate[]): Promise<AvailabilityContext> {
  const first = dates[0]
  const last = dates[dates.length - 1]

  const [slotRows, blackoutRows, bookingRows] = await Promise.all([
    db
      .select()
      .from(schema.scheduleSlots)
      .where(eq(schema.scheduleSlots.published, true)),
    first && last
      ? db
          .select()
          .from(schema.blackoutDates)
          .where(
            and(gte(schema.blackoutDates.date, first), lte(schema.blackoutDates.date, last)),
          )
      : Promise.resolve([]),
    first && last
      ? db
          .select({
            date: schema.bookings.date,
            time: schema.bookings.time,
          })
          .from(schema.bookings)
          .where(
            and(
              gte(schema.bookings.date, first),
              lte(schema.bookings.date, last),
              inArray(schema.bookings.status, BLOCKING_STATUSES),
            ),
          )
      : Promise.resolve([]),
  ])

  const slotsByWeekday = new Map<number, { time: string; durationMinutes: number }[]>()
  for (const slot of slotRows) {
    const list = slotsByWeekday.get(slot.weekday) ?? []
    list.push({ time: slot.time, durationMinutes: slot.durationMinutes })
    slotsByWeekday.set(slot.weekday, list)
  }
  for (const list of slotsByWeekday.values()) {
    list.sort((a, b) => a.time.localeCompare(b.time))
  }

  return {
    slotsByWeekday,
    blackouts: new Set(blackoutRows.map((row) => row.date)),
    taken: new Set(bookingRows.map((row) => `${row.date} ${row.time}`)),
  }
}

function buildDay(date: ISODate, context: AvailabilityContext): DayAvailability {
  if (context.blackouts.has(date)) {
    return { date, open: false, slots: [] }
  }

  const configured = context.slotsByWeekday.get(weekdayOf(date))
  if (!configured || configured.length === 0) {
    return { date, open: false, slots: [] }
  }

  const slots: TimeSlot[] = configured.map((slot) => ({
    time: slot.time,
    label: `${slot.time} – ${addMinutes(slot.time, slot.durationMinutes)}`,
    available: !context.taken.has(`${date} ${slot.time}`),
  }))

  return { date, open: true, slots }
}

/** Availability for a date range, in one pass over the database. */
export async function getAvailability(from: ISODate, to: ISODate): Promise<DayAvailability[]> {
  const dates = datesBetween(from, to)
  if (dates.length === 0) return []

  const context = await loadContext(dates)
  return dates.map((date) => buildDay(date, context))
}

export async function getDayAvailability(date: ISODate): Promise<DayAvailability> {
  const [day] = await getAvailability(date, date)
  return day ?? { date, open: false, slots: [] }
}

/** Whether a specific slot can still be requested. Checked before accepting a booking. */
export async function isSlotBookable(date: ISODate, time: string): Promise<boolean> {
  const day = await getDayAvailability(date)
  return day.open && day.slots.some((slot) => slot.time === time && slot.available)
}
