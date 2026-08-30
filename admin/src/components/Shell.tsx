import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  CalendarClock,
  CalendarDays,
  Gift,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  PartyPopper,
  Settings,
  Sparkles,
  Star,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { useAuth, useCurrentUser } from '@/auth/AuthProvider'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------
   The signed-in shell: sidebar, header, and the routed screen.
------------------------------------------------------------------- */

const sections = [
  {
    label: 'მიმოხილვა',
    links: [
      { to: '/', label: 'მთავარი', icon: LayoutDashboard, end: true },
      { to: '/bookings', label: 'ჯავშნები', icon: CalendarDays },
      { to: '/schedule', label: 'განრიგი', icon: CalendarClock },
    ],
  },
  {
    label: 'შიგთავსი',
    links: [
      { to: '/programs', label: 'პროგრამები', icon: PartyPopper },
      { to: '/menu', label: 'მენიუ', icon: UtensilsCrossed },
      { to: '/gallery', label: 'გალერეა', icon: Images },
      { to: '/activities', label: 'აქტივობები', icon: Sparkles },
      { to: '/benefits', label: 'რატომ ჩვენ', icon: Star },
      { to: '/extras', label: 'დამატებები', icon: Gift },
    ],
  },
  {
    label: 'კონფიგურაცია',
    links: [{ to: '/settings', label: 'პარამეტრები', icon: Settings }],
  },
]

export function Shell() {
  const user = useCurrentUser()
  const { logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // The drawer should not stay open behind the screen you just navigated to.
  useEffect(() => setOpen(false), [location.pathname])

  const nav = (
    <nav className="flex flex-col gap-6">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="px-3 text-xs font-bold uppercase tracking-wide text-royal-900/40">
            {section.label}
          </p>
          <ul className="mt-2 flex flex-col gap-0.5">
            {section.links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={'end' in link ? link.end : false}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-royal-700 text-white'
                        : 'text-royal-900/75 hover:bg-royal-100 hover:text-royal-900',
                    )
                  }
                >
                  <link.icon className="size-4 shrink-0" />
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar — permanent on desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-royal-100 bg-white lg:flex">
        <div className="flex items-center gap-2.5 border-b border-royal-100 px-5 py-4">
          <img src="/logo.png" alt="" width={32} height={32} className="size-8 object-contain" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-bold text-royal-950">მართვის პანელი</span>
            <span className="truncate text-xs text-royal-900/50">ჩემი სამეფო</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3">{nav}</div>

        <div className="border-t border-royal-100 p-3">
          <p className="px-3 pb-2 text-xs text-royal-900/55">
            {user.name}
            <span className="block truncate text-royal-900/40">{user.email}</span>
          </p>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => void logout()}>
            <LogOut className="size-4" />
            გასვლა
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="მენიუს დახურვა"
            className="absolute inset-0 bg-royal-950/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white">
            <div className="flex items-center justify-between border-b border-royal-100 px-4 py-3">
              <span className="text-sm font-bold text-royal-950">მართვის პანელი</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="დახურვა"
                className="grid size-8 place-items-center rounded-lg text-royal-900/60 hover:bg-royal-100"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">{nav}</div>
            <div className="border-t border-royal-100 p-3">
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => void logout()}>
                <LogOut className="size-4" />
                გასვლა
              </Button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-royal-100 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="მენიუს გახსნა"
            className="grid size-9 place-items-center rounded-lg border border-royal-200 text-royal-800"
          >
            <Menu className="size-4" />
          </button>
          <img src="/logo.png" alt="" width={28} height={28} className="size-7 object-contain" />
          <span className="text-sm font-bold text-royal-950">მართვის პანელი</span>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
