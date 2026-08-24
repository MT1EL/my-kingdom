import type { ISODate } from '@/types'

export const WEEKDAYS_SHORT = ['ორ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'] as const

export const MONTHS = [
  'იანვარი',
  'თებერვალი',
  'მარტი',
  'აპრილი',
  'მაისი',
  'ივნისი',
  'ივლისი',
  'აგვისტო',
  'სექტემბერი',
  'ოქტომბერი',
  'ნოემბერი',
  'დეკემბერი',
] as const

export const WEEKDAYS_LONG = [
  'კვირა',
  'ორშაბათი',
  'სამშაბათი',
  'ოთხშაბათი',
  'ხუთშაბათი',
  'პარასკევი',
  'შაბათი',
] as const

/** Local-time YYYY-MM-DD (never use toISOString — it shifts across timezones). */
export function toISODate(date: Date): ISODate {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromISODate(date: ISODate): Date {
  return new Date(`${date}T12:00:00`)
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

export function addMonths(date: Date, months: number): Date {
  const copy = new Date(date.getFullYear(), date.getMonth() + months, 1)
  return copy
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatMonthYear(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

/** e.g. "შაბათი, 12 სექტემბერი" */
export function formatLongDate(date: ISODate): string {
  const d = fromISODate(date)
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

/** e.g. "12 სექტემბერი, 2026" */
export function formatDateWithYear(date: ISODate): string {
  const d = fromISODate(date)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}

/** Days of a month laid out on a Monday-first 6×7 grid (nulls pad the edges). */
export function buildMonthGrid(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  // getDay(): 0 = Sunday. Shift so Monday starts the week.
  const leading = (first.getDay() + 6) % 7

  const cells: (Date | null)[] = Array.from({ length: leading }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours && rest) return `${hours} სთ ${rest} წთ`
  if (hours) return `${hours} საათი`
  return `${rest} წუთი`
}
