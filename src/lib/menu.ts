import type { MenuGroup, MenuTag } from '@/types'

/* ------------------------------------------------------------------
   Menu presentation.

   Labels and formatting only — the dishes and prices come from the API.
   These stay in the bundle because they are part of the interface, not
   content a moderator edits.
------------------------------------------------------------------- */

export const menuGroups: { id: MenuGroup | 'all'; label: string }[] = [
  { id: 'all', label: 'სრული მენიუ' },
  { id: 'food', label: 'საჭმელი' },
  { id: 'drinks', label: 'სასმელი' },
]

export const menuTagLabels: Record<MenuTag, string> = {
  veg: 'ვეგეტარიანული',
  popular: 'ხშირად ირჩევენ',
}

/** Formats a price in GEL, or returns null when the venue has not set one. */
export const formatPrice = (price: number | null): string | null =>
  price === null ? null : `${price} ₾`
