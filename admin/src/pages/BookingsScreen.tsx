import { useMemo, useState } from 'react'
import { CalendarDays, Clock, Mail, Phone, Search, Users } from 'lucide-react'
import type { Booking, BookingStatus } from '@shared/types'
import { api } from '@/lib/api'
import { errorMessage, useApiResource } from '@/lib/useResource'
import { useToast } from '@/components/ui/Toasts'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyNote,
  ErrorNote,
  Field,
  Modal,
  Spinner,
  inputClasses,
} from '@/components/ui'
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------
   Booking requests.

   The one screen with real consequences: confirming a booking takes that
   slot off the public calendar. Everything else here is read-only detail
   the venue needs when it calls the family back.
------------------------------------------------------------------- */

interface BookingsResponse {
  bookings: Booking[]
  total: number
  limit: number
  offset: number
}

const STATUS: Record<BookingStatus, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }> = {
  received: { label: 'ახალი', tone: 'warning' },
  confirmed: { label: 'დადასტურებული', tone: 'success' },
  declined: { label: 'უარყოფილი', tone: 'danger' },
  cancelled: { label: 'გაუქმებული', tone: 'neutral' },
}

const FILTERS: { id: BookingStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'ყველა' },
  { id: 'received', label: 'ახალი' },
  { id: 'confirmed', label: 'დადასტურებული' },
  { id: 'declined', label: 'უარყოფილი' },
  { id: 'cancelled', label: 'გაუქმებული' },
]

const MONTHS = [
  'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
  'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი',
]

function formatDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`)
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`
}

