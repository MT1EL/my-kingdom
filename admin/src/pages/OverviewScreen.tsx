import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, Inbox, PartyPopper } from 'lucide-react'
import { useApiResource } from '@/lib/useResource'
import { useCurrentUser } from '@/auth/AuthProvider'
import { Card, CardHeader, ErrorNote, Spinner } from '@/components/ui'
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------
   Landing screen.

   Answers the one question the owner opens the dashboard with: is there
   anything new to deal with?
------------------------------------------------------------------- */

interface Summary {
  byStatus: Partial<Record<string, number>>
  upcomingConfirmed: number
}

/** Where the site's own address lives, for the "view site" link. */
const SITE_URL = import.meta.env?.VITE_SITE_URL ?? 'http://localhost:5173'

const shortcuts = [
  { to: '/bookings', label: 'ჯავშნები', hint: 'მოთხოვნების დამუშავება' },
  { to: '/programs', label: 'პროგრამები', hint: 'ზეიმის თემები' },
  { to: '/menu', label: 'მენიუ', hint: 'კერძები და ფასები' },
  { to: '/gallery', label: 'გალერეა', hint: 'ფოტოების ატვირთვა' },
  { to: '/schedule', label: 'განრიგი', hint: 'სამუშაო საათები' },
  { to: '/settings', label: 'პარამეტრები', hint: 'კონტაქტი და ტექსტები' },
]

export function OverviewScreen() {
  const user = useCurrentUser()
  const summary = useApiResource<Summary>('/api/admin/bookings/summary')

  const received = summary.data?.byStatus.received ?? 0
  const confirmed = summary.data?.byStatus.confirmed ?? 0
  const upcoming = summary.data?.upcomingConfirmed ?? 0

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-royal-950">გამარჯობა, {user.name}</h1>
        <p className="mt-1 text-sm text-royal-900/60">
          აქედან იმართება ყველაფერი, რასაც საიტზე ხედავენ ოჯახები.
        </p>
      </div>

      {summary.loading && <Spinner />}
      {summary.error && !summary.loading && (
        <ErrorNote message={summary.error.message} onRetry={summary.reload} />
      )}

      {summary.data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            icon={<Inbox className="size-5" />}
            tone={received > 0 ? 'alert' : 'calm'}
            value={received}
            label="ახალი მოთხოვნა"
            hint={received > 0 ? 'ელოდება პასუხს' : 'ყველაფერი დამუშავებულია'}
            to="/bookings"
          />
          <Stat
            icon={<CalendarCheck className="size-5" />}
            tone="calm"
            value={upcoming}
            label="მომავალი ზეიმი"
            hint="დადასტურებული, დღეიდან"
            to="/bookings"
          />
          <Stat
            icon={<PartyPopper className="size-5" />}
            tone="calm"
            value={confirmed}
            label="სულ დადასტურებული"
            hint="მთელი პერიოდი"
            to="/bookings"
          />
        </div>
      )}

      <Card>
        <CardHeader
          title="სწრაფი გადასვლა"
          actions={
            <a
              href={SITE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal-700 underline underline-offset-4"
            >
              საიტის ნახვა
              <ArrowRight className="size-3.5" />
            </a>
          }
        />
        <div className="grid gap-2 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.to}
              to={shortcut.to}
              className="group flex items-center justify-between gap-3 rounded-xl border border-royal-100 px-4 py-3 transition-colors hover:border-royal-300 hover:bg-royal-50"
            >
              <span className="min-w-0">
                <span className="block font-semibold text-royal-950">{shortcut.label}</span>
                <span className="block text-sm text-royal-900/55">{shortcut.hint}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-royal-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Stat({
  icon,
  value,
  label,
  hint,
  to,
  tone,
}: {
  icon: React.ReactNode
  value: number
  label: string
  hint: string
  to: string
  tone: 'calm' | 'alert'
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-panel transition-colors',
        tone === 'alert'
          ? 'border-sun-200 hover:border-sun-500'
          : 'border-royal-100 hover:border-royal-300',
      )}
    >
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-xl',
          tone === 'alert' ? 'bg-sun-100 text-sun-800' : 'bg-royal-100 text-royal-700',
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-bold text-royal-950">{value}</span>
        <span className="block text-sm font-semibold text-royal-900">{label}</span>
        <span className="block text-xs text-royal-900/55">{hint}</span>
      </span>
    </Link>
  )
}
