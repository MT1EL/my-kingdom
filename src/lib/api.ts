import { getDayAvailability } from '@/data/availability'
import type { BookingRequest, BookingRequestResult, DayAvailability, ISODate } from '@/types'
import { addDays, startOfDay, toISODate } from '@/lib/date'
import { site } from '@/data/site'

/* ------------------------------------------------------------------
   API boundary.

   Everything the UI knows about the server lives here. Today each function
   resolves against the mock data in `src/data/availability.ts`; to go live,
   replace the bodies with `fetch(...)` calls — the signatures and return
   types are already the ones a real endpoint should honour.

   Suggested endpoints:
     GET  /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD  → DayAvailability[]
     POST /api/booking-requests                            → BookingRequestResult
------------------------------------------------------------------- */

/** Simulated network latency so loading states are visible in development. */
const LATENCY_MS = 320

const delay = <T,>(value: T, ms = LATENCY_MS): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })

/** Earliest date a family may book (today + the venue's lead time). */
export function getFirstBookableDate(): Date {
  return startOfDay(addDays(new Date(), site.booking.minLeadDays))
}

/** Last date the calendar exposes. */
export function getLastBookableDate(): Date {
  return startOfDay(addDays(new Date(), site.booking.maxAheadDays))
}

export function isWithinBookingWindow(date: Date): boolean {
  const day = startOfDay(date).getTime()
  return day >= getFirstBookableDate().getTime() && day <= getLastBookableDate().getTime()
}

/** Availability for every day of a given month that falls inside the window. */
export async function fetchMonthAvailability(
  month: Date,
): Promise<Record<ISODate, DayAvailability>> {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const result: Record<ISODate, DayAvailability> = {}

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day)
    if (!isWithinBookingWindow(date)) continue
    const iso = toISODate(date)
    result[iso] = getDayAvailability(iso)
  }

  return delay(result)
}

export async function fetchDayAvailability(date: ISODate): Promise<DayAvailability> {
  return delay(getDayAvailability(date))
}

/** Human-friendly reference the family can quote when the venue calls back. */
function buildReference(date: ISODate): string {
  const compact = date.replaceAll('-', '').slice(2)
  const suffix = Math.floor(Math.random() * 9000 + 1000)
  return `MK-${compact}-${suffix}`
}

/**
 * Sends a booking *request*. This does not confirm anything: the venue
 * contacts the family to agree the details before the date is held.
 */
export async function submitBookingRequest(
  request: BookingRequest,
): Promise<BookingRequestResult> {
  // TODO: replace with
  //   const response = await fetch('/api/booking-requests', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(request),
  //   })
  //   if (!response.ok) throw new Error('BOOKING_REQUEST_FAILED')
  //   return response.json()
  if (import.meta.env.DEV) {
    console.info('[mykingdom] booking request (mock):', request)
  }

  return delay(
    {
      reference: buildReference(request.date),
      status: 'received' as const,
      submittedAt: new Date().toISOString(),
    },
    900,
  )
}
