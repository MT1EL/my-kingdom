import { CalendarDays, Clock, PartyPopper, Sparkles, Users } from 'lucide-react'
import type { BookingDraft } from '@/types'
import { useProgram, useSelectedExtras } from '@/content'
import { formatDateWithYear } from '@/lib/date'
import { SmartImage } from '@/components/ui/SmartImage'

interface BookingSummaryProps {
  draft: BookingDraft
}

interface LineProps {
  icon: typeof CalendarDays
  label: string
  value: string | null
}

function Line({ icon: LineIcon, label, value }: LineProps) {
  return (
    <li className="flex items-start gap-3">
      <LineIcon className="mt-0.5 size-4 shrink-0 text-royal-400" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-semibold text-royal-900/50">{label}</span>
        <span className="text-pretty text-sm font-semibold text-royal-950">
          {value || <span className="font-medium text-royal-900/35">ჯერ არ არის არჩეული</span>}
        </span>
      </span>
    </li>
  )
}

export function BookingSummary({ draft }: BookingSummaryProps) {
  const program = useProgram(draft.programId)
  const extraTitles = useSelectedExtras(draft.extraIds)
    .map((extra) => extra.title)
    .join(', ')

  return (
    <aside className="overflow-hidden rounded-4xl border border-royal-100 bg-white shadow-soft">
      {program ? (
        <div className="relative">
          <SmartImage
            src={program.image}
            alt={program.title}
            wrapperClassName="aspect-16/9"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-royal-950/80 to-transparent"
          />
          <p className="absolute inset-x-4 bottom-3 font-display text-lg font-bold text-white">
            {program.title}
          </p>
        </div>
      ) : (
        <div className="gradient-royal px-5 py-6 text-white">
          <p className="font-display text-lg font-bold">თქვენი ზეიმი</p>
          <p className="mt-1 text-sm text-white/80">შეავსეთ ნაბიჯები და აქ შეჯამებას ნახავთ.</p>
        </div>
      )}

      <ul className="flex flex-col gap-4 p-5">
        <Line
          icon={CalendarDays}
          label="თარიღი"
          value={draft.date ? formatDateWithYear(draft.date) : null}
        />
        <Line icon={Clock} label="დრო" value={draft.time} />
        <Line icon={PartyPopper} label="პროგრამა" value={program?.title ?? null} />
        <Line icon={Sparkles} label="დამატებები" value={extraTitles || null} />
        <Line
          icon={Users}
          label="ბავშვები"
          value={draft.childrenCount ? `${draft.childrenCount} სტუმარი` : null}
        />
      </ul>
    </aside>
  )
}
