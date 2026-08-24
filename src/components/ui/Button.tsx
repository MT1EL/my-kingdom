import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-45 whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary:
    'gradient-royal text-white shadow-[0_10px_30px_-10px_rgb(112_55_143/0.85)] hover:shadow-[0_16px_40px_-12px_rgb(112_55_143/0.9)] hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-royal-950 text-white hover:bg-royal-900 shadow-soft hover:-translate-y-0.5 active:translate-y-0',
  outline:
    'border-2 border-royal-200 bg-white/80 text-royal-900 backdrop-blur hover:border-royal-400 hover:bg-white hover:-translate-y-0.5 active:translate-y-0',
  light:
    'bg-white text-royal-800 shadow-soft hover:bg-royal-50 hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'text-royal-800 hover:bg-royal-100/70',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-[0.95rem]',
  lg: 'px-7 py-4 text-base sm:px-9',
}

interface CommonProps {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps & ComponentPropsWithoutRef<'button'>
type LinkButtonProps = CommonProps & { to: string }
type AnchorProps = CommonProps & ComponentPropsWithoutRef<'a'>

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  to,
  children,
}: LinkButtonProps) {
  return (
    <Link to={to} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  )
}

export function AnchorButton({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: AnchorProps) {
  return <a className={cn(base, variants[variant], sizes[size], className)} {...props} />
}
