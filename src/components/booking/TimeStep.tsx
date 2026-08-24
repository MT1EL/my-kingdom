import { useEffect, useState } from 'react'
import { CalendarDays, Clock, Loader2 } from 'lucide-react'
import type { DayAvailability, ISODate } from '@/types'
import { fetchDayAvailability } from '@/lib/api'
import { formatLongDate } from '@/lib/date'
import { cn } from '@/lib/cn'

interface TimeStepProps {
  date: ISODate
  value: string | null
  onChange: (time: string) => void
}

export function TimeStep({ date, value, onChange }: TimeStepProps) {
  const [day, setDay] = useState<DayAvailability | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchDayAvailability(date)
      .then((data) => {
        if (!cancelled) setDay(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [date])

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-2xl text-royal-950 sm:text-3xl">აირჩიეთ დრო</h2>
        <p className="mt-2 flex items-center gap-2 text-royal-900/65">
          <CalendarDays className="size-4 text-royal-500" />
          {formatLongDate(date)}
        </p>
      </header>

      {loading && (
        <div className="flex items-center gap-3 rounded-3xl border border-royal-100 bg-white p-6 text-royal-900/60 shadow-soft">
          <Loader2 className="size-5 animate-spin text-royal-500" />
          ვამოწმებთ თავისუფალ დროს…
        </div>
      )}

      {!loading && day && (
        <div className="grid gap-3 sm:grid-cols-2">
          {day.slots.map((slot) => {
            const selected = value === slot.time
            return (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                onClick={() => onChange(slot.time)}
                aria-pressed={selected}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-3xl border-2 px-5 py-4 text-left transition-all duration-300',
                  selected &&
                    'border-transparent gradient-royal text-white shadow-[0_12px_28px_-14px_rgb(112_55_143/0.9)]',
                  !selected &&
                    slot.available &&
                    'border-royal-100 bg-white text-royal-950 hover:-translate-y-0.5 hover:border-royal-300',
                  !slot.available &&
                    'cursor-not-allowed border-royal-100 bg-royal-50/60 text-royal-900/35',
                )}
              >
                <span className="flex items-center gap-3">
                  <Clock className={cn('size-5', selected ? 'text-white' : 'text-royal-400')} />
                  <span className="font-display text-lg font-bold">{slot.label}</span>
                </span>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-bold',
                    selected && 'bg-white/20 text-white',
                    !selected && slot.available && 'bg-mint-100 text-mint-700',
                    !slot.available && 'bg-royal-100 text-royal-900/45',
                  )}
                >
                  {slot.available ? 'თავისუფალია' : 'დაკავებულია'}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {!loading && day && day.slots.every((slot) => !slot.available) && (
        <p className="rounded-3xl border border-dashed border-royal-200 bg-white p-8 text-center text-royal-900/60">
          ამ დღეს თავისუფალი დრო აღარ არის — დაბრუნდით უკან და აირჩიეთ სხვა თარიღი.
        </p>
      )}
    </div>
  )
}
