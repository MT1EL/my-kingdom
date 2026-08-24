import { CalendarHeart, Gamepad2, MicVocal, PartyPopper, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { site } from '@/data/site'

const chips = [
  { icon: PartyPopper, label: 'ანიმატორები' },
  { icon: MicVocal, label: 'კარაოკე' },
  { icon: Gamepad2, label: 'Xbox' },
  { icon: Sparkles, label: 'ფოტოზონები' },
]

const img = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36 lg:pb-32 lg:pt-44">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-royal-50 via-cream to-cream" />
        <div className="absolute -left-32 -top-24 size-[26rem] rounded-full bg-candy-200/50 blur-3xl" />
        <div className="absolute -right-24 top-20 size-[30rem] rounded-full bg-royal-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 size-72 rounded-full bg-sun-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-grid-dots opacity-40 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      </div>

      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Copy */}
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-royal-200/70 bg-white/70 px-4 py-1.5 text-sm font-semibold text-royal-700 backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-candy-400 opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-candy-500" />
              </span>
              {site.tagline}
            </span>

            <h1 className="mt-6 text-balance text-4xl leading-[1.1] text-royal-950 sm:text-5xl lg:text-6xl xl:text-[4.1rem]">
              ზეიმი, სადაც ყველა ბავშვი{' '}
              <span className="relative inline-block">
                <span className="text-gradient-royal">მეფეა</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 200 14"
                  className="absolute -bottom-1 left-0 h-3 w-full text-sun-300"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 9c40-6 92-9 196-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-royal-900/70 sm:text-lg">
              „ჩემი სამეფო" არის სივრცე, სადაც დაბადების დღე მთელ თავგადასავლად იქცევა — თემატური
              პროგრამები, ანიმატორები, თამაშები, კარაოკე, Xbox, მუსიკა და ფოტოზონები ერთ ადგილას.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <LinkButton to="/booking" size="lg" className="w-full sm:w-auto">
                <CalendarHeart className="size-5" />
                დაჯავშნე ზეიმი
              </LinkButton>
              <LinkButton to="/programs" variant="outline" size="lg" className="w-full sm:w-auto">
                ნახე პროგრამები
              </LinkButton>
            </div>

            <ul className="mt-10 flex flex-wrap gap-2.5">
              {chips.map((chip) => (
                <li
                  key={chip.label}
                  className="inline-flex items-center gap-2 rounded-full border border-royal-100 bg-white/80 px-3.5 py-2 text-sm font-semibold text-royal-800 shadow-[0_2px_10px_-6px_rgb(47_20_63/0.4)] backdrop-blur"
                >
                  <chip.icon className="size-4 text-candy-600" />
                  {chip.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Collage */}
          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="relative mx-auto grid h-[24rem] max-w-lg grid-cols-5 grid-rows-6 gap-3 sm:h-[30rem] sm:gap-4 lg:h-[34rem] lg:max-w-none">
              <SmartImage
                src={img('photo-1509666537727-9154b6962292', 900)}
                alt="ორი გოგონა საზეიმო ქუდებით ზეიმზე"
                loading="eager"
                wrapperClassName="col-span-3 row-span-6 rounded-[2rem] shadow-lift ring-1 ring-royal-900/5"
              />
              <SmartImage
                src={img('photo-1602328790041-ee36d98e677c', 700)}
                alt="ფერადი ბუშტების დეკორაცია ფოტოზონაში"
                loading="eager"
                wrapperClassName="col-span-2 row-span-3 rounded-[1.6rem] shadow-lift ring-1 ring-royal-900/5"
              />
              <SmartImage
                src={img('photo-1493711662062-fa541adb3fc8', 700)}
                alt="ბავშვები კონსოლის ჯოისტიკებით თამაშობენ"
                loading="eager"
                wrapperClassName="col-span-2 row-span-3 rounded-[1.6rem] shadow-lift ring-1 ring-royal-900/5"
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 left-2 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-lift backdrop-blur sm:left-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl gradient-royal text-white">
                <PartyPopper className="size-5" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-sm font-bold text-royal-950">
                  სცენარი შენს ბავშვზე
                </span>
                <span className="text-xs text-royal-900/60">პროგრამას ერთად ვაწყობთ</span>
              </span>
            </div>

            <div
              aria-hidden="true"
              className="absolute -right-2 -top-6 hidden animate-float text-4xl sm:block"
            >
              🎈
            </div>
            <div
              aria-hidden="true"
              className="absolute -left-6 top-1/3 hidden animate-float-slow text-3xl lg:block"
            >
              ⭐
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
