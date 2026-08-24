/** Domain types shared across the app. */

export type ISODate = `${number}-${number}-${number}` | string

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
  featured?: boolean
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

export type GalleryCategory =
  | 'zeimi'
  | 'aqtivobebi'
  | 'dekoracia'
  | 'photozona'
  | 'torti'

export interface GalleryImage {
  id: string
  src: string
  alt: string
  category: GalleryCategory
  /** Layout hint for the masonry grid. */
  span?: 'tall' | 'wide' | 'normal'
}

export interface GalleryCategoryOption {
  id: GalleryCategory | 'all'
  label: string
}

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

/** Optional add-on chosen in step 4 of the booking flow. */
export interface Extra {
  id: string
  title: string
  description: string
  icon: string
}

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

/** What the (currently mocked) API returns after a request is submitted. */
export interface BookingRequestResult {
  /** Reference the family can quote when the venue calls back. */
  reference: string
  status: 'received'
  submittedAt: string
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>
