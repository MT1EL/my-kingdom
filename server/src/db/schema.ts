import {
  boolean,
  customType,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

/* ------------------------------------------------------------------
   Database schema (PostgreSQL).

   Conventions used throughout:
   - `id` is a text slug for content the dashboard reorders and links to
     (programs, menu items …) and a random id for rows nobody links to.
   - Lists that have no table of their own (highlights, tags) are stored as
     JSON text and parsed at the serialisation boundary in `lib/serialize.ts`.
   - `sortOrder` drives display order; the dashboard writes it on drag-drop.
   - `published` lets a moderator hide something without deleting it.
   - Timestamps are ISO-8601 strings in UTC. Stored as text rather than
     `timestamptz` so the value a client reads back is byte-for-byte the one
     the API wrote, with no driver-level timezone conversion in between.
------------------------------------------------------------------- */

/** Raw bytes. Drizzle has no built-in bytea, and image data needs one. */
export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea'
  },
})

const nowISO = () => new Date().toISOString()

/** Columns every content table carries. */
const contentColumns = {
  sortOrder: integer('sort_order').notNull().default(0),
  published: boolean('published').notNull().default(true),
  createdAt: text('created_at').notNull().$defaultFn(nowISO),
  updatedAt: text('updated_at').notNull().$defaultFn(nowISO),
}

/* ---------------------------- content ---------------------------- */

export const programs = pgTable(
  'programs',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    tagline: text('tagline').notNull(),
    description: text('description').notNull(),
    ageMin: integer('age_min').notNull(),
    ageMax: integer('age_max').notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
    image: text('image').notNull(),
    /** JSON array of strings. */
    highlights: text('highlights').notNull().default('[]'),
    accent: text('accent').notNull(),
    featured: boolean('featured').notNull().default(false),
    ...contentColumns,
  },
  (table) => [index('programs_sort_idx').on(table.sortOrder)],
)

export const activities = pgTable(
  'activities',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    icon: text('icon').notNull(),
    accent: text('accent').notNull(),
    ...contentColumns,
  },
  (table) => [index('activities_sort_idx').on(table.sortOrder)],
)

export const benefits = pgTable(
  'benefits',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    icon: text('icon').notNull(),
    ...contentColumns,
  },
  (table) => [index('benefits_sort_idx').on(table.sortOrder)],
)

export const extras = pgTable(
  'extras',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    icon: text('icon').notNull(),
    ...contentColumns,
  },
  (table) => [index('extras_sort_idx').on(table.sortOrder)],
)

export const menuCategories = pgTable(
  'menu_categories',
  {
    id: text('id').primaryKey(),
    /** 'food' | 'drinks' */
    group: text('group_name').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    icon: text('icon').notNull(),
    ...contentColumns,
  },
  (table) => [index('menu_categories_sort_idx').on(table.sortOrder)],
)

export const menuItems = pgTable(
  'menu_items',
  {
    id: text('id').primaryKey(),
    categoryId: text('category_id')
      .notNull()
      .references(() => menuCategories.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    /** Price in GEL. NULL is meaningful: "დასაზუსტებელია". */
    price: integer('price'),
    unit: text('unit'),
    /** JSON array of MenuTag. */
    tags: text('tags').notNull().default('[]'),
    ...contentColumns,
  },
  (table) => [index('menu_items_category_idx').on(table.categoryId, table.sortOrder)],
)

export const galleryCategories = pgTable(
  'gallery_categories',
  {
    id: text('id').primaryKey(),
    label: text('label').notNull(),
    ...contentColumns,
  },
  (table) => [index('gallery_categories_sort_idx').on(table.sortOrder)],
)

export const galleryImages = pgTable(
  'gallery_images',
  {
    id: text('id').primaryKey(),
    src: text('src').notNull(),
    alt: text('alt').notNull(),
    category: text('category').notNull(),
    /** 'tall' | 'wide' | 'normal' */
    span: text('span').notNull().default('normal'),
    ...contentColumns,
  },
  (table) => [index('gallery_images_sort_idx').on(table.sortOrder)],
)

/* ------------------------- site settings ------------------------- */

/** Single-row table. Always id = 1. */
export const siteSettings = pgTable('site_settings', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  nameLatin: text('name_latin').notNull(),
  tagline: text('tagline').notNull(),
  city: text('city').notNull(),

  phone: text('phone'),
  phoneDisplay: text('phone_display'),
  email: text('email'),
  address: text('address'),
  addressHint: text('address_hint').notNull(),

  facebook: text('facebook'),
  instagram: text('instagram'),

  mapQuery: text('map_query').notNull(),
  mapIsExact: boolean('map_is_exact').notNull().default(false),
  mapZoom: integer('map_zoom').notNull().default(12),

  priceNote: text('price_note').notNull(),
  /** JSON array of strings. */
  menuNotes: text('menu_notes').notNull().default('[]'),

  minLeadDays: integer('min_lead_days').notNull().default(1),
  maxAheadDays: integer('max_ahead_days').notNull().default(90),
  maxChildren: integer('max_children').notNull().default(40),

  updatedAt: text('updated_at').notNull().$defaultFn(nowISO),
})

