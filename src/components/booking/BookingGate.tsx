import type { ComponentProps, ReactNode } from 'react'
import { LinkButton } from '@/components/ui/Button'
import { bookingEnabled } from '@/lib/features'

/* ------------------------------------------------------------------
   The switch that hides the booking flow.

   Every link into `/booking` goes through one of these two, so turning
   `VITE_BOOKING_ENABLED` off cannot leave a button pointing at a route
   that is no longer registered. See `lib/features.ts`.
------------------------------------------------------------------- */

/** Renders its children only while booking is on. */
export function BookingGate({ children }: { children: ReactNode }) {
  if (!bookingEnabled) return null
  return <>{children}</>
}

type BookingButtonProps = Omit<ComponentProps<typeof LinkButton>, 'to'> & {
  /** Defaults to the booking flow; pass a query string to preselect. */
  to?: string
}

/** A button into the booking flow, which disappears along with it. */
export function BookingButton({ to = '/booking', ...props }: BookingButtonProps) {
  if (!bookingEnabled) return null
  return <LinkButton to={to} {...props} />
}
