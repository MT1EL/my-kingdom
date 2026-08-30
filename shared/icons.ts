/* ------------------------------------------------------------------
   Icons a moderator can choose from.

   These are `lucide-react` export names. The public site maps each one to
   a real component in `src/components/ui/Icon.tsx`; that map must contain
   every name listed here, or the site falls back to a generic sparkle.

   Adding an icon means adding it in both places.
------------------------------------------------------------------- */

export const ICON_NAMES = [
  'Armchair',
  'Baby',
  'Cake',
  'CalendarCheck',
  'Camera',
  'Candy',
  'Coffee',
  'Cookie',
  'CupSoda',
  'Dices',
  'Disc3',
  'Drama',
  'Droplets',
  'Gamepad2',
  'Gift',
  'Heart',
  'IceCreamCone',
  'MicVocal',
  'Music',
  'Palette',
  'PartyPopper',
  'Pizza',
  'Popcorn',
  'Salad',
  'Sandwich',
  'ShieldCheck',
  'Sparkles',
  'Star',
  'Trophy',
  'Users',
  'UtensilsCrossed',
  'Wand2',
] as const

export type IconName = (typeof ICON_NAMES)[number]

/* ------------------------------------------------------------------
   Card accents.

   Tailwind gradient pairs. They are written out in full rather than built
   from parts because Tailwind only ships classes it can see in the source.
------------------------------------------------------------------- */

export const ACCENTS = [
  { value: 'from-royal-500 to-royal-700', label: 'იისფერი' },
  { value: 'from-royal-600 to-candy-500', label: 'იისფერი — ვარდისფერი' },
  { value: 'from-royal-700 to-candy-500', label: 'მუქი იისფერი — ვარდისფერი' },
  { value: 'from-royal-800 to-candy-600', label: 'ღამისფერი — ფუქსია' },
  { value: 'from-royal-600 to-mint-500', label: 'იისფერი — ზურმუხტი' },
  { value: 'from-royal-700 to-royal-500', label: 'იისფერი გრადიენტი' },
  { value: 'from-royal-600 to-sun-500', label: 'იისფერი — ოქროსფერი' },
  { value: 'from-royal-500 to-candy-600', label: 'ღია იისფერი — ფუქსია' },
  { value: 'from-candy-500 to-royal-600', label: 'ვარდისფერი — იისფერი' },
  { value: 'from-candy-500 to-candy-700', label: 'ვარდისფერი' },
  { value: 'from-candy-600 to-royal-500', label: 'ფუქსია — იისფერი' },
  { value: 'from-candy-600 to-sun-500', label: 'ფუქსია — ოქროსფერი' },
  { value: 'from-candy-400 to-sun-400', label: 'ვარდისფერი — მზისფერი' },
  { value: 'from-sun-400 to-candy-500', label: 'მზისფერი — ვარდისფერი' },
  { value: 'from-sun-400 to-candy-600', label: 'მზისფერი — ფუქსია' },
  { value: 'from-sun-500 to-candy-500', label: 'ოქროსფერი — ვარდისფერი' },
  { value: 'from-mint-500 to-royal-600', label: 'ზურმუხტი — იისფერი' },
  { value: 'from-mint-400 to-royal-500', label: 'ღია ზურმუხტი — იისფერი' },
] as const
