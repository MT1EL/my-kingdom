import type {
  Activity,
  Benefit,
  Booking,
  BookingStatus,
  Extra,
  GalleryCategory,
  GalleryImage,
  MenuCategory,
  MenuGroup,
  MenuItem,
  MenuTag,
  OpeningHour,
  Program,
  SiteConfig,
  User,
} from '../../../shared/types.ts'
import type { schema } from '../db/client.ts'

/* ------------------------------------------------------------------
   Row → API shape.

   The only place that knows a `highlights` column is JSON text, or that
   `published` exists at all. Routes return these types, never raw rows,
   so a column rename never leaks into the API contract.
------------------------------------------------------------------- */

type Row<T extends { $inferSelect: unknown }> = T['$inferSelect']

/** Parses a JSON column, falling back rather than throwing on bad data. */
function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

const parseStringArray = (value: string | null | undefined): string[] => {
  const parsed = parseJson<unknown>(value, [])
  return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string') : []
}

export function toProgram(row: Row<typeof schema.programs>): Program {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    ageMin: row.ageMin,
    ageMax: row.ageMax,
    durationMinutes: row.durationMinutes,
    image: row.image,
    highlights: parseStringArray(row.highlights),
    accent: row.accent,
    featured: row.featured,
  }
}

export function toActivity(row: Row<typeof schema.activities>): Activity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    accent: row.accent,
  }
}

export function toBenefit(row: Row<typeof schema.benefits>): Benefit {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
  }
}

export function toExtra(row: Row<typeof schema.extras>): Extra {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
  }
}

const MENU_TAGS: MenuTag[] = ['veg', 'popular']

export function toMenuItem(row: Row<typeof schema.menuItems>): MenuItem {
  const tags = parseStringArray(row.tags).filter((tag): tag is MenuTag =>
    (MENU_TAGS as string[]).includes(tag),
  )

  return {
    id: row.id,
    title: row.title,
    ...(row.description ? { description: row.description } : {}),
    price: row.price ?? null,
    ...(row.unit ? { unit: row.unit } : {}),
    tags,
  }
}

export function toMenuCategory(
  row: Row<typeof schema.menuCategories>,
  items: MenuItem[],
): MenuCategory {
  return {
    id: row.id,
    group: (row.group === 'drinks' ? 'drinks' : 'food') satisfies MenuGroup,
    title: row.title,
    description: row.description,
    icon: row.icon,
    items,
  }
}

export function toGalleryImage(row: Row<typeof schema.galleryImages>): GalleryImage {
  const span = row.span === 'tall' || row.span === 'wide' ? row.span : 'normal'
  return {
    id: row.id,
    src: row.src,
    alt: row.alt,
    category: row.category as GalleryCategory,
    span,
  }
}

export function toOpeningHour(row: Row<typeof schema.openingHours>): OpeningHour {
  return { day: row.day, hours: row.hours ?? null }
}

export function toSiteConfig(
  row: Row<typeof schema.siteSettings>,
  hours: OpeningHour[],
): SiteConfig {
  return {
    name: row.name,
    nameLatin: row.nameLatin,
    tagline: row.tagline,
    city: row.city,
    contact: {
      phone: row.phone ?? null,
      phoneDisplay: row.phoneDisplay ?? null,
      email: row.email ?? null,
      address: row.address ?? null,
      addressHint: row.addressHint,
    },
    social: {
      facebook: row.facebook ?? null,
      instagram: row.instagram ?? null,
    },
    map: {
      mapQuery: row.mapQuery,
      isExactLocation: row.mapIsExact,
      zoom: row.mapZoom,
    },
    openingHours: hours,
    priceNote: row.priceNote,
    booking: {
      minLeadDays: row.minLeadDays,
      maxAheadDays: row.maxAheadDays,
      maxChildren: row.maxChildren,
    },
    menuNotes: parseStringArray(row.menuNotes),
  }
}

const BOOKING_STATUSES: BookingStatus[] = ['received', 'confirmed', 'declined', 'cancelled']

export function toBooking(row: Row<typeof schema.bookings>): Booking {
  const status = (BOOKING_STATUSES as string[]).includes(row.status)
    ? (row.status as BookingStatus)
    : 'received'

  return {
    id: row.id,
    reference: row.reference,
    date: row.date,
    time: row.time,
    programId: row.programId ?? null,
    extraIds: parseStringArray(row.extraIds),
    childName: row.childName,
    childAge: row.childAge,
    childrenCount: row.childrenCount,
    parentName: row.parentName,
    phone: row.phone,
    email: row.email ?? null,
    notes: row.notes,
    status,
    staffNote: row.staffNote,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/** Never includes `passwordHash` — that column must not leave the server. */
export function toUser(row: Row<typeof schema.users>): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role === 'admin' ? 'admin' : 'moderator',
    createdAt: row.createdAt,
  }
}
