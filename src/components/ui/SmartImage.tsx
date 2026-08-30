import { useState, type ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { mediaUrl } from '@/lib/http'

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  /** Extra classes for the wrapping element (aspect ratio, rounding, …). */
  wrapperClassName?: string
}

/**
 * Image with a branded skeleton while loading and a graceful fallback if the
 * file is missing — so a swapped-out placeholder photo never leaves a broken
 * icon on the page.
 */
export function SmartImage({
  src,
  alt,
  className,
  wrapperClassName,
  loading = 'lazy',
  ...props
}: SmartImageProps) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  return (
    <span className={cn('relative block overflow-hidden bg-royal-100', wrapperClassName)}>
      {state !== 'ready' && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-royal-100 via-candy-100 to-sun-100',
            state === 'loading' &&
              'bg-[linear-gradient(100deg,var(--color-royal-100)_20%,var(--color-candy-100)_40%,var(--color-royal-100)_60%)] bg-[length:200%_100%] animate-shimmer',
          )}
        />
      )}
      {state === 'error' && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-4xl opacity-60"
        >
          🎈
        </span>
      )}
      <img
        // Photos are stored as "/uploads/…" paths; when the API lives on
        // another host that has to be resolved against it, not against us.
        src={mediaUrl(src)}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setState('ready')}
        onError={() => setState('error')}
        className={cn(
          'relative h-full w-full object-cover transition-opacity duration-700',
          state === 'ready' ? 'opacity-100' : 'opacity-0',
          className,
        )}
        {...props}
      />
    </span>
  )
}
