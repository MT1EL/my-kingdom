import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'

interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-royal-900">
        {label}
        {required && <span className="ml-1 text-candy-600">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-sm text-candy-700">
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </p>
      ) : (
        hint && <p className="text-sm text-royal-900/55">{hint}</p>
      )}
    </div>
  )
}

export const inputClasses = (hasError?: boolean) =>
  cn(
    'w-full rounded-2xl border-2 bg-white px-4 py-3 text-royal-950 outline-none transition-colors placeholder:text-royal-900/35',
    hasError
      ? 'border-candy-400 focus:border-candy-600'
      : 'border-royal-100 hover:border-royal-200 focus:border-royal-500',
  )
