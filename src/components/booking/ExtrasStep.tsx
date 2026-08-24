import { Check } from 'lucide-react'
import { extras } from '@/data/extras'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { site } from '@/data/site'

interface ExtrasStepProps {
  value: string[]
  onChange: (extraIds: string[]) => void
}

export function ExtrasStep({ value, onChange }: ExtrasStepProps) {
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id])

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-2xl text-royal-950 sm:text-3xl">დამატებითი სერვისები</h2>
        <p className="mt-2 text-pretty leading-relaxed text-royal-900/65">
          არჩევითია — მონიშნეთ ის, რაც ზეიმისთვის გსურთ. თუ დარწმუნებული არ ხართ, გამოტოვეთ და
          ჯავშნის დადასტურებისას ერთად შევარჩევთ.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {extras.map((extra) => {
          const selected = value.includes(extra.id)
          return (
            <button
              key={extra.id}
              type="button"
              onClick={() => toggle(extra.id)}
              aria-pressed={selected}
              className={cn(
                'flex items-start gap-4 rounded-3xl border-2 p-5 text-left transition-all duration-300',
                selected
                  ? 'border-royal-500 bg-royal-50 shadow-[0_12px_28px_-16px_rgb(112_55_143/0.9)]'
                  : 'border-royal-100 bg-white hover:-translate-y-0.5 hover:border-royal-300',
              )}
            >
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-2xl transition-colors',
                  selected ? 'gradient-royal text-white' : 'bg-royal-100 text-royal-700',
                )}
              >
                <Icon name={extra.icon} className="size-5" />
              </span>

              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-display text-base font-bold text-royal-950">
                  {extra.title}
                </span>
                <span className="mt-1 text-sm leading-snug text-royal-900/60">
                  {extra.description}
                </span>
              </span>

              <span
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-lg border-2 transition-colors',
                  selected
                    ? 'border-transparent bg-royal-600 text-white'
                    : 'border-royal-200 text-transparent',
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            </button>
          )
        })}
      </div>

      <p className="rounded-3xl border border-royal-100 bg-royal-50/70 p-4 text-sm leading-relaxed text-royal-900/70">
        {site.priceNote}
      </p>
    </div>
  )
}
