import {
  Armchair,
  Cake,
  CalendarCheck,
  Camera,
  Disc3,
  Dices,
  Droplets,
  Gamepad2,
  Gift,
  MicVocal,
  Palette,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Users,
  UtensilsCrossed,
  Wand2,
  type LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'

/**
 * Icons referenced by name from the data files.
 * Add an entry here when a data file starts using a new Lucide icon —
 * the explicit map keeps the bundle from pulling in the whole icon set.
 */
const registry: Record<string, ComponentType<LucideProps>> = {
  Armchair,
  Cake,
  CalendarCheck,
  Camera,
  Dices,
  Disc3,
  Droplets,
  Gamepad2,
  Gift,
  MicVocal,
  Palette,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Users,
  UtensilsCrossed,
  Wand2,
}

interface IconProps extends LucideProps {
  /** Name of an icon registered above, as stored in the data files. */
  name: string
}

export function Icon({ name, ...props }: IconProps) {
  const Component = registry[name] ?? Sparkles
  return <Component {...props} />
}
