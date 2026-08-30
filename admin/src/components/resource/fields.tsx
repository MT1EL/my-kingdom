import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react'
import { LucideIcon } from '@/components/resource/LucideIcon'
import { ACCENTS, ICON_NAMES } from '@shared/icons'
import { api, type UploadResult } from '@/lib/api'
import { errorMessage } from '@/lib/useResource'
import { useToast } from '@/components/ui/Toasts'
import { Button, Field, inputClasses } from '@/components/ui'
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------
   Form fields, described as data.

   Every content type in the dashboard is a list of these descriptors.
   That is why adding a field to a programme is one line here rather than
   a new form component — and why every screen validates, saves and looks
   the same.
------------------------------------------------------------------- */

export type FieldSpec =
  | { kind: 'text'; name: string; label: string; hint?: string; required?: boolean; placeholder?: string; full?: boolean }
  | { kind: 'textarea'; name: string; label: string; hint?: string; required?: boolean; rows?: number; full?: boolean }
  | { kind: 'number'; name: string; label: string; hint?: string; min?: number; max?: number; required?: boolean; full?: boolean }
  /** A price in GEL where empty means "not set yet" — the site shows a chip. */
  | { kind: 'price'; name: string; label: string; hint?: string; full?: boolean }
  | { kind: 'boolean'; name: string; label: string; hint?: string; full?: boolean }
  | { kind: 'select'; name: string; label: string; hint?: string; options: { value: string; label: string }[]; full?: boolean }
  | { kind: 'multi'; name: string; label: string; hint?: string; options: { value: string; label: string }[]; full?: boolean }
  /** A list of short strings, e.g. a programme's highlights. */
  | { kind: 'list'; name: string; label: string; hint?: string; max?: number; full?: boolean }
  | { kind: 'image'; name: string; label: string; hint?: string; full?: boolean }
  | { kind: 'icon'; name: string; label: string; hint?: string; full?: boolean }
  | { kind: 'accent'; name: string; label: string; hint?: string; full?: boolean }

export type FormValues = Record<string, unknown>

interface FieldProps {
  spec: FieldSpec
  value: unknown
  error?: string
  onChange: (name: string, value: unknown) => void
}

/* ---------------------------- helpers ---------------------------- */

const asString = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value)

const asList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []

/* --------------------------- sub-fields -------------------------- */

function ListInput({ value, onChange, max = 12 }: { value: string[]; onChange: (next: string[]) => void; max?: number }) {
  const update = (index: number, next: string) =>
    onChange(value.map((entry, position) => (position === index ? next : entry)))

  return (
    <div className="flex flex-col gap-2">
      {value.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={entry}
            onChange={(event) => update(index, event.target.value)}
            className={inputClasses()}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, position) => position !== index))}
            aria-label={`წაშალე პუნქტი ${index + 1}`}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-royal-900/50 transition-colors hover:bg-candy-100 hover:text-candy-700"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}

      {value.length < max && (
        <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...value, ''])} className="self-start">
          <Plus className="size-4" />
          დამატება
        </Button>
      )}
    </div>
  )
}

function ImageInput({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const toast = useToast()

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const result = await api.upload<UploadResult>('/api/admin/uploads', file)
      onChange(result.url)
      toast.success('სურათი აიტვირთა.')
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {value && (
        <img
          src={value}
          alt=""
          className="h-40 w-full rounded-xl border border-royal-100 object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void upload(file)
          }}
        />
        <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {value ? 'სხვა სურათი' : 'ატვირთე სურათი'}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
            მოაშორე
          </Button>
        )}
      </div>

      {/* A URL still works — useful for the stock photos already in place. */}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="ან ჩასვით სურათის ბმული"
        className={inputClasses()}
      />
    </div>
  )
}

function IconPicker({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <div className="grid max-h-52 grid-cols-6 gap-1.5 overflow-y-auto rounded-xl border border-royal-200 bg-white p-2 sm:grid-cols-8">
      {ICON_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          title={name}
          aria-pressed={value === name}
          className={cn(
            'grid aspect-square place-items-center rounded-lg transition-colors',
            value === name ? 'bg-royal-700 text-white' : 'text-royal-800 hover:bg-royal-100',
          )}
        >
          <LucideIcon name={name} className="size-4" />
        </button>
      ))}
    </div>
  )
}

function AccentPicker({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ACCENTS.map((accent) => (
        <button
          key={accent.value}
          type="button"
          onClick={() => onChange(accent.value)}
          aria-pressed={value === accent.value}
          className={cn(
            'flex items-center gap-2 rounded-lg border-2 p-1.5 text-left text-xs font-medium transition-colors',
            value === accent.value
              ? 'border-royal-600 bg-royal-50'
              : 'border-transparent hover:bg-royal-50',
          )}
        >
          <span className={cn('h-7 w-9 shrink-0 rounded bg-gradient-to-br', accent.value)} />
          <span className="min-w-0 truncate text-royal-900/75">{accent.label}</span>
        </button>
      ))}
    </div>
  )
}

