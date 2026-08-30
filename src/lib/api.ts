import type {
  BookingRequest,
  BookingRequestResult,
  DayAvailability,
  ISODate,
  SiteConfig,
} from '@/types'
import { addDays, startOfDay, toISODate } from '@/lib/date'
import { get, post } from '@/lib/http'

/* ------------------------------------------------------------------
   Booking API.

   Availability and booking requests are live data — unlike site content
   they change while a visitor is on the page, so they are fetched per use
   rather than bundled into `/api/content`.

     GET  /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD  → DayAvailability[]
     POST /api/booking-requests                            → BookingRequestResult

   The booking window comes from site settings, so the date helpers take a
   `SiteConfig` instead of reading a module-level constant.
------------------------------------------------------------------- */

type BookingWindow = SiteConfig['booking']

/** Earliest date a family may book (today + the venue's lead time). */
export function getFirstBookableDate(booking: BookingWindow): Date {
  return startOfDay(addDays(new Date(), booking.minLeadDays))
}

/** Last date the calendar exposes. */
export function getLastBookableDate(booking: BookingWindow): Date {
  return startOfDay(addDays(new Date(), booking.maxAheadDays))
}

export function isWithinBookingWindow(date: Date, booking: BookingWindow): boolean {
  const day = startOfDay(date).getTime()
  return (
    day >= getFirstBookableDate(booking).getTime() && day <= getLastBookableDate(booking).getTime()
  )
}

/**
 * Availability for a whole month, keyed by ISO date.
 * The server clamps the range to the booking window, so days outside it
 * simply do not come back and the calendar renders them as unavailable.
 */
export async function fetchMonthAvailability(
  month: Date,
  signal?: AbortSignal,
): Promise<Record<ISODate, DayAvailability>> {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)

  const days = await get<DayAvailability[]>(
    `/api/availability?from=${toISODate(first)}&to=${toISODate(last)}`,
    signal,
  )

  return Object.fromEntries(days.map((day) => [day.date, day]))
}

export async function fetchDayAvailability(
  date: ISODate,
  signal?: AbortSignal,
): Promise<DayAvailability> {
  const days = await get<DayAvailability[]>(`/api/availability?from=${date}&to=${date}`, signal)
  return days[0] ?? { date, open: false, slots: [] }
}

/**
 * Sends a booking *request*. This does not confirm anything: the venue
 * contacts the family to agree the details before the date is held.
 */
export function submitBookingRequest(request: BookingRequest): Promise<BookingRequestResult> {
  return post<BookingRequestResult>('/api/booking-requests', request)
}
