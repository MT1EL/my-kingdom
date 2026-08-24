import { CalendarHeart, Clock, Info, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { AnchorButton, LinkButton } from '@/components/ui/Button'
import { ContactValue } from '@/components/ui/ContactValue'
import { FacebookIcon } from '@/components/ui/SocialIcons'
import { mapDirectionsUrl, mapEmbedUrl, site } from '@/data/site'
import { usePageMeta } from '@/lib/usePageMeta'

export default function LocationPage() {
  usePageMeta(
    'მდებარეობა და კონტაქტი — ჩემი სამეფო',
    'როგორ მოგვაგნოთ, სამუშაო საათები და საკონტაქტო ინფორმაცია.',
  )

  return (
    <>
      <PageHeader
        eyebrow="მდებარეობა"
        title="სად გელოდებით"
        description={`${site.name} მდებარეობს ${site.city}ში. ქვემოთ ნახავთ რუკას, საკონტაქტო ინფორმაციასა და სამუშაო საათებს.`}
      />

      <section className="py-14 sm:py-20">
        <Container size="wide">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
            {/* Contact card */}
            <Reveal className="flex flex-col gap-6 rounded-4xl border border-royal-100 bg-white p-7 shadow-soft sm:p-9">
              <div>
                <h2 className="text-2xl text-royal-950">საკონტაქტო ინფორმაცია</h2>
                <p className="mt-2 text-pretty leading-relaxed text-royal-900/65">
                  დაგვიკავშირდით ნებისმიერ კითხვაზე — ან პირდაპირ გამოგვიგზავნეთ ჯავშნის მოთხოვნა
                  საიტიდან.
                </p>
              </div>

              <ul className="flex flex-col divide-y divide-royal-100">
                <li className="flex items-start gap-4 py-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-royal-100 text-royal-700">
                    <MapPin className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-royal-900/55">მისამართი</p>
                    <p className="mt-1 text-royal-950">
                      {site.city},{' '}
                      <ContactValue
                        value={site.contact.address}
                        placeholder={site.contact.addressHint}
                      />
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4 py-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-candy-100 text-candy-700">
                    <Phone className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-royal-900/55">ტელეფონი</p>
                    <p className="mt-1 text-royal-950">
                      <ContactValue
                        value={site.contact.phoneDisplay}
                        href={site.contact.phone ? `tel:${site.contact.phone}` : null}
                      />
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4 py-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sun-100 text-sun-700">
                    <Mail className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-royal-900/55">ელფოსტა</p>
                    <p className="mt-1 break-words text-royal-950">
                      <ContactValue
                        value={site.contact.email}
                        href={site.contact.email ? `mailto:${site.contact.email}` : null}
                      />
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4 py-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mint-100 text-mint-700">
                    <Clock className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-royal-900/55">სამუშაო საათები</p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {site.openingHours.map((entry) => (
                        <li
                          key={entry.day}
                          className="flex flex-wrap items-center justify-between gap-2 text-royal-950"
                        >
                          <span>{entry.day}</span>
                          <ContactValue value={entry.hours} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </ul>

              <div className="flex flex-col gap-3 sm:flex-row">
                <AnchorButton
                  href={mapDirectionsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  variant="outline"
                  className="flex-1"
                >
                  <Navigation className="size-4" />
                  მარშრუტის აგება
                </AnchorButton>
                <AnchorButton
                  href={site.social.facebook}
                  target="_blank"
                  rel="noreferrer noopener"
                  variant="outline"
                  className="flex-1"
                >
                  <FacebookIcon className="size-4" />
                  Facebook
                </AnchorButton>
              </div>

              <LinkButton to="/booking" size="lg">
                <CalendarHeart className="size-5" />
                დაჯავშნე დაბადების დღე
              </LinkButton>
            </Reveal>

            {/* Map */}
            <Reveal delay={100} className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-4xl border border-royal-100 bg-white shadow-soft">
                <iframe
                  title={`${site.name} — რუკა`}
                  src={mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[22rem] w-full border-0 sm:h-[30rem] lg:h-full lg:min-h-[34rem]"
                />
              </div>

              {!site.map.isExactLocation && (
                <p className="flex items-start gap-3 rounded-3xl border border-sun-200 bg-sun-50 p-4 text-sm leading-relaxed text-sun-900">
                  <Info className="mt-0.5 size-5 shrink-0" />
                  <span>
                    რუკაზე ამჟამად {site.city} ჩანს — ზუსტი მისამართი დაზუსტდება და მალე განახლდება.
                    ჯავშნის შემდეგ ლოკაციას პირადად გამოგიგზავნით.
                  </span>
                </p>
              )}
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  )
}
