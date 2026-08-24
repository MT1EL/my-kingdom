import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { navLinks, site } from '@/data/site'
import { Container } from '@/components/ui/Container'
import { ContactValue } from '@/components/ui/ContactValue'
import { FacebookIcon, InstagramIcon } from '@/components/ui/SocialIcons'
import { LinkButton } from '@/components/ui/Button'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-royal-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-candy-600/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-16 size-80 rounded-full bg-royal-500/25 blur-3xl"
      />

      <Container size="wide" className="relative py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <span className="grid size-14 place-items-center rounded-2xl bg-white/95 p-1.5">
                <img src="/logo.png" alt="" className="size-full object-contain" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl font-bold">{site.name}</span>
                <span className="mt-1.5 text-[0.7rem] tracking-[0.16em] text-white/50">
                  {site.nameLatin}
                </span>
              </span>
            </Link>

            <p className="mt-6 max-w-sm text-pretty leading-relaxed text-white/70">
              {site.tagline}. თემატური პროგრამები, თამაშები და ზეიმი, რომელსაც ბავშვები დიდხანს
              იხსენებენ.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Facebook გვერდი"
                className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <FacebookIcon className="size-5" />
              </a>
              {site.social.instagram && (
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Instagram გვერდი"
                  className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <InstagramIcon className="size-5" />
                </a>
              )}
            </div>
          </div>

          <nav aria-label="ფუტერის ნავიგაცია">
            <h3 className="font-display text-lg text-white">გვერდები</h3>
            <ul className="mt-5 flex flex-col gap-3 text-white/70">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/booking" className="transition-colors hover:text-white">
                  დაჯავშნა
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-lg text-white">კონტაქტი</h3>
            <ul className="mt-5 flex flex-col gap-4 text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-candy-300" />
                <span>
                  {site.city},{' '}
                  <ContactValue
                    value={site.contact.address}
                    className="bg-white/10 text-white/80"
                  />
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-candy-300" />
                <ContactValue
                  value={site.contact.phoneDisplay}
                  href={site.contact.phone ? `tel:${site.contact.phone}` : null}
                  className="bg-white/10 text-white/80"
                />
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-candy-300" />
                <ContactValue
                  value={site.contact.email}
                  href={site.contact.email ? `mailto:${site.contact.email}` : null}
                  className="bg-white/10 text-white/80"
                />
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-candy-300" />
                <div className="flex flex-col gap-1.5">
                  {site.openingHours.map((entry) => (
                    <span key={entry.day} className="flex flex-wrap items-center gap-2">
                      <span>{entry.day}</span>
                      <ContactValue value={entry.hours} className="bg-white/10 text-white/80" />
                    </span>
                  ))}
                </div>
              </li>
            </ul>

            <LinkButton to="/booking" variant="light" size="sm" className="mt-6">
              დაჯავშნე ზეიმი
            </LinkButton>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. ყველა უფლება დაცულია.
          </p>
          <p>{site.tagline}</p>
        </div>
      </Container>
    </footer>
  )
}
