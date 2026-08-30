import type { BookingDraft, FieldErrors } from '@/types'
import { Field, inputClasses } from '@/components/booking/Field'
import { useSite } from '@/content'

interface DetailsStepProps {
  draft: BookingDraft
  errors: FieldErrors<BookingDraft>
  onChange: <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => void
}

export function DetailsStep({ draft, errors, onChange }: DetailsStepProps) {
  const site = useSite()

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-2xl text-royal-950 sm:text-3xl">მონაწილეების დეტალები</h2>
        <p className="mt-2 text-pretty leading-relaxed text-royal-900/65">
          ეს ინფორმაცია გვჭირდება, რომ ზეიმი სწორად დავგეგმოთ და დაგიკავშირდეთ.
        </p>
      </header>

      <div className="rounded-4xl border border-royal-100 bg-white p-5 shadow-soft sm:p-7">
        <h3 className="text-lg text-royal-950">ბავშვის შესახებ</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field id="childName" label="ბავშვის სახელი" required error={errors.childName}>
            <input
              id="childName"
              name="childName"
              type="text"
              autoComplete="off"
              value={draft.childName}
              onChange={(event) => onChange('childName', event.target.value)}
              aria-invalid={Boolean(errors.childName)}
              aria-describedby={errors.childName ? 'childName-error' : undefined}
              className={inputClasses(Boolean(errors.childName))}
              placeholder="მაგ. ნიკა"
            />
          </Field>

          <Field
            id="childAge"
            label="რამდენი წლის ხდება"
            required
            error={errors.childAge}
            hint="1-დან 17 წლამდე"
          >
            <input
              id="childAge"
              name="childAge"
              type="number"
              inputMode="numeric"
              min={1}
              max={17}
              value={draft.childAge}
              onChange={(event) => onChange('childAge', event.target.value)}
              aria-invalid={Boolean(errors.childAge)}
              aria-describedby={errors.childAge ? 'childAge-error' : undefined}
              className={inputClasses(Boolean(errors.childAge))}
              placeholder="მაგ. 7"
            />
          </Field>

          <Field
            id="childrenCount"
            label="ბავშვების სავარაუდო რაოდენობა"
            required
            error={errors.childrenCount}
            hint={`მაქსიმუმ ${site.booking.maxChildren}`}
            className="sm:col-span-2"
          >
            <input
              id="childrenCount"
              name="childrenCount"
              type="number"
              inputMode="numeric"
              min={1}
              max={site.booking.maxChildren}
              value={draft.childrenCount}
              onChange={(event) => onChange('childrenCount', event.target.value)}
              aria-invalid={Boolean(errors.childrenCount)}
              aria-describedby={errors.childrenCount ? 'childrenCount-error' : undefined}
              className={inputClasses(Boolean(errors.childrenCount))}
              placeholder="მაგ. 12"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-4xl border border-royal-100 bg-white p-5 shadow-soft sm:p-7">
        <h3 className="text-lg text-royal-950">მშობლის საკონტაქტო</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field id="parentName" label="სახელი და გვარი" required error={errors.parentName}>
            <input
              id="parentName"
              name="parentName"
              type="text"
              autoComplete="name"
              value={draft.parentName}
              onChange={(event) => onChange('parentName', event.target.value)}
              aria-invalid={Boolean(errors.parentName)}
              aria-describedby={errors.parentName ? 'parentName-error' : undefined}
              className={inputClasses(Boolean(errors.parentName))}
              placeholder="მაგ. ანა ბერიძე"
            />
          </Field>

          <Field
            id="phone"
            label="ტელეფონი"
            required
            error={errors.phone}
            hint="ფორმატი: 5XX XX XX XX"
          >
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={draft.phone}
              onChange={(event) => onChange('phone', event.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={inputClasses(Boolean(errors.phone))}
              placeholder="555 12 34 56"
            />
          </Field>

          <Field
            id="email"
            label="ელფოსტა"
            error={errors.email}
            hint="არჩევითია — ჯავშნის ასლს გამოგიგზავნით"
            className="sm:col-span-2"
          >
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={draft.email}
              onChange={(event) => onChange('email', event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={inputClasses(Boolean(errors.email))}
              placeholder="mail@example.com"
            />
          </Field>

          <Field
            id="notes"
            label="დამატებითი კომენტარი"
            error={errors.notes}
            hint={`${draft.notes.length} / 600 სიმბოლო`}
            className="sm:col-span-2"
          >
            <textarea
              id="notes"
              name="notes"
              rows={4}
              maxLength={600}
              value={draft.notes}
              onChange={(event) => onChange('notes', event.target.value)}
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? 'notes-error' : undefined}
              className={`${inputClasses(Boolean(errors.notes))} resize-y`}
              placeholder="ალერგიები, საყვარელი პერსონაჟები, სპეციალური სურვილები…"
            />
          </Field>
        </div>
      </div>
    </div>
  )
}
