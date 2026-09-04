import { CalendarHeart, MapPin } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { LinkButton, AnchorButton } from '@/components/ui/Button'
import { bookingEnabled } from '@/lib/features'
import { SmartImage } from '@/components/ui/SmartImage'
import { useSite } from '@/content'
import { FacebookIcon } from '@/components/ui/SocialIcons'

export function BookingCta() {
  const site = useSite()

  // The whole section is about the booking flow — heading, copy and button
  // alike — so with booking switched off it goes rather than being emptied
  // out. See `lib/features.ts`.
  if (!bookingEnabled) return null

  return (
    <section className="pb-20 sm:pb-28">
      <Container size="wide">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] gradient-royal p-8 text-white shadow-lift sm:rounded-[3rem] sm:p-12 lg:p-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 size-72 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute -bottom-24 left-1/4 size-72 rounded-full bg-royal-950/25 blur-3xl" />
          </div>

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur">
                <span className="size-1.5 rounded-full bg-sun-300" />
                ჯავშანი
              </span>

              <h2 className="mt-5 text-balance text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
                მზად ხართ დაბადების დღისთვის, რომელსაც ვერ დაივიწყებენ?
              </h2>

              <p className="mt-5 max-w-xl text-pretty leading-relaxed text-white/85">
                აირჩიეთ თარიღი და პროგრამა საიტზე — ჩვენ დაგიკავშირდებით დეტალების შესათანხმებლად და
                ზეიმის დღეს ერთად დავგეგმავთ.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <LinkButton to="/booking" variant="light" size="lg">
                  <CalendarHeart className="size-5" />
                  დაჯავშნე დაბადების დღე
                </LinkButton>
                <LinkButton
                  to="/location"
                  size="lg"
                  className="border-2 border-white/40 bg-transparent shadow-none hover:bg-white/10"
                >
                  <MapPin className="size-5" />
                  სად ვართ
                </LinkButton>
                {site.social.facebook && (
                  <AnchorButton
                    href={site.social.facebook}
                    target="_blank"
                    rel="noreferrer noopener"
                    size="lg"
                    className="border-2 border-white/40 bg-transparent shadow-none hover:bg-white/10"
                  >
                    <FacebookIcon className="size-5" />
                    Facebook
                  </AnchorButton>
                )}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <SmartImage
                src="https://images.unsplash.com/photo-1504437484202-613bb51ce359?auto=format&fit=crop&w=900&q=80"
                alt="ბავშვი ბუშტებთან ზეიმზე"
                wrapperClassName="aspect-4/5 rounded-[2rem] shadow-lift ring-1 ring-white/20"
              />
              <div
                aria-hidden="true"
                className="absolute -left-6 top-8 animate-float text-4xl"
              >
                🎉
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