export function BookingsScreen() {
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  const path = useMemo(() => {
    const params = new URLSearchParams({ limit: '100' })
    if (filter !== 'all') params.set('status', filter)
    if (query) params.set('q', query)
    return `/api/admin/bookings?${params.toString()}`
  }, [filter, query])

  const resource = useApiResource<BookingsResponse>(path)
  const toast = useToast()

  const [open, setOpen] = useState<Booking | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const bookings = resource.data?.bookings ?? []

  const openDetail = (booking: Booking) => {
    setOpen(booking)
    setNote(booking.staffNote)
  }

  const update = async (booking: Booking, patch: { status?: BookingStatus; staffNote?: string }) => {
    setBusy(true)
    try {
      const updated = await api.patch<Booking>(`/api/admin/bookings/${booking.id}`, patch)
      toast.success('ჯავშანი განახლდა.')
      setOpen(updated)
      resource.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader
          title="ჯავშნები"
          description="მოთხოვნები საიტიდან. დადასტურება დროს საჯარო კალენდრიდან ხსნის."
        />

        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                aria-pressed={filter === option.id}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors',
                  filter === option.id
                    ? 'bg-royal-700 text-white'
                    : 'border border-royal-200 bg-white text-royal-800 hover:bg-royal-50',
                )}
              >
                {option.label}
              </button>
            ))}

            <form
              className="ml-auto flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                setQuery(search.trim())
              }}
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-royal-900/40" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ნომერი, სახელი, ტელეფონი"
                  className={cn(inputClasses(), 'w-56 pl-9')}
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">
                ძებნა
              </Button>
            </form>
          </div>

          {resource.loading && <Spinner />}
          {resource.error && !resource.loading && (
            <ErrorNote message={resource.error.message} onRetry={resource.reload} />
          )}
          {!resource.loading && !resource.error && bookings.length === 0 && (
            <EmptyNote>ამ ფილტრით ჯავშანი ვერ მოიძებნა.</EmptyNote>
          )}

          {bookings.length > 0 && (
            <ul className="flex flex-col gap-2">
              {bookings.map((booking) => (
                <li key={booking.id}>
                  <button
                    type="button"
                    onClick={() => openDetail(booking)}
                    className="flex w-full flex-wrap items-center gap-3 rounded-xl border border-royal-100 bg-white p-3 text-left transition-colors hover:border-royal-300 hover:bg-royal-50/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-royal-950">
                        {booking.childName}
                        <span className="text-sm font-normal text-royal-900/50">
                          {booking.reference}
                        </span>
                        <Badge tone={STATUS[booking.status].tone}>
                          {STATUS[booking.status].label}
                        </Badge>
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-royal-900/60">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" />
                          {formatDate(booking.date)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5" />
                          {booking.time}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="size-3.5" />
                          {booking.childrenCount}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="size-3.5" />
                          {booking.phone}
                        </span>
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Modal
        open={open !== null}
        wide
        title={open ? `ჯავშანი ${open.reference}` : ''}
        onClose={() => setOpen(null)}
      >
        {open && (
          <div className="flex flex-col gap-5 px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail label="ბავშვი" value={`${open.childName}, ${open.childAge} წლის`} />
              <Detail label="სტუმრები" value={`${open.childrenCount} ბავშვი`} />
              <Detail label="თარიღი" value={formatDate(open.date)} />
              <Detail label="დრო" value={open.time} />
              <Detail label="პროგრამა" value={open.programId ?? '—'} />
              <Detail
                label="დამატებები"
                value={open.extraIds.length > 0 ? open.extraIds.join(', ') : 'არ არის'}
              />
              <Detail label="მშობელი" value={open.parentName} />
              <Detail
                label="კონტაქტი"
                value={
                  <span className="flex flex-col gap-1">
                    <a
                      href={`tel:${open.phone}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-royal-800 underline underline-offset-4"
                    >
                      <Phone className="size-3.5" />
                      {open.phone}
                    </a>
                    {open.email && (
                      <a
                        href={`mailto:${open.email}`}
                        className="inline-flex items-center gap-1.5 break-all font-semibold text-royal-800 underline underline-offset-4"
                      >
                        <Mail className="size-3.5" />
                        {open.email}
                      </a>
                    )}
                  </span>
                }
              />
            </div>

            {open.notes && (
              <div className="rounded-xl bg-royal-50 p-4">
                <p className="text-xs font-semibold text-royal-900/55">ოჯახის კომენტარი</p>
                <p className="mt-1 text-pretty text-sm leading-relaxed text-royal-950">
                  {open.notes}
                </p>
              </div>
            )}

            <Field
              label="შიდა შენიშვნა"
              htmlFor="staffNote"
              hint="მხოლოდ თქვენ ხედავთ — საიტზე არასოდეს ჩანს."
            >
              <textarea
                id="staffNote"
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className={cn(inputClasses(), 'resize-y')}
              />
            </Field>

            <div className="flex flex-wrap items-center gap-2 border-t border-royal-100 pt-4">
              <Button
                variant="secondary"
                onClick={() => void update(open, { staffNote: note })}
                disabled={busy || note === open.staffNote}
              >
                შენიშვნის შენახვა
              </Button>

              <div className="ml-auto flex flex-wrap gap-2">
                {open.status !== 'confirmed' && (
                  <Button onClick={() => void update(open, { status: 'confirmed', staffNote: note })} loading={busy}>
                    დადასტურება
                  </Button>
                )}
                {open.status !== 'declined' && (
                  <Button
                    variant="danger"
                    onClick={() => void update(open, { status: 'declined', staffNote: note })}
                    disabled={busy}
                  >
                    უარყოფა
                  </Button>
                )}
                {open.status !== 'cancelled' && (
                  <Button
                    variant="ghost"
                    onClick={() => void update(open, { status: 'cancelled', staffNote: note })}
                    disabled={busy}
                  >
                    გაუქმება
                  </Button>
                )}
              </div>
            </div>

            <p className="text-xs text-royal-900/50">
              დადასტურება {formatDate(open.date)}, {open.time} დროს საჯარო კალენდარში დაკავებულად
              აჩვენებს.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-royal-900/55">{label}</p>
      <div className="mt-1 text-pretty text-sm font-medium text-royal-950">{value}</div>
    </div>
  )
}
