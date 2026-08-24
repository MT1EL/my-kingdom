import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  children?: ReactNode
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-royal-950 pb-16 pt-32 text-white sm:pb-20 sm:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-20 top-10 size-72 rounded-full bg-candy-600/30 blur-3xl" />
        <div className="absolute right-0 top-32 size-80 rounded-full bg-royal-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-64 rounded-full bg-sun-500/20 blur-3xl" />
      </div>

      <Container size="wide" className="relative">
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/85">
            <span className="size-1.5 rounded-full bg-sun-300" />
            {eyebrow}
          </span>
          <h1 className="mt-5 text-balance text-4xl leading-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
            {description}
          </p>
          {children && <div className="mt-8">{children}</div>}
        </Reveal>
      </Container>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-cream"
      />
    </section>
  )
}
