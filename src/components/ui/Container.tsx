import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'default' | 'wide' | 'narrow'
}

const sizes = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
}

export function Container({ children, className, size = 'default' }: ContainerProps) {
  return <div className={cn('mx-auto w-full px-5 sm:px-8', sizes[size], className)}>{children}</div>
}
