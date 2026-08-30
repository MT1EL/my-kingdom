import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { useEffect } from 'react'
import { Loader2, X } from 'lucide-react'
import { cn } from '@/lib/cn'

/* ------------------------------------------------------------------
   Dashboard primitives.

   Small enough to live in one file — every page composes from these, so
   having them together makes the visual language easy to keep consistent.
------------------------------------------------------------------- */

/* ----------------------------- button ---------------------------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary: 'bg-royal-700 text-white hover:bg-royal-800',
  secondary: 'border border-royal-200 bg-white text-royal-900 hover:bg-royal-50',
  ghost: 'text-royal-800 hover:bg-royal-100',
  danger: 'border border-candy-200 bg-white text-candy-800 hover:bg-candy-100',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
}

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonBase, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

/* ------------------------------ card ----------------------------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-royal-100 bg-white shadow-panel', className)}>
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-royal-100 px-5 py-4">
      <div className="min-w-0">
        <h2 className="font-semibold text-royal-950">{title}</h2>
        {description && <p className="mt-1 text-sm text-royal-900/60">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ------------------------------ field ---------------------------- */

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-royal-900">
        {label}
        {required && <span className="ml-1 text-candy-600">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-sm font-medium text-candy-700">{error}</p>
      ) : (
        hint && <p className="text-xs text-royal-900/50">{hint}</p>
      )}
    </div>
  )
}

export const inputClasses = (invalid = false): string =>
  cn(
    'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-royal-950 transition-colors',
    'placeholder:text-royal-900/35 focus:outline-none focus:ring-2',
    invalid
      ? 'border-candy-400 focus:border-candy-500 focus:ring-candy-200'
      : 'border-royal-200 focus:border-royal-500 focus:ring-royal-200',
  )

/* ----------------------------- badge ----------------------------- */

const badgeTones = {
  neutral: 'bg-royal-100 text-royal-700',
  success: 'bg-mint-100 text-mint-700',
  warning: 'bg-sun-100 text-sun-800',
  danger: 'bg-candy-100 text-candy-800',
} as const

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: keyof typeof badgeTones
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
        badgeTones[tone],
      )}
    >
      {children}
    </span>
  )
}

/* ----------------------------- states ---------------------------- */

export function Spinner({ label = 'იტვირთება…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-14 text-royal-900/55" role="status">
      <Loader2 className="size-5 animate-spin" />
      {label}
    </div>
  )
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-candy-200 bg-candy-100/60 px-4 py-3 text-sm font-medium text-candy-800"
    >
      <span>{message}</span>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          სცადე თავიდან
        </Button>
      )}
    </div>
  )
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-royal-200 px-4 py-10 text-center text-sm text-royal-900/55">
      {children}
    </p>
  )
}

/* ----------------------------- modal ----------------------------- */

export function Modal({
  open,
  title,
  onClose,
  children,
  wide = false,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-royal-950/40 p-4 backdrop-blur-sm sm:p-8">
      {/* Clicking the backdrop closes; the panel stops the event bubbling. */}
      <button
        type="button"
        aria-label="დახურვა"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative my-auto w-full rounded-2xl bg-white shadow-panel',
          wide ? 'max-w-3xl' : 'max-w-xl',
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-royal-100 px-5 py-4">
          <h2 className="font-semibold text-royal-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="დახურვა"
            className="grid size-8 place-items-center rounded-lg text-royal-900/60 transition-colors hover:bg-royal-100"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ---------------------------- confirm ---------------------------- */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'დიახ, წავშალოთ',
  onConfirm,
  onCancel,
  busy = false,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="px-5 py-5">
        <p className="text-pretty text-sm leading-relaxed text-royal-900/75">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            გაუქმება
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
