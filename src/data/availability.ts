import type { DayAvailability, ISODate, TimeSlot } from '@/types'

/* ------------------------------------------------------------------
   Mock availability.

   ⚠️  There is no backend yet. This module generates deterministic,
   plausible-looking availability so the booking flow can be demonstrated.
   The shape it returns is exactly what a real endpoint should return, so
   swapping it out means changing `src/lib/api.ts` only — no UI changes.

   Replace `schedule` with the venue's real opening pattern.
------------------------------------------------------------------- */

/** Slot start times per weekday (0 = Sunday … 6 = Saturday). `null` = closed. */
const schedule: Record<number, string[] | null> = {
  0: ['11:00', '13:30', '16:00', '18:30'], // კვირა
  1: null, // ორშაბათი — დასვენება
  2: ['12:00', '14:30', '17:00'], // სამშაბათი
  3: ['12:00', '14:30', '17:00'], // ოთხშაბათი
  4: ['12:00', '14:30', '17:00'], // ხუთშაბათი
  5: ['12:00', '14:30', '17:00', '19:30'], // პარასკევი
  6: ['11:00', '13:30', '16:00', '18:30'], // შაბათი
}

/** Default length of a party slot, in minutes. */
export const SLOT_DURATION_MINUTES = 120

/** Stable hash so the same date always yields the same mock availability. */
function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export function getDayAvailability(date: ISODate): DayAvailability {
  const weekday = new Date(`${date}T12:00:00`).getDay()
  const starts = schedule[weekday]

  if (!starts) {
    return { date, open: false, slots: [] }
  }

  const slots: TimeSlot[] = starts.map((time, index) => ({
    time,
    label: `${time} – ${addMinutes(time, SLOT_DURATION_MINUTES)}`,
    // Deterministic "already booked" slots — roughly a third of them.
    available: hash(`${date}#${time}#${index}`) % 3 !== 0,
  }))

  return { date, open: true, slots }
}

export function isDayBookable(date: ISODate): boolean {
  const day = getDayAvailability(date)
  return day.open && day.slots.some((slot) => slot.available)
}
