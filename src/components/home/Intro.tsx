import { Crown, HeartHandshake, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SmartImage } from '@/components/ui/SmartImage'
import { LinkButton } from '@/components/ui/Button'

const points = [
  {
    icon: Crown,
    title: 'ზეიმის მთავარი გმირი',
    text: 'მთელი პროგრამა დაბადების დღის ბავშვის გარშემო იგება — მისი პერსონაჟებით და საყვარელი მუსიკით.',
  },
  {
    icon: HeartHandshake,
    title: 'მშობელი მხოლოდ სტუმარია',
    text: 'დეკორაციას, სცენარსა და ტექნიკას ჩვენ ვუვლით — თქვენ მხოლოდ ზეიმის ყურება გრჩებათ.',
  },
  {
    icon: Sparkles,
    title: 'დღე, რომელიც რჩება',
    text: 'ფოტოზონები, გადაღება და პატარა დეტალები, რომლებიც ბავშვს წლების შემდეგაც ახსოვს.',
  },
]

export function Intro() {
  return (
    <section className="relative py-20 sm:py-28">
      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-royal-100 px-4 py-1.5 text-sm font-semibold text-royal-700">
              <span className="size-1.5 rounded-full bg-current opacity-70" />
              ჩვენ შესახებ
            </span>

            <h2 className="mt-5 text-balance text-3xl leading-tight text-royal-950 sm:text-4xl lg:text-[2.6rem]">
              მოგესალმებით <span className="text-gradient-royal">ჩემს სამეფოში</span>
            </h2>

            <p className="mt-6 text-pretty leading-relaxed text-royal-900/75 sm:text-lg">
              დაბადების დღე ბავშვისთვის წლის ყველაზე მნიშვნელოვანი დღეა. ჩვენ ვზრუნავთ იმაზე, რომ ეს
              დღე მარტივი ზეიმი კი არა, ნამდვილი თავგადასავალი გამოვიდეს — შერჩეული თემით, ცოცხალი
              პროგრამითა და გუნდით, რომელიც ბავშვების ენაზე საუბრობს.
            </p>

            <ul className="mt-9 flex flex-col gap-6">
              {points.map((point) => (
                <li key={point.title} className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-royal-100 to-candy-100 text-royal-700">
                    <point.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-lg text-royal-950">{point.title}</h3>
                    <p className="mt-1.5 text-pretty leading-relaxed text-royal-900/65">
                      {point.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <LinkButton to="/programs" variant="outline" className="mt-9">
              აირჩიე პროგრამა
            </LinkButton>
          </Reveal>

          <Reveal delay={120} className="order-1 lg:order-2">
            <div className="relative">
              <SmartImage
                src="https://images.unsplash.com/photo-1608790672275-309c02d888ff?auto=format&fit=crop&w=1100&q=80"
                alt="ბავშვები დაბადების დღის ტორტზე სანთლებს აქრობენ"
                wrapperClassName="aspect-4/5 rounded-[2.5rem] shadow-lift ring-1 ring-royal-900/5 sm:aspect-square lg:aspect-4/5"
              />
              <div className="absolute -bottom-6 -left-4 w-44 rotate-[-4deg] rounded-3xl bg-white p-3 shadow-lift sm:-left-8 sm:w-56">
                <SmartImage
                  src="https://images.unsplash.com/photo-1628016354739-6c65f0e11c24?auto=format&fit=crop&w=600&q=80"
                  alt="ბავშვს სახეს უხატავენ ზეიმზე"
                  wrapperClassName="aspect-4/3 rounded-2xl"
                />
                <p className="px-1 pb-1 pt-2.5 text-center text-xs font-semibold text-royal-800">
                  სახის მოხატვა
                </p>
              </div>
              <div
                aria-hidden="true"
                className="absolute -right-3 -top-5 hidden animate-float text-4xl sm:block"
              >
                🎂
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
