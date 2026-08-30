import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { SiteConfig } from '@shared/types'
import { api } from '@/lib/api'
import { errorFields, errorMessage, useApiResource } from '@/lib/useResource'
import { useToast } from '@/components/ui/Toasts'
import {
  Button,
  Card,
  CardHeader,
  ErrorNote,
  Field,
  Spinner,
  inputClasses,
} from '@/components/ui'
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------
   Site settings.

   The flat shape the API expects, not the nested one the site reads — the
   form maps between them so the owner sees one page of plain fields.

   A cleared field is saved as null, which is what makes the site show its
   honest "დასაზუსტებელია" chip instead of an empty gap.
------------------------------------------------------------------- */

interface SettingsForm {
  name: string
  nameLatin: string
  tagline: string
  city: string
  phone: string
  phoneDisplay: string
  email: string
  address: string
  addressHint: string
  facebook: string
  instagram: string
  mapQuery: string
  mapIsExact: boolean
  mapZoom: number
  priceNote: string
  menuNotes: string[]
  minLeadDays: number
  maxAheadDays: number
  maxChildren: number
  openingHours: { day: string; hours: string }[]
}

const toForm = (site: SiteConfig): SettingsForm => ({
  name: site.name,
  nameLatin: site.nameLatin,
  tagline: site.tagline,
  city: site.city,
  phone: site.contact.phone ?? '',
  phoneDisplay: site.contact.phoneDisplay ?? '',
  email: site.contact.email ?? '',
  address: site.contact.address ?? '',
  addressHint: site.contact.addressHint,
  facebook: site.social.facebook ?? '',
  instagram: site.social.instagram ?? '',
  mapQuery: site.map.mapQuery,
  mapIsExact: site.map.isExactLocation,
  mapZoom: site.map.zoom,
  priceNote: site.priceNote,
  menuNotes: site.menuNotes,
  minLeadDays: site.booking.minLeadDays,
  maxAheadDays: site.booking.maxAheadDays,
  maxChildren: site.booking.maxChildren,
  openingHours: site.openingHours.map((entry) => ({ day: entry.day, hours: entry.hours ?? '' })),
})

/** The API stores "not supplied" as null, so empty strings are converted here. */
const orNull = (value: string): string | null => (value.trim() === '' ? null : value.trim())

const toPayload = (form: SettingsForm) => ({
  ...form,
  phone: orNull(form.phone),
  phoneDisplay: orNull(form.phoneDisplay),
  email: orNull(form.email),
  address: orNull(form.address),
  facebook: orNull(form.facebook),
  instagram: orNull(form.instagram),
  menuNotes: form.menuNotes.filter((note) => note.trim() !== ''),
  openingHours: form.openingHours
    .filter((entry) => entry.day.trim() !== '')
    .map((entry) => ({ day: entry.day, hours: orNull(entry.hours) })),
})