export const openingHours = pgTable(
  'opening_hours',
  {
    id: text('id').primaryKey(),
    day: text('day').notNull(),
    hours: text('hours'),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [index('opening_hours_sort_idx').on(table.sortOrder)],
)

/* -------------------------- availability ------------------------- */

/** The venue's recurring weekly pattern. No rows for a weekday = closed. */
export const scheduleSlots = pgTable(
  'schedule_slots',
  {
    id: text('id').primaryKey(),
    /** 0 = Sunday … 6 = Saturday. */
    weekday: integer('weekday').notNull(),
    /** 24h "HH:MM". */
    time: text('time').notNull(),
    durationMinutes: integer('duration_minutes').notNull().default(120),
    ...contentColumns,
  },
  (table) => [uniqueIndex('schedule_slots_weekday_time_idx').on(table.weekday, table.time)],
)

/** One-off closures that override the weekly pattern. */
export const blackoutDates = pgTable(
  'blackout_dates',
  {
    id: text('id').primaryKey(),
    date: text('date').notNull(),
    reason: text('reason'),
    createdAt: text('created_at').notNull().$defaultFn(nowISO),
  },
  (table) => [uniqueIndex('blackout_dates_date_idx').on(table.date)],
)

/* ---------------------------- bookings --------------------------- */

export const bookings = pgTable(
  'bookings',
  {
    id: text('id').primaryKey(),
    reference: text('reference').notNull(),
    date: text('date').notNull(),
    time: text('time').notNull(),
    /** Kept even if the programme is later deleted, so history stays readable. */
    programId: text('program_id'),
    /** JSON array of extra ids. */
    extraIds: text('extra_ids').notNull().default('[]'),

    childName: text('child_name').notNull(),
    childAge: integer('child_age').notNull(),
    childrenCount: integer('children_count').notNull(),
    parentName: text('parent_name').notNull(),
    phone: text('phone').notNull(),
    email: text('email'),
    notes: text('notes').notNull().default(''),

    /** 'received' | 'confirmed' | 'declined' | 'cancelled' */
    status: text('status').notNull().default('received'),
    /** Private to the venue; never returned by a public endpoint. */
    staffNote: text('staff_note').notNull().default(''),

    createdAt: text('created_at').notNull().$defaultFn(nowISO),
    updatedAt: text('updated_at').notNull().$defaultFn(nowISO),
  },
  (table) => [
    uniqueIndex('bookings_reference_idx').on(table.reference),
    index('bookings_date_idx').on(table.date, table.time),
    index('bookings_status_idx').on(table.status),
  ],
)

/* ------------------------------ auth ----------------------------- */

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    /** 'admin' | 'moderator' */
    role: text('role').notNull().default('moderator'),
    createdAt: text('created_at').notNull().$defaultFn(nowISO),
  },
  (table) => [uniqueIndex('users_email_idx').on(table.email)],
)

/** Server-side sessions. The id is a hash of the token in the cookie. */
export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').notNull().$defaultFn(nowISO),
  },
  (table) => [index('sessions_user_idx').on(table.userId)],
)

/* ---------------------------- uploads ---------------------------- */

/** One row per uploaded photo, for the dashboard's media library. */
export const uploads = pgTable('uploads', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  /** Public path of the largest rendition. */
  url: text('url').notNull(),
  /** JSON map of width → public URL. */
  renditions: text('renditions').notNull().default('{}'),
  /**
   * What the storage driver needs in order to delete the photo later: a
   * filename prefix for the disk and database drivers, a public_id on
   * Cloudinary.
   */
  storageKey: text('storage_key'),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  bytes: integer('bytes').notNull(),
  uploadedBy: text('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull().$defaultFn(nowISO),
})

/**
 * The image bytes themselves, one row per rendition.
 *
 * Render's free tier has no disk and no object storage, so photos live here
 * and the API serves them from `/uploads/:file`. At three WebP widths a
 * photo costs roughly 370 kB, so a 1 GB database holds thousands — far more
 * than a venue gallery will ever need.
 */
export const imageFiles = pgTable(
  'image_files',
  {
    /** Filename, e.g. "a1b2c3d4-800.webp". This is the public URL segment. */
    id: text('id').primaryKey(),
    /** Groups the renditions of one photo, so deleting removes all of them. */
    storageKey: text('storage_key').notNull(),
    contentType: text('content_type').notNull().default('image/webp'),
    width: integer('width').notNull(),
    bytes: integer('bytes').notNull(),
    data: bytea('data').notNull(),
    createdAt: text('created_at').notNull().$defaultFn(nowISO),
  },
  (table) => [index('image_files_key_idx').on(table.storageKey)],
)
