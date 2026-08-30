/* ------------------------------------------------------------------
   Domain types shared by the public site, the API and the dashboard.

   This file is the contract between all three. It is type-only on purpose:
   it carries no runtime code, so the server can import from it across the
   package boundary without any build or module-resolution setup.

   The public site re-exports everything here from `src/types/index.ts`,
   so existing `@/types` imports keep working.
------------------------------------------------------------------- */

export type ISODate = `${number}-${number}-${number}` | string

/* ---------------------------- content ---------------------------- */

/** A birthday theme/programme the venue can run. */
export interface Program {
  id: string
  title: string
  tagline: string
  description: string
  /** Inclusive age range the programme is designed for. */
  ageMin: number
  ageMax: number
  /** Approximate duration in minutes — shown as a range hint, never as a promise. */
  durationMinutes: number
  image: string
  /** Short bullet list of what the programme includes. */
  highlights: string[]
  /** Tailwind gradient classes used for the card accent. */
  accent: string
  featured: boolean
}

/** Something the venue offers during a party (rendered with a Lucide icon). */
export interface Activity {
  id: string
  title: string
  description: string
  /** Name of a lucide-react icon export. */
  icon: string
  accent: string
}

/** Optional add-on chosen in step 4 of the booking flow. */
export interface Extra {
  id: string
  title: string
  description: string
  icon: string
}

/** A promise the venue makes, shown in the "why us" section. */
export interface Benefit {
  id: string
  title: string
  description: string
  icon: string
}

export type GalleryCategory = 'zeimi' | 'aqtivobebi' | 'dekoracia' | 'photozona' | 'torti'

export interface GalleryImage {
  id: string
  src: string
  alt: string
  category: GalleryCategory
  /** Layout hint for the masonry grid. */
  span: 'tall' | 'wide' | 'normal'
}

export interface GalleryCategoryOption {
  id: GalleryCategory | 'all'
  label: string
}

/** Top-level split of the menu page. */
export type MenuGroup = 'food' | 'drinks'

/** Small badge shown next to a menu item. */
export type MenuTag = 'veg' | 'popular'

/** One dish or drink on the menu. */
export interface MenuItem {
  id: string
  title: string
  description?: string
  /** Price in GEL, or null while the venue has not confirmed it. */
  price: number | null
  /** What the price covers, e.g. "6 ცალი", "1 ბავშვი", "1 ლ". */
  unit?: string
  tags: MenuTag[]
}

/** A section of the menu (starters, pizza, cold drinks …). */
export interface MenuCategory {
  id: string
  group: MenuGroup
  title: string
  description: string
  /** Name of a lucide-react icon registered in `components/ui/Icon`. */
  icon: string
  items: MenuItem[]
}

/* ------------------------- site settings ------------------------- */

export interface OpeningHour {
  /** Georgian label for the day (or a day range). */
  day: string
  /** e.g. "11:00 – 20:00", or null while unknown. */
  hours: string | null
}

/**
 * Everything the venue can change about itself.
 * `null` means "not supplied yet" — the UI renders an honest
 * "დასაზუსტებელია" chip rather than inventing a value.
 */
export interface SiteConfig {
  name: string
  nameLatin: string
  tagline: string
  city: string
  contact: {
    phone: string | null
    phoneDisplay: string | null
    email: string | null
    address: string | null
    addressHint: string
  }
  social: {
    facebook: string | null
    instagram: string | null
  }
  map: {
    mapQuery: string
    /** True once `mapQuery` holds the venue's real address. */
    isExactLocation: boolean
    zoom: number
  }
  openingHours: OpeningHour[]
  /** Shown wherever a visitor might expect a price. Never invent numbers. */
  priceNote: string
  booking: {
    minLeadDays: number
    maxAheadDays: number
    maxChildren: number
  }
  /** Notes shown under the menu, so no visitor reads it as a fixed contract. */
  menuNotes: string[]
}

/** One request to `GET /api/content` returns the whole public site. */
export interface ContentBundle {
  site: SiteConfig
  programs: Program[]
  activities: Activity[]
  benefits: Benefit[]
  extras: Extra[]
  menu: MenuCategory[]
  gallery: GalleryImage[]
  galleryCategories: GalleryCategoryOption[]
}

/* -------------------------- availability ------------------------- */

/** One bookable slot returned by the availability source. */
export interface TimeSlot {
  /** 24h "HH:MM" start time. */
  time: string
  /** Human label, e.g. "12:00 – 14:00". */
  label: string
  available: boolean
}

export interface DayAvailability {
  date: ISODate
  /** False when the venue is closed that day. */
  open: boolean
  slots: TimeSlot[]
}

/** A recurring opening slot: "every Saturday at 11:00". */
export interface ScheduleSlot {
  id: string
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number
  /** 24h "HH:MM". */
  time: string
  durationMinutes: number
}

/** A specific date the venue is closed (holiday, private hire, repairs). */
export interface BlackoutDate {
  id: string
  date: ISODate
  reason: string | null
}

/* ---------------------------- bookings --------------------------- */

export interface BookingDraft {
  date: ISODate | null
  time: string | null
  programId: string | null
  extraIds: string[]
  childName: string
  childAge: string
  childrenCount: string
  parentName: string
  phone: string
  email: string
  notes: string
}

export interface BookingRequest extends Omit<BookingDraft, 'date' | 'time' | 'programId'> {
  date: ISODate
  time: string
  programId: string
}

/** What the API returns after a booking request is submitted. */
export interface BookingRequestResult {
  /** Reference the family can quote when the venue calls back. */
  reference: string
  status: 'received'
  submittedAt: string
}

/**
 * Lifecycle of a request.
 * Only `confirmed` holds the slot — that is what removes it from availability.
 */
export type BookingStatus = 'received' | 'confirmed' | 'declined' | 'cancelled'

/** A booking as the dashboard sees it. */
export interface Booking {
  id: string
  reference: string
  date: ISODate
  time: string
  programId: string | null
  extraIds: string[]
  childName: string
  childAge: number
  childrenCount: number
  parentName: string
  phone: string
  email: string | null
  notes: string
  status: BookingStatus
  /** Private note the venue adds while handling the request. */
  staffNote: string
  createdAt: string
  updatedAt: string
}

/* ------------------------------ auth ----------------------------- */

export type UserRole = 'admin' | 'moderator'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

/* ----------------------------- errors ---------------------------- */

/** Every non-2xx response from the API has this shape. */
export interface ApiErrorBody {
  error: {
    code: string
    message: string
    /** Per-field messages, when the failure was a validation error. */
    fields?: Record<string, string>
  }
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>
