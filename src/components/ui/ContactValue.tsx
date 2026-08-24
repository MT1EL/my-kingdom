import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ContactValueProps {
  /** `null` while the venue has not supplied the information yet. */
  value: string | null
  href?: string | null
  placeholder?: string
  className?: string
  children?: ReactNode
}

/**
 * Renders a contact detail as a real link when we have it, and as an honest
 * "დასაზუსტებელია" chip when we don't — never as a fake value or dead link.
 */
export function ContactValue({
  value,
  href,
  placeholder = 'დასაზუსტებელია',
  className,
}: ContactValueProps) {
  if (!value) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-royal-100/80 px-2.5 py-0.5 text-sm font-medium text-royal-600',
          className,
        )}
      >
        {placeholder}
      </span>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          'font-semibold text-current underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current',
          className,
        )}
      >
        {value}
      </a>
    )
  }

  return <span className={cn('font-semibold', className)}>{value}</span>
}
