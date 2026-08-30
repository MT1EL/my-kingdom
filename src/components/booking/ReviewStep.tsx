import { CalendarDays, Clock, Info, PartyPopper, Sparkles, User, Users } from 'lucide-react'
import type { BookingDraft } from '@/types'
import { useProgram, useSelectedExtras, useSite } from '@/content'
import { formatDateWithYear, formatLongDate } from '@/lib/date'

interface ReviewStepProps {
  draft: BookingDraft
  onEdit: (step: number) => void
  error?: string | null
}

interface RowProps {
  icon: typeof CalendarDays
  label: string
  value: string
  step: number
  onEdit: (step: number) => void
}

function Row({ icon: RowIcon, label, value, step, onEdit }: RowProps) {
  return (
    <div className="flex items-start gap-4 py-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-royal-100 text-royal-700">
        <RowIcon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-royal-900/55">{label}</p>
        <p className="mt-0.5 text-pretty font-semibold text-royal-950">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-royal-700 transition-colors hover:bg-royal-100"
      >
        შეცვლა
      </button>
    </div>
  )
}

export function ReviewStep({ draft, onEdit, error }: ReviewStepProps) {
  const program = useProgram(draft.programId)
  const chosenExtras = useSelectedExtras(draft.extraIds)
  const site = useSite()

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-2xl text-royal-950 sm:text-3xl">შეამოწმეთ და გააგზავნეთ</h2>
        <p className="mt-2 text-pretty leading-relaxed text-royal-900/65">
          გადახედეთ დეტალებს. გაგზავნის შემდეგ ჩვენ დაგიკავშირდებით და ჯავშანს ერთად
          დავადასტურებთ.
        </p>
      </header>

      <div className="divide-y divide-royal-100 rounded-4xl border border-royal-100 bg-white px-5 shadow-soft sm:px-7">
        <Row
          icon={CalendarDays}
          label="თარიღი"
          value={draft.date ? formatDateWithYear(draft.date) : '—'}
          step={1}
          onEdit={onEdit}
        />
        <Row
          icon={Clock}
          label="დრო"
          value={draft.time ?? '—'}
          step={2}
          onEdit={onEdit}
        />
        <Row
          icon={PartyPopper}
          label="პროგრამა"
          value={program ? `${program.title} — ${program.tagline}` : '—'}
          step={3}
          onEdit={onEdit}
        />
        <Row
          icon={Sparkles}
          label="დამატებითი სერვისები"
          value={
            chosenExtras.length
              ? chosenExtras.map((extra) => extra.title).join(', ')
              : 'არ არის არჩეული'
          }
          step={4}
          onEdit={onEdit}
        />
        <Row
          icon={Users}
          label="ბავშვები"
          value={`${draft.childName}, ${draft.childAge} წლის · სტუმრები: ${draft.childrenCount}`}
          step={5}
          onEdit={onEdit}
        />
        <Row
          icon={User}
          label="საკონტაქტო"
          value={[draft.parentName, draft.phone, draft.email].filter(Boolean).join(' · ')}
          step={5}
          onEdit={onEdit}
        />
        {draft.notes.trim() && (
          <Row
            icon={Info}
            label="კომენტარი"
            value={draft.notes.trim()}
            step={5}
            onEdit={onEdit}
          />
        )}
      </div>

      <div className="flex items-start gap-3 rounded-3xl border border-sun-200 bg-sun-50 p-4 text-sm leading-relaxed text-sun-900">
        <Info className="mt-0.5 size-5 shrink-0" />
        <p>
          ეს არის <strong>ჯავშნის მოთხოვნა</strong>, და არა დადასტურებული ჯავშანი.{' '}
          {draft.date && `${formatLongDate(draft.date)} `}
          თარიღის დაფიქსირებამდე ჩვენი გუნდი დაგიკავშირდებათ დეტალებისა და ღირებულების
          შესათანხმებლად. {site.priceNote}
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-3xl border border-candy-300 bg-candy-50 p-4 text-sm font-semibold text-candy-800"
        >
          {error}
        </p>
      )}
    </div>
  )
}