/* --------------------------- the field --------------------------- */

export function FormField({ spec, value, error, onChange }: FieldProps) {
  const id = `field-${spec.name}`
  const set = (next: unknown) => onChange(spec.name, next)
  const invalid = Boolean(error)
  const wide = spec.full ? 'sm:col-span-2' : undefined

  switch (spec.kind) {
    case 'text':
      return (
        <Field label={spec.label} htmlFor={id} error={error} hint={spec.hint} required={spec.required} className={wide}>
          <input
            id={id}
            type="text"
            value={asString(value)}
            placeholder={spec.placeholder}
            onChange={(event) => set(event.target.value)}
            className={inputClasses(invalid)}
          />
        </Field>
      )

    case 'textarea':
      return (
        <Field label={spec.label} htmlFor={id} error={error} hint={spec.hint} required={spec.required} className={wide}>
          <textarea
            id={id}
            rows={spec.rows ?? 4}
            value={asString(value)}
            onChange={(event) => set(event.target.value)}
            className={cn(inputClasses(invalid), 'resize-y')}
          />
        </Field>
      )

    case 'number':
      return (
        <Field label={spec.label} htmlFor={id} error={error} hint={spec.hint} required={spec.required} className={wide}>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={spec.min}
            max={spec.max}
            value={asString(value)}
            onChange={(event) => set(event.target.value === '' ? '' : Number(event.target.value))}
            className={cn(inputClasses(invalid), 'no-spinner')}
          />
        </Field>
      )

    case 'price':
      return (
        <Field
          label={spec.label}
          htmlFor={id}
          error={error}
          hint={spec.hint ?? 'ცარიელი დატოვეთ, თუ ფასი ჯერ არ არის დაზუსტებული'}
          className={wide}
        >
          <div className="relative">
            <input
              id={id}
              type="number"
              inputMode="numeric"
              min={0}
              value={value === null || value === undefined ? '' : String(value)}
              // An empty box is meaningful: it stores NULL, and the site then
              // renders "დასაზუსტებელია" instead of inventing a number.
              onChange={(event) => set(event.target.value === '' ? null : Number(event.target.value))}
              className={cn(inputClasses(invalid), 'no-spinner pr-9')}
              placeholder="დასაზუსტებელია"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-royal-900/45">
              ₾
            </span>
          </div>
        </Field>
      )

    case 'boolean':
      return (
        <div className={cn('flex items-start gap-3 rounded-xl border border-royal-200 bg-white px-3.5 py-3', wide)}>
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => set(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-royal-700"
          />
          <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
            <span className="block text-sm font-semibold text-royal-900">{spec.label}</span>
            {spec.hint && <span className="mt-0.5 block text-xs text-royal-900/55">{spec.hint}</span>}
          </label>
        </div>
      )

    case 'select':
      return (
        <Field label={spec.label} htmlFor={id} error={error} hint={spec.hint} className={wide}>
          <select
            id={id}
            value={asString(value)}
            onChange={(event) => set(event.target.value)}
            className={inputClasses(invalid)}
          >
            {spec.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      )

    case 'multi': {
      const selected = asList(value)
      return (
        <Field label={spec.label} error={error} hint={spec.hint} className={wide}>
          <div className="flex flex-wrap gap-2">
            {spec.options.map((option) => {
              const on = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    set(on ? selected.filter((entry) => entry !== option.value) : [...selected, option.value])
                  }
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
                    on ? 'bg-royal-700 text-white' : 'border border-royal-200 bg-white text-royal-800 hover:bg-royal-50',
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </Field>
      )
    }

    case 'list':
      return (
        <Field label={spec.label} error={error} hint={spec.hint} className={wide}>
          <ListInput value={asList(value)} onChange={set} max={spec.max} />
        </Field>
      )

    case 'image':
      return (
        <Field label={spec.label} error={error} hint={spec.hint} className={wide}>
          <ImageInput value={asString(value)} onChange={set} />
        </Field>
      )

    case 'icon':
      return (
        <Field label={spec.label} error={error} hint={spec.hint} className={wide}>
          <IconPicker value={asString(value)} onChange={set} />
        </Field>
      )

    case 'accent':
      return (
        <Field label={spec.label} error={error} hint={spec.hint} className={wide}>
          <AccentPicker value={asString(value)} onChange={set} />
        </Field>
      )
  }
}
