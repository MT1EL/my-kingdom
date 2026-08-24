import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Reveal } from '@/components/ui/Reveal'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'dark',
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold',
            tone === 'dark' ? 'bg-royal-100 text-royal-700' : 'bg-white/15 text-white',
          )}
        >
          <span className="size-1.5 rounded-full bg-current opacity-70" />
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'text-balance text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]',
          tone === 'dark' ? 'text-royal-950' : 'text-white',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'max-w-2xl text-pretty text-base leading-relaxed sm:text-lg',
            tone === 'dark' ? 'text-royal-900/70' : 'text-white/80',
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  )
}
