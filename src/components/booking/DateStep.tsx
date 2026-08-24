import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Info, Loader2 } from 'lucide-react'
import type { DayAvailability, ISODate } from '@/types'
import {
  addMonths,
  buildMonthGrid,
  formatMonthYear,
  isSameDay,
  toISODate,
  WEEKDAYS_SHORT,
} from '@/lib/date'
import { fetchMonthAvailability, getFirstBookableDate, getLastBookableDate } from '@/lib/api'
import { cn } from '@/lib/cn'
import { site } from '@/data/site'

interface DateStepProps {
  value: ISODate | null
  onChange: (date: ISODate) => void
}

export function DateStep({ value, onChange }: DateStepProps) {
  const first = useMemo(() => getFirstBookableDate(), [])
  const last = useMemo(() => getLastBookableDate(), [])

  const [month, setMonth] = useState(() =>
    value ? new Date(`${value}T12:00:00`) : new Date(first.getFullYear(), first.getMonth(), 1),
  )
  const [availability, setAvailability] = useState<Record<ISODate, DayAvailability>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchMonthAvailability(month)
      .then((data) => {
        if (!cancelled) setAvailability(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [month])

  const cells = useMemo(() => buildMonthGrid(month), [month])

  const canGoBack = month.getFullYear() > first.getFullYear() || month.getMonth() > first.getMonth()
  const canGoForward =
    month.getFullYear() < last.getFullYear() ||
    (month.getFullYear() === last.getFullYear() && month.getMonth() < last.getMonth())

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-2xl text-royal-950 sm:text-3xl">აირჩიეთ თარიღი</h2>
        <p className="mt-2 text-pretty leading-relaxed text-royal-900/65">
          კალენდარში ხელმისაწვდომი დღეები აქტიურია. ჯავშანი მიიღება მინიმუმ{' '}
          {site.booking.minLeadDays} დღით ადრე.
        </p>
      </header>

      <div className="rounded-4xl border border-royal-100 bg-white p-4 shadow-soft sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => canGoBack && setMonth(addMonths(month, -1))}
            disabled={!canGoBack}
            aria-label="წინა თვე"
            className="grid size-10 place-items-center rounded-full border border-royal-200 text-royal-800 transition-colors hover:bg-royal-50 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft className="size-5" />
          </button>

          <p className="flex items-center gap-2 font-display text-lg font-bold text-royal-950">
            {formatMonthYear(month)}
            {loading && <Loader2 className="size-4 animate-spin text-royal-400" />}
          </p>

          <button
            type="button"
            onClick={() => canGoForward && setMonth(addMonths(month, 1))}
            disabled={!canGoForward}
            aria-label="შემდეგი თვე"
            className="grid size-10 place-items-center rounded-full border border-royal-200 text-royal-800 transition-colors hover:bg-royal-50 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1 text-center sm:gap-2">
          {WEEKDAYS_SHORT.map((day) => (
            <span key={day} className="py-2 text-xs font-bold text-royal-900/45">
              {day}
            </span>
          ))}

          {cells.map((date, index) => {
            if (!date) return <span key={`empty-${index}`} />

            const iso = toISODate(date)
            const day = availability[iso]
            const openSlots = day?.slots.filter((slot) => slot.available).length ?? 0
            const selectable = Boolean(day?.open) && openSlots > 0
            const selected = value === iso
            const today = isSameDay(date, new Date())

            return (
              <button
                key={iso}
                type="button"
                disabled={!selectable}
                onClick={() => onChange(iso)}
                aria-label={`${date.getDate()} ${formatMonthYear(month)}${
                  selectable ? `, ${openSlots} თავისუფალი დრო` : ', მიუწვდომელია'
                }`}
                aria-pressed={selected}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-semibold transition-all duration-200',
                  selected && 'gradient-royal text-white shadow-[0_8px_20px_-10px_rgb(112_55_143/0.9)]',
                  !selected &&
                    selectable &&
                    'bg-royal-50 text-royal-900 hover:-translate-y-0.5 hover:bg-royal-100',
                  !selectable && 'cursor-not-allowed text-royal-900/25',
                  today && !selected && 'ring-1 ring-inset ring-royal-300',
                )}
              >
                {date.getDate()}
                {selectable && !selected && (
                  <span className="absolute bottom-1.5 size-1 rounded-full bg-mint-500" />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-royal-100 pt-4 text-xs text-royal-900/60">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-mint-500" /> თავისუფალია
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-royal-200" /> დაკავებული / დახურული
          </span>
        </div>
      </div>

      <p className="flex items-start gap-3 rounded-3xl border border-royal-100 bg-royal-50/70 p-4 text-sm leading-relaxed text-royal-900/70">
        <Info className="mt-0.5 size-5 shrink-0 text-royal-500" />
        <span>
          ხელმისაწვდომობა საჩვენებელი მონაცემებია — ზუსტ თარიღსა და დროს ჯავშნის დადასტურებისას
          ერთად შევათანხმებთ.
        </span>
      </p>
    </div>
  )
}
