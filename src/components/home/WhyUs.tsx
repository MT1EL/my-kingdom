import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { benefits } from '@/data/activities'
import { LinkButton } from '@/components/ui/Button'
import { site } from '@/data/site'

export function WhyUs() {
  return (
    <section className="relative overflow-hidden bg-royal-950 py-20 text-white sm:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 size-96 rounded-full bg-candy-600/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-96 rounded-full bg-royal-500/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 rounded-full bg-sun-500/10 blur-3xl" />
      </div>

      <Container size="wide" className="relative">
        <SectionHeading
          tone="light"
          eyebrow="რატომ ჩვენ"
          title={
            <>
              რატომ ირჩევენ მშობლები <span className="text-sun-300">ჩემს სამეფოს</span>
            </>
          }
          description="ჩვენი საქმეა, რომ ზეიმის დღეს თქვენ მხოლოდ ბავშვის სიხარულს უყურებდეთ."
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Reveal
              key={benefit.id}
              as="li"
              delay={(index % 3) * 90}
              className="group h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-sun-300 transition-transform duration-500 group-hover:scale-110">
                <Icon name={benefit.icon} className="size-5" />
              </span>
              <h3 className="mt-5 text-lg text-white">{benefit.title}</h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-white/65">
                {benefit.description}
              </p>
            </Reveal>
          ))}
        </ul>

        <Reveal
          delay={120}
          className="mt-12 flex flex-col items-start gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-white/70">
            {site.priceNote}
          </p>
          <LinkButton to="/booking" variant="light" className="shrink-0">
            გაგზავნე ჯავშნის მოთხოვნა
          </LinkButton>
        </Reveal>
      </Container>
    </section>
  )
}
