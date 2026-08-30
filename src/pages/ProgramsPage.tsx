import { useMemo, useState } from 'react'
import { CalendarHeart } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { LinkButton } from '@/components/ui/Button'
import { ProgramCard } from '@/components/programs/ProgramCard'
import { usePrograms, useSite } from '@/content'
import { usePageMeta } from '@/lib/usePageMeta'
import { cn } from '@/lib/cn'

/** Age buckets used to filter the programme list. */
const ageFilters = [
  { id: 'all', label: 'ყველა ასაკი', test: () => true },
  { id: 'small', label: '1–5 წელი', test: (min: number) => min <= 5 },
  { id: 'mid', label: '6–9 წელი', test: (min: number, max: number) => min <= 9 && max >= 6 },
  { id: 'big', label: '10+ წელი', test: (_min: number, max: number) => max >= 10 },
] as const

export default function ProgramsPage() {
  usePageMeta(
    'პროგრამები — ჩემი სამეფო',
    'თემატური დაბადების დღის პროგრამები: პრინცესების ბალი, სუპერგმირები, კარაოკე, გეიმერების ტურნირი, დისკო, ხელოვნების სახელოსნო და სხვა.',
  )

  const programs = usePrograms()
  const site = useSite()

  const [filter, setFilter] = useState<(typeof ageFilters)[number]['id']>('all')

  const visible = useMemo(() => {
    const active = ageFilters.find((option) => option.id === filter) ?? ageFilters[0]
    return programs.filter((program) => active.test(program.ageMin, program.ageMax))
  }, [filter, programs])

  return (
    <>
      <PageHeader
        eyebrow="პროგრამები"
        title="აირჩიე ზეიმის თემა"
        description="თითოეული პროგრამა მზა სცენარია — ანიმატორით, დეკორაციით, მუსიკითა და თამაშებით. თემა ბავშვის ინტერესებზე ვარგებთ, ასაკი კი მხოლოდ რეკომენდაციაა."
      >
        <LinkButton to="/booking" variant="light" size="lg">
          <CalendarHeart className="size-5" />
          გადადი ჯავშანზე
        </LinkButton>
      </PageHeader>

      <section className="py-14 sm:py-20">
        <Container size="wide">
          <Reveal className="flex flex-wrap items-center gap-2.5">
            <span className="mr-1 text-sm font-semibold text-royal-900/60">ასაკი:</span>
            {ageFilters.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                aria-pressed={filter === option.id}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300',
                  filter === option.id
                    ? 'gradient-royal text-white shadow-[0_8px_20px_-10px_rgb(112_55_143/0.9)]'
                    : 'border border-royal-200 bg-white text-royal-800 hover:border-royal-400',
                )}
              >
                {option.label}
              </button>
            ))}
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((program, index) => (
              <Reveal key={program.id} delay={(index % 3) * 90} className="h-full">
                <ProgramCard program={program} />
              </Reveal>
            ))}
          </div>

          {visible.length === 0 && (
            <p className="mt-10 rounded-3xl border border-dashed border-royal-200 bg-white p-10 text-center text-royal-900/60">
              ამ ასაკისთვის პროგრამა ჯერ არ არის დამატებული — დაგვიკავშირდით და ერთად შევადგენთ.
            </p>
          )}

          <Reveal
            delay={120}
            className="mt-14 flex flex-col items-start gap-5 rounded-4xl border border-royal-100 bg-white p-7 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-9"
          >
            <div>
              <h2 className="text-xl text-royal-950 sm:text-2xl">
                ვერ იპოვეთ თქვენთვის შესაფერისი თემა?
              </h2>
              <p className="mt-2.5 max-w-2xl text-pretty leading-relaxed text-royal-900/65">
                {site.priceNote}
              </p>
            </div>
            <LinkButton to="/booking" className="shrink-0">
              დაგვიკავშირდი ჯავშნით
            </LinkButton>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
