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
import { ICON_NAMES } from '@shared/icons'

/**
 * Icons referenced by name from the API.
 *
 * This map must cover every entry in `ICON_NAMES` (shared/icons.ts) — that
 * is the list the dashboard's icon picker offers, so a name a moderator can
 * choose and a name the site can draw have to be the same set. The explicit
 * imports keep the bundle from pulling in the whole icon library.
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

if (import.meta.env?.DEV) {
  const missing = ICON_NAMES.filter((name) => !(name in registry))
  if (missing.length > 0) {
    console.warn(`[mykingdom] icons offered by the dashboard but missing here: ${missing.join(', ')}`)
  }
}

interface IconProps extends LucideProps {
  /** Name of an icon registered above, as stored in the database. */
  name: string
}

export function Icon({ name, ...props }: IconProps) {
  const Component = registry[name] ?? Sparkles
  return <Component {...props} />
}
