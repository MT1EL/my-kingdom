import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CalendarHeart, Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { navLinks, site } from '@/data/site'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        'bg-cream/85 backdrop-blur-xl',
        scrolled || open
          ? 'border-b border-royal-100 shadow-[0_4px_24px_-16px_rgb(47_20_63/0.5)]'
          : 'border-b border-transparent',
      )}
    >
      <Container size="wide">
        <nav className="flex h-18 items-center justify-between gap-4 py-3 sm:h-20">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label={`${site.name} — მთავარი გვერდი`}
          >
            <img
              src="/logo.png"
              alt=""
              className="size-11 shrink-0 object-contain sm:size-12"
              width={48}
              height={48}
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold text-royal-900 sm:text-xl">
                {site.name}
              </span>
              <span className="mt-1 text-[0.68rem] font-medium tracking-[0.14em] text-royal-500">
                {site.nameLatin}
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-colors',
                      isActive
                        ? 'text-royal-800'
                        : 'text-royal-900/65 hover:text-royal-800',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      <span
                        className={cn(
                          'absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-candy-500 to-sun-400 transition-transform duration-300',
                          isActive ? 'scale-x-100' : 'scale-x-0',
                        )}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block">
              <LinkButton to="/booking" size="sm">
                <CalendarHeart className="size-4" />
                <span className="hidden md:block">დაჯავშნე დაბადების დღე</span>
                <span className="md:hidden">დაჯავშნე</span>
              </LinkButton>
            </span>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'მენიუს დახურვა' : 'მენიუს გახსნა'}
              className="grid size-11 place-items-center rounded-full border border-royal-200 bg-white/80 text-royal-800 transition-colors hover:bg-white lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={cn(
          'overflow-hidden border-t border-royal-100 bg-cream/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 lg:hidden',
          open ? 'max-h-[26rem] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <Container size="wide" className="py-4">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-2xl px-4 py-3 text-base font-semibold transition-colors',
                      isActive
                        ? 'bg-royal-100 text-royal-800'
                        : 'text-royal-900/75 hover:bg-royal-50',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <LinkButton to="/booking" className="mt-3 w-full" size="md">
            <CalendarHeart className="size-4" />
            დაჯავშნე დაბადების დღე
          </LinkButton>
        </Container>
      </div>
    </header>
  )
}
