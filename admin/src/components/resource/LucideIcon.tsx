import {
  Armchair,
  Baby,
  Cake,
  CalendarCheck,
  Camera,
  Candy,
  Coffee,
  Cookie,
  CupSoda,
  Dices,
  Disc3,
  Drama,
  Droplets,
  Gamepad2,
  Gift,
  Heart,
  IceCreamCone,
  MicVocal,
  Music,
  Palette,
  PartyPopper,
  Pizza,
  Popcorn,
  Salad,
  Sandwich,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  UtensilsCrossed,
  Wand2,
  type LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { IconName } from '@shared/icons'

/**
 * Icons the picker offers, imported explicitly.
 *
 * A namespace import (`import * as Lucide`) would pull the entire icon set
 * into the bundle — around 900kB. Listing them keeps the dashboard small,
 * and mirrors what the public site does in `src/components/ui/Icon.tsx`.
 *
 * This map must cover every name in `ICON_NAMES`.
 */
const registry: Record<string, ComponentType<LucideProps>> = {
  Armchair,
  Baby,
  Cake,
  CalendarCheck,
  Camera,
  Candy,
  Coffee,
  Cookie,
  CupSoda,
  Dices,
  Disc3,
  Drama,
  Droplets,
  Gamepad2,
  Gift,
  Heart,
  IceCreamCone,
  MicVocal,
  Music,
  Palette,
  PartyPopper,
  Pizza,
  Popcorn,
  Salad,
  Sandwich,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  UtensilsCrossed,
  Wand2,
}

export function LucideIcon({ name, className }: { name: string; className?: string }) {
  const Component = registry[name] ?? Sparkles
  return <Component className={className} />
}

export type { IconName }
