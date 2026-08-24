import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock, Users } from 'lucide-react'
import type { Program } from '@/types'
import { cn } from '@/lib/cn'
import { SmartImage } from '@/components/ui/SmartImage'
import { formatDuration } from '@/lib/date'

interface ProgramCardProps {
  program: Program
  /** Compact cards are used on the home page preview. */
  compact?: boolean
}

export function ProgramCard({ program, compact = false }: ProgramCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-4xl border border-royal-100 bg-white shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift">
      <div className="relative">
        <SmartImage
          src={program.image}
          alt={program.title}
          wrapperClassName={cn(compact ? 'aspect-4/3' : 'aspect-16/11')}
          className="transition-transform duration-700 group-hover:scale-105"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-royal-950/85 via-royal-950/25 to-transparent"
        />
        <div
          aria-hidden="true"
          className={cn('absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r', program.accent)}
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-royal-800 shadow-sm backdrop-blur">
          <Users className="size-3.5" />
          {program.ageMin}–{program.ageMax} წელი
        </span>
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-royal-950/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          <Clock className="size-3.5" />
          {formatDuration(program.durationMinutes)}
        </span>
        <h3 className="absolute inset-x-4 bottom-4 text-balance text-xl text-white drop-shadow-sm sm:text-2xl">
          {program.title}
        </h3>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm font-semibold text-candy-700">{program.tagline}</p>
        <p className="mt-3 flex-1 text-pretty leading-relaxed text-royal-900/70">
          {compact ? program.description.split('.')[0] + '.' : program.description}
        </p>

        {!compact && (
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {program.highlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2 text-sm text-royal-900/80">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-mint-100 text-mint-700">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        )}

        <Link
          to={`/booking?program=${program.id}`}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border-2 border-royal-200 px-5 py-3 text-[0.95rem] font-semibold text-royal-800 transition-all duration-300 hover:border-transparent hover:gradient-royal hover:text-white"
        >
          აირჩიე ეს პროგრამა
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  )
}
