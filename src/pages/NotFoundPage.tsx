import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'
import { BookingButton } from '@/components/booking/BookingGate'
import { bookingEnabled } from '@/lib/features'
import { usePageMeta } from '@/lib/usePageMeta'

export default function NotFoundPage() {
  usePageMeta('გვერდი ვერ მოიძებნა — ჩემი სამეფო')

  return (
    <section className="relative flex min-h-[70dvh] items-center overflow-hidden py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-royal-50 to-cream" />
        <div className="absolute -left-24 top-10 size-80 rounded-full bg-candy-200/50 blur-3xl" />
        <div className="absolute -right-16 bottom-0 size-80 rounded-full bg-royal-200/50 blur-3xl" />
      </div>

      <Container className="text-center">
        <p className="animate-float text-6xl">🎈</p>
        <h1 className="mt-6 text-balance text-4xl leading-tight text-royal-950 sm:text-5xl">
          ეს გვერდი სამეფოში ვერ ვიპოვეთ
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-royal-900/70">
          {bookingEnabled
            ? 'შესაძლოა ბმული შეიცვალა ან გვერდი წაიშალა. დაბრუნდით მთავარზე ან პირდაპირ ჯავშანზე გადადით.'
            : 'შესაძლოა ბმული შეიცვალა ან გვერდი წაიშალა. დაბრუნდით მთავარ გვერდზე.'}
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton to="/" size="lg">
            მთავარ გვერდზე
          </LinkButton>
          <BookingButton variant="outline" size="lg">
            დაჯავშნე ზეიმი
          </BookingButton>
        </div>
      </Container>
    </section>
  )
}
