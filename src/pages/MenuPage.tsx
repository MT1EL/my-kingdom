import { useMemo, useState } from 'react'
import { CalendarHeart, Info } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { BookingButton, BookingGate } from '@/components/booking/BookingGate'
import { MenuCategoryCard } from '@/components/menu/MenuCategoryCard'
import { useMenu, useSite } from '@/content'
import { menuGroups } from '@/lib/menu'
import { usePageMeta } from '@/lib/usePageMeta'
import { cn } from '@/lib/cn'

export default function MenuPage() {
  usePageMeta(
    'მენიუ — ჩემი სამეფო',
    'ზეიმის მენიუ და ფასები: საბავშვო სეტები, მსუბუქი კერძები, პიცა, ტორტი, ტკბილეული და სასმელები.',
  )

  const menu = useMenu()
  const { menuNotes } = useSite()

  const [group, setGroup] = useState<(typeof menuGroups)[number]['id']>('all')

  const visible = useMemo(
    () => (group === 'all' ? menu : menu.filter((category) => category.group === group)),
    [group, menu],
  )

  return (
    <>
      <PageHeader
        eyebrow="მენიუ"
        title="საჭმელი, სასმელი და ფასები"
        description="ზეიმის მაგიდას თქვენს გემოვნებაზე ვაწყობთ. ქვემოთ ნახავთ, რას გთავაზობთ და რა ღირს თითოეული პოზიცია — რაოდენობას სტუმრების რიცხვის მიხედვით ერთად შევარჩევთ."
      >
        <BookingButton variant="light" size="lg">
          <CalendarHeart className="size-5" />
          დაჯავშნე მაგიდით
        </BookingButton>
      </PageHeader>

      <section className="py-14 sm:py-20">
        <Container size="wide">
          <Reveal className="flex flex-wrap items-center gap-2.5">
            <span className="mr-1 text-sm font-semibold text-royal-900/60">კატეგორია:</span>
            {menuGroups.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setGroup(option.id)}
                aria-pressed={group === option.id}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300',
                  group === option.id
                    ? 'gradient-royal text-white shadow-[0_8px_20px_-10px_rgb(112_55_143/0.9)]'
                    : 'border border-royal-200 bg-white text-royal-800 hover:border-royal-400',
                )}
              >
                {option.label}
              </button>
            ))}
          </Reveal>

          <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
            {visible.map((category, index) => (
              <Reveal key={category.id} delay={(index % 2) * 90} className="h-full">
                <MenuCategoryCard category={category} />
              </Reveal>
            ))}
          </div>

          <Reveal
            delay={120}
            className="mt-12 rounded-4xl border border-royal-100 bg-white p-7 shadow-soft sm:p-9"
          >
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-royal-100 text-royal-700">
                <Info className="size-5" />
              </span>
              <div>
                <h2 className="text-xl text-royal-950 sm:text-2xl">კარგია იცოდეთ</h2>
                <ul className="mt-3 flex flex-col gap-2.5 text-pretty leading-relaxed text-royal-900/70">
                  {menuNotes.map((note) => (
                    <li key={note} className="flex items-start gap-2.5">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-candy-500" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Copy and button both invite a booking, so the row goes as one. */}
            <BookingGate>
              <div className="mt-7 flex flex-col gap-4 border-t border-royal-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-pretty leading-relaxed text-royal-900/65">
                  გინდათ, მაგიდა ჩვენ ავაწყოთ? დაჯავშნეთ ზეიმი და მენიუს ერთად შევადგენთ.
                </p>
                <BookingButton className="shrink-0">
                  გადადი ჯავშანზე
                </BookingButton>
              </div>
            </BookingGate>
          </Reveal>
        </Container>
      </section>
    </>
  )
}
