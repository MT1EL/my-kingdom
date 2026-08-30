import { useState } from 'react'
import { CalendarOff, Plus, Trash2 } from 'lucide-react'
import type { BlackoutDate, ScheduleSlot } from '@shared/types'
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
  Spinner,
  inputClasses,
} from '@/components/ui'
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------
   When the venue is open.

   Two lists drive the public calendar: the repeating weekly pattern, and
   one-off closures that override it. A day with no slots is simply closed.
------------------------------------------------------------------- */

type Slot = ScheduleSlot & { published: boolean }

/** Monday first — how the calendar on the site reads. */
const WEEKDAYS = [
  { value: 1, label: 'ორშაბათი' },
  { value: 2, label: 'სამშაბათი' },
  { value: 3, label: 'ოთხშაბათი' },
  { value: 4, label: 'ხუთშაბათი' },
  { value: 5, label: 'პარასკევი' },
  { value: 6, label: 'შაბათი' },
  { value: 0, label: 'კვირა' },
]

const todayISO = () => new Date().toISOString().slice(0, 10)

export function ScheduleScreen() {
  const slots = useApiResource<Slot[]>('/api/admin/schedule/slots')
  const blackouts = useApiResource<BlackoutDate[]>('/api/admin/schedule/blackouts')
  const toast = useToast()

  const [newTime, setNewTime] = useState('12:00')
  const [newDuration, setNewDuration] = useState(120)
  const [adding, setAdding] = useState<number | null>(null)

  const [blackoutDate, setBlackoutDate] = useState('')
  const [blackoutReason, setBlackoutReason] = useState('')
  const [savingBlackout, setSavingBlackout] = useState(false)

  const addSlot = async (weekday: number) => {
    setAdding(weekday)
    try {
      await api.post('/api/admin/schedule/slots', {
        weekday,
        time: newTime,
        durationMinutes: newDuration,
      })
      toast.success('დრო დაემატა.')
      slots.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setAdding(null)
    }
  }

  const removeSlot = async (id: string) => {
    try {
      await api.delete(`/api/admin/schedule/slots/${id}`)
      toast.success('დრო წაიშალა.')
      slots.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const addBlackout = async () => {
    if (!blackoutDate) return
    setSavingBlackout(true)
    try {
      await api.post('/api/admin/schedule/blackouts', {
        date: blackoutDate,
        reason: blackoutReason,
      })
      toast.success('თარიღი დაიხურა.')
      setBlackoutDate('')
      setBlackoutReason('')
      blackouts.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setSavingBlackout(false)
    }
  }

  const removeBlackout = async (id: string) => {
    try {
      await api.delete(`/api/admin/schedule/blackouts/${id}`)
      toast.success('თარიღი გაიხსნა.')
      blackouts.reload()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const byWeekday = (weekday: number) =>
    (slots.data ?? []).filter((slot) => slot.weekday === weekday).sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader
          title="სამუშაო განრიგი"
          description="კვირის განმეორებადი დროები. დღე, სადაც დრო არ არის, საიტზე დახურულია."
        />

        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-3 rounded-xl bg-royal-50 p-4">
            <Field label="დრო" htmlFor="newTime" className="w-32">
              <input
                id="newTime"
                type="time"
                step={900}
                value={newTime}
                onChange={(event) => setNewTime(event.target.value)}
                className={inputClasses()}
              />
            </Field>
            <Field label="ხანგრძლივობა (წუთი)" htmlFor="newDuration" className="w-44">
              <input
                id="newDuration"
                type="number"
                min={15}
                max={600}
                step={15}
                value={newDuration}
                onChange={(event) => setNewDuration(Number(event.target.value))}
                className={cn(inputClasses(), 'no-spinner')}
              />
            </Field>
            <p className="flex-1 text-sm text-royal-900/60">
              აირჩიეთ დრო, შემდეგ დააჭირეთ „დამატება“ იმ დღეს, რომელსაც სჭირდება.
            </p>
          </div>

          {slots.loading && <Spinner />}
          {slots.error && !slots.loading && (
            <ErrorNote message={slots.error.message} onRetry={slots.reload} />
          )}

          {!slots.loading && !slots.error && (
            <div className="grid gap-2">
              {WEEKDAYS.map((day) => {
                const daySlots = byWeekday(day.value)
                return (
                  <div
                    key={day.value}
                    className={cn(
                      'flex flex-wrap items-center gap-3 rounded-xl border border-royal-100 p-3',
                      daySlots.length === 0 && 'bg-slate-25',
                    )}
                  >
                    <p className="w-28 shrink-0 font-semibold text-royal-950">{day.label}</p>

                    <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                      {daySlots.length === 0 ? (
                        <span className="text-sm text-royal-900/45">დახურულია</span>
                      ) : (
                        daySlots.map((slot) => (
                          <span
                            key={slot.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-royal-100 py-1 pl-3 pr-1 text-sm font-semibold text-royal-800"
                          >
                            {slot.time}
                            <button
                              type="button"
                              onClick={() => void removeSlot(slot.id)}
                              aria-label={`წაშალე ${day.label} ${slot.time}`}
                              className="grid size-5 place-items-center rounded-full text-royal-700 transition-colors hover:bg-candy-200 hover:text-candy-800"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void addSlot(day.value)}
                      loading={adding === day.value}
                    >
                      <Plus className="size-4" />
                      {newTime}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="დახურული თარიღები"
          description="დასვენება, დღესასწაული ან კერძო ღონისძიება — ამ დღეს ჯავშანი არ მიიღება."
        />

        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <form
            className="flex flex-wrap items-end gap-3 rounded-xl bg-royal-50 p-4"
            onSubmit={(event) => {
              event.preventDefault()
              void addBlackout()
            }}
          >
            <Field label="თარიღი" htmlFor="blackoutDate" className="w-44">
              <input
                id="blackoutDate"
                type="date"
                min={todayISO()}
                value={blackoutDate}
                onChange={(event) => setBlackoutDate(event.target.value)}
                className={inputClasses()}
              />
            </Field>
            <Field label="მიზეზი" htmlFor="blackoutReason" className="min-w-48 flex-1">
              <input
                id="blackoutReason"
                type="text"
                value={blackoutReason}
                onChange={(event) => setBlackoutReason(event.target.value)}
                placeholder="არჩევითი — მაგ. კერძო ღონისძიება"
                className={inputClasses()}
              />
            </Field>
            <Button type="submit" loading={savingBlackout} disabled={!blackoutDate}>
              <CalendarOff className="size-4" />
              დახურვა
            </Button>
          </form>

          {blackouts.loading && <Spinner />}
          {blackouts.error && !blackouts.loading && (
            <ErrorNote message={blackouts.error.message} onRetry={blackouts.reload} />
          )}
          {!blackouts.loading && !blackouts.error && (blackouts.data ?? []).length === 0 && (
            <EmptyNote>დახურული თარიღი არ არის.</EmptyNote>
          )}

          {(blackouts.data ?? []).length > 0 && (
            <ul className="flex flex-col gap-2">
              {(blackouts.data ?? []).map((entry) => {
                const past = entry.date < todayISO()
                return (
                  <li
                    key={entry.id}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border border-royal-100 p-3',
                      past && 'opacity-55',
                    )}
                  >
                    <span className="font-semibold text-royal-950">{entry.date}</span>
                    {past && <Badge>გასული</Badge>}
                    <span className="min-w-0 flex-1 truncate text-sm text-royal-900/60">
                      {entry.reason ?? '—'}
                    </span>
                    <button
                      type="button"
                      onClick={() => void removeBlackout(entry.id)}
                      aria-label={`გახსენი ${entry.date}`}
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-royal-900/60 transition-colors hover:bg-candy-100 hover:text-candy-700"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </Card>
    </div>
  )
}
