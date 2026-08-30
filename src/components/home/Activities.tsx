import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { useActivities } from '@/content'
import { cn } from '@/lib/cn'

export function Activities() {
  const activities = useActivities()

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-dots opacity-30 [mask-image:radial-gradient(60%_50%_at_50%_50%,black,transparent)]"
      />

      <Container size="wide" className="relative">
        <SectionHeading
          eyebrow="აქტივობები"
          title={
            <>
              რა ხდება <span className="text-gradient-royal">ზეიმის დროს</span>
            </>
          }
          description="აქტივობებს ვარჩევთ ბავშვების ასაკისა და ინტერესების მიხედვით — რომ არავინ მოწყინდეს პირველიდან უკანასკნელ წუთამდე."
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity, index) => (
            <Reveal
              key={activity.id}
              as="li"
              delay={(index % 3) * 80}
              className="group relative h-full overflow-hidden rounded-3xl border border-royal-100 bg-white/80 p-6 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-transparent hover:shadow-lift"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                  activity.accent,
                )}
              />
              <span
                className={cn(
                  'grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-[0_8px_20px_-10px_rgb(47_20_63/0.8)] transition-transform duration-500 group-hover:scale-110',
                  activity.accent,
                )}
              >
                <Icon name={activity.icon} className="size-5" strokeWidth={2} />
              </span>
              <h3 className="mt-5 text-lg text-royal-950">{activity.title}</h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-royal-900/65">
                {activity.description}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}
