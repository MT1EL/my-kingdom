import { Check, Clock, Users } from 'lucide-react'
import { usePrograms } from '@/content'
import { SmartImage } from '@/components/ui/SmartImage'
import { formatDuration } from '@/lib/date'
import { cn } from '@/lib/cn'

interface ProgramStepProps {
  value: string | null
  onChange: (programId: string) => void
}

export function ProgramStep({ value, onChange }: ProgramStepProps) {
  const programs = usePrograms()

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-2xl text-royal-950 sm:text-3xl">აირჩიეთ პროგრამა</h2>
        <p className="mt-2 text-pretty leading-relaxed text-royal-900/65">
          ასაკი რეკომენდაციაა — სცენარს დაბადების დღის ბავშვზე მოვარგებთ.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {programs.map((program) => {
          const selected = value === program.id
          return (
            <button
              key={program.id}
              type="button"
              onClick={() => onChange(program.id)}
              aria-pressed={selected}
              className={cn(
                'group flex gap-4 rounded-3xl border-2 p-3 text-left transition-all duration-300',
                selected
                  ? 'border-royal-500 bg-royal-50 shadow-[0_12px_28px_-16px_rgb(112_55_143/0.9)]'
                  : 'border-royal-100 bg-white hover:-translate-y-0.5 hover:border-royal-300',
              )}
            >
              <SmartImage
                src={program.image}
                alt=""
                wrapperClassName="size-24 shrink-0 rounded-2xl sm:size-26"
                className="transition-transform duration-500 group-hover:scale-105"
              />

              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-start justify-between gap-2">
                  <span className="font-display text-base font-bold text-royal-950">
                    {program.title}
                  </span>
                  <span
                    className={cn(
                      'grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
                      selected
                        ? 'border-transparent bg-royal-600 text-white'
                        : 'border-royal-200 text-transparent',
                    )}
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                </span>

                <span className="mt-1 line-clamp-2 text-sm leading-snug text-royal-900/60">
                  {program.tagline}
                </span>

                <span className="mt-auto flex flex-wrap gap-2 pt-2 text-xs font-semibold text-royal-800">
                  <span className="inline-flex items-center gap-1 rounded-full bg-royal-100 px-2.5 py-1">
                    <Users className="size-3" />
                    {program.ageMin}–{program.ageMax} წ.
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-candy-100 px-2.5 py-1 text-candy-800">
                    <Clock className="size-3" />
                    {formatDuration(program.durationMinutes)}
                  </span>
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
