import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface StepMeta {
  id: number
  label: string
}

interface StepIndicatorProps {
  steps: StepMeta[]
  current: number
  /** Highest step the visitor has completed — earlier steps stay clickable. */
  maxReached: number
  onSelect: (step: number) => void
}

export function StepIndicator({ steps, current, maxReached, onSelect }: StepIndicatorProps) {
  const progress = ((current - 1) / (steps.length - 1)) * 100

  return (
    <div className="rounded-4xl border border-royal-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-royal-900/60">
          ნაბიჯი {current} / {steps.length}
        </p>
        <p className="font-display text-sm font-bold text-royal-800">{steps[current - 1]?.label}</p>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-royal-100">
        <div
          className="h-full rounded-full gradient-royal transition-[width] duration-500"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label="ჯავშნის პროგრესი"
        />
      </div>

      <ol className="mt-5 hidden gap-2 md:grid md:grid-cols-6">
        {steps.map((step) => {
          const done = step.id < current
          const active = step.id === current
          const reachable = step.id <= maxReached

          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onSelect(step.id)}
                className={cn(
                  'flex w-full flex-col items-center gap-2 rounded-2xl px-2 py-2 transition-colors',
                  reachable ? 'cursor-pointer hover:bg-royal-50' : 'cursor-not-allowed opacity-45',
                )}
              >
                <span
                  className={cn(
                    'grid size-8 place-items-center rounded-full text-sm font-bold transition-colors',
                    done && 'bg-mint-500 text-white',
                    active && 'gradient-royal text-white',
                    !done && !active && 'bg-royal-100 text-royal-700',
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : step.id}
                </span>
                <span
                  className={cn(
                    'text-center text-xs font-semibold leading-tight',
                    active ? 'text-royal-900' : 'text-royal-900/55',
                  )}
                >
                  {step.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