export function SettingsScreen() {
  const resource = useApiResource<SiteConfig>('/api/admin/settings')
  const toast = useToast()

  const [form, setForm] = useState<SettingsForm | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (resource.data) setForm(toForm(resource.data))
  }, [resource.data])

  if (resource.loading) return <Spinner />
  if (resource.error) return <ErrorNote message={resource.error.message} onRetry={resource.reload} />
  if (!form) return <Spinner />

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current))
    setErrors((current) => {
      if (!current[key as string]) return current
      const next = { ...current }
      delete next[key as string]
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    setErrors({})
    try {
      const updated = await api.put<SiteConfig>('/api/admin/settings', toPayload(form))
      resource.set(updated)
      toast.success('პარამეტრები შენახულია.')
    } catch (error) {
      setErrors(errorFields(error))
      toast.error(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const text = (key: keyof SettingsForm, label: string, extra?: { hint?: string; placeholder?: string }) => (
    <Field label={label} htmlFor={key} error={errors[key]} hint={extra?.hint}>
      <input
        id={key}
        type="text"
        value={String(form[key] ?? '')}
        placeholder={extra?.placeholder}
        onChange={(event) => set(key, event.target.value as never)}
        className={inputClasses(Boolean(errors[key]))}
      />
    </Field>
  )

  const number = (key: keyof SettingsForm, label: string, hint?: string) => (
    <Field label={label} htmlFor={key} error={errors[key]} hint={hint}>
      <input
        id={key}
        type="number"
        value={Number(form[key] ?? 0)}
        onChange={(event) => set(key, Number(event.target.value) as never)}
        className={cn(inputClasses(Boolean(errors[key])), 'no-spinner')}
      />
    </Field>
  )

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      <Card>
        <CardHeader title="სივრცე" description="სახელი და აღწერა, რომელიც ყველა გვერდზე ჩანს." />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {text('name', 'დასახელება')}
          {text('nameLatin', 'დასახელება ლათინურად')}
          <div className="sm:col-span-2">{text('tagline', 'სლოგანი')}</div>
          {text('city', 'ქალაქი')}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="კონტაქტი"
          description="ცარიელი ველი საიტზე „დასაზუსტებელია“-დ გამოჩნდება — არასოდეს გამოგონილი ნომრით."
        />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {text('phone', 'ტელეფონი (ბმულისთვის)', { placeholder: '+995555123456' })}
          {text('phoneDisplay', 'ტელეფონი (საჩვენებლად)', { placeholder: '+995 555 12 34 56' })}
          {text('email', 'ელფოსტა', { placeholder: 'info@mykingdom.ge' })}
          {text('address', 'მისამართი', { placeholder: 'თბილისი, ვაჟა-ფშაველას გამზ. 00' })}
          {text('addressHint', 'მისამართის შემცვლელი ტექსტი', {
            hint: 'რას დაწერს საიტი, სანამ მისამართი ცარიელია.',
          })}
          {text('facebook', 'Facebook')}
          {text('instagram', 'Instagram')}
        </div>
      </Card>

      <Card>
        <CardHeader title="რუკა" description="მისამართი, რომელსაც Google Maps ეძებს." />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">{text('mapQuery', 'რუკის მისამართი')}</div>
          {number('mapZoom', 'მასშტაბი', '1 — მთელი მსოფლიო, 21 — შენობა')}
          <div className="flex items-start gap-3 rounded-xl border border-royal-200 bg-white px-3.5 py-3">
            <input
              id="mapIsExact"
              type="checkbox"
              checked={form.mapIsExact}
              onChange={(event) => set('mapIsExact', event.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-royal-700"
            />
            <label htmlFor="mapIsExact" className="min-w-0 flex-1 cursor-pointer">
              <span className="block text-sm font-semibold text-royal-900">ზუსტი მისამართია</span>
              <span className="mt-0.5 block text-xs text-royal-900/55">
                სანამ მოხსნილია, საიტი აფრთხილებს, რომ მდებარეობა სავარაუდოა.
              </span>
            </label>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="სამუშაო საათები" description="როგორც ფუტერსა და მდებარეობის გვერდზე ჩანს." />
        <div className="flex flex-col gap-3 p-5">
          {form.openingHours.map((entry, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={entry.day}
                placeholder="ორშაბათი – პარასკევი"
                onChange={(event) =>
                  set(
                    'openingHours',
                    form.openingHours.map((row, position) =>
                      position === index ? { ...row, day: event.target.value } : row,
                    ),
                  )
                }
                className={cn(inputClasses(), 'min-w-40 flex-1')}
              />
              <input
                type="text"
                value={entry.hours}
                placeholder="11:00 – 20:00 (ცარიელი = დასაზუსტებელია)"
                onChange={(event) =>
                  set(
                    'openingHours',
                    form.openingHours.map((row, position) =>
                      position === index ? { ...row, hours: event.target.value } : row,
                    ),
                  )
                }
                className={cn(inputClasses(), 'min-w-40 flex-1')}
              />
              <button
                type="button"
                onClick={() =>
                  set('openingHours', form.openingHours.filter((_, position) => position !== index))
                }
                aria-label={`წაშალე სტრიქონი ${index + 1}`}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-royal-900/55 transition-colors hover:bg-candy-100 hover:text-candy-700"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="self-start"
            onClick={() => set('openingHours', [...form.openingHours, { day: '', hours: '' }])}
          >
            <Plus className="size-4" />
            სტრიქონის დამატება
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="ტექსტები" description="შენიშვნები ფასებსა და მენიუზე." />
        <div className="flex flex-col gap-4 p-5">
          <Field
            label="ფასის შენიშვნა"
            htmlFor="priceNote"
            error={errors.priceNote}
            hint="ჩანს პროგრამების გვერდზე, ჯავშანში და მთავარ გვერდზე."
          >
            <textarea
              id="priceNote"
              rows={3}
              value={form.priceNote}
              onChange={(event) => set('priceNote', event.target.value)}
              className={cn(inputClasses(Boolean(errors.priceNote)), 'resize-y')}
            />
          </Field>

          <Field label="მენიუს შენიშვნები" hint="მენიუს გვერდზე „კარგია იცოდეთ“ ბლოკი.">
            <div className="flex flex-col gap-2">
              {form.menuNotes.map((note, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={note}
                    onChange={(event) =>
                      set(
                        'menuNotes',
                        form.menuNotes.map((row, position) =>
                          position === index ? event.target.value : row,
                        ),
                      )
                    }
                    className={inputClasses()}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set('menuNotes', form.menuNotes.filter((_, position) => position !== index))
                    }
                    aria-label={`წაშალე შენიშვნა ${index + 1}`}
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-royal-900/55 transition-colors hover:bg-candy-100 hover:text-candy-700"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="self-start"
                onClick={() => set('menuNotes', [...form.menuNotes, ''])}
              >
                <Plus className="size-4" />
                შენიშვნის დამატება
              </Button>
            </div>
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="ჯავშნის წესები" description="რას უშვებს საიტის კალენდარი." />
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {number('minLeadDays', 'მინიმუმ რამდენი დღით ადრე', 'დღეს + ეს რიცხვი = პირველი თარიღი')}
          {number('maxAheadDays', 'მაქსიმუმ რამდენი დღით ადრე', 'რამდენად შორს ჩანს კალენდარი')}
          {number('maxChildren', 'ბავშვების მაქსიმალური რაოდენობა')}
        </div>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" loading={saving} className="shadow-panel">
          შენახვა
        </Button>
      </div>
    </form>
  )
}
