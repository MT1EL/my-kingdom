/* ------------------------------------------------------------------
   Central site configuration.

   ⚠️  PLACEHOLDERS — everything marked `null` or wrapped in […] has to be
   replaced with the venue's real information before the site goes live.
   Nothing here is invented on purpose: fields we do not know are `null`,
   and the UI renders an honest "დასაზუსტებელია" chip instead of a fake
   phone number or address.
------------------------------------------------------------------- */

export interface OpeningHour {
  /** Georgian label for the day (or a day range). */
  day: string
  /** e.g. "11:00 – 20:00", or null while unknown. */
  hours: string | null
}

export const site = {
  name: 'ჩემი სამეფო',
  nameLatin: 'My Kingdom',
  tagline: 'ბავშვების დაბადების დღეების სივრცე თბილისში',
  city: 'თბილისი',

  /** null → the UI shows a "დასაზუსტებელია" placeholder instead of a dead link. */
  contact: {
    phone: null as string | null, // e.g. '+995 555 12 34 56'
    phoneDisplay: null as string | null, // e.g. '+995 555 12 34 56'
    email: null as string | null, // e.g. 'info@mykingdom.ge'
    /** Full street address. */
    address: null as string | null, // e.g. 'თბილისი, ვაჟა-ფშაველას გამზ. 00'
    addressHint: 'ზუსტი მისამართი დაზუსტდება',
  },

  /** Verified public page for the venue. */
  social: {
    facebook: 'https://www.facebook.com/mykingdommmm',
    instagram: null as string | null,
  },

  /**
   * Google Maps. Until the exact address is known we point at Tbilisi.
   * Replace `mapQuery` with the venue's address (or a Place ID) and both the
   * embedded map and the "მარშრუტი" button follow automatically.
   */
  map: {
    mapQuery: 'Tbilisi, Georgia',
    /** Set to true once `mapQuery` holds the venue's real address. */
    isExactLocation: false,
    zoom: 12,
  },

  openingHours: [
    { day: 'ორშაბათი – პარასკევი', hours: null },
    { day: 'შაბათი – კვირა', hours: null },
  ] as OpeningHour[],

  /** Shown wherever a visitor might expect a price. Never invent numbers. */
  priceNote:
    'პაკეტების ღირებულება დამოკიდებულია სტუმრების რაოდენობასა და არჩეულ პროგრამაზე — ზუსტ ფასს ჯავშნის დადასტურებისას გეტყვით.',

  /** How far ahead the booking calendar lets families plan. */
  booking: {
    minLeadDays: 1,
    maxAheadDays: 90,
    maxChildren: 40,
  },
} as const

export const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  site.map.mapQuery,
)}&z=${site.map.zoom}&output=embed`

export const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  site.map.mapQuery,
)}`

export const navLinks = [
  { to: '/', label: 'მთავარი' },
  { to: '/programs', label: 'პროგრამები' },
  { to: '/gallery', label: 'გალერეა' },
  { to: '/location', label: 'მდებარეობა' },
] as const
