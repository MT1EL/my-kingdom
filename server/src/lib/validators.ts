import { z } from 'zod'

/* ------------------------------------------------------------------
   Request validation.

   The site validates the same rules in `src/lib/validation.ts` so families
   get instant feedback — but the browser is not a trust boundary, so every
   rule is enforced again here. Messages are Georgian because the dashboard
   and the booking form both show them verbatim.
------------------------------------------------------------------- */

/** Georgian mobile numbers, with or without the +995 prefix and spacing. */
const PHONE_RE = /^(\+?995)?[\s-]?5\d{2}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}$/
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
/** Tailwind gradient pair, e.g. "from-royal-600 to-candy-500". */
const ACCENT_RE = /^from-[a-z0-9-]+ to-[a-z0-9-]+$/
/** A slug the dashboard can put in a URL. */
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,47}$/

export const normalisePhone = (value: string): string => value.replace(/[\s()-]/g, '')

export const isoDate = z.string().regex(ISO_DATE_RE, 'თარიღის ფორმატი: YYYY-MM-DD')
export const timeOfDay = z.string().regex(TIME_RE, 'დროის ფორმატი: HH:MM')
export const slug = z.string().regex(SLUG_RE, 'id უნდა შედგებოდეს ლათინური ასოებისა და დეფისისგან')
const accent = z.string().regex(ACCENT_RE, 'ფორმატი: "from-<ფერი> to-<ფერი>"')

/** Trimmed, non-empty text with an upper bound. */
const text = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label}: მინიმუმ ${min} სიმბოლო`)
    .max(max, `${label}: მაქსიმუმ ${max} სიმბოლო`)

/** Optional text where an empty string means "cleared". */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? null : value))
    .nullable()

/* ---------------------------- bookings --------------------------- */

/**
 * `maxChildren` comes from site settings, so the schema is built per request.
 * Ages and counts arrive as strings from the form and are coerced here.
 */
export const bookingRequestSchema = (maxChildren: number) =>
  z.object({
    date: isoDate,
    time: timeOfDay,
    programId: z.string().trim().min(1, 'აირჩიეთ პროგრამა'),
    extraIds: z.array(z.string().trim().min(1)).max(20).default([]),

    childName: text(2, 60, 'ბავშვის სახელი'),
    childAge: z.coerce
      .number()
      .int('ასაკი მთელი რიცხვი უნდა იყოს')
      .min(1, 'ასაკი უნდა იყოს 1-დან 17-მდე')
      .max(17, 'ასაკი უნდა იყოს 1-დან 17-მდე'),
    childrenCount: z.coerce
      .number()
      .int('რაოდენობა მთელი რიცხვი უნდა იყოს')
      .min(1, `რაოდენობა უნდა იყოს 1-დან ${maxChildren}-მდე`)
      .max(maxChildren, `რაოდენობა უნდა იყოს 1-დან ${maxChildren}-მდე`),

    parentName: text(2, 60, 'მშობლის სახელი'),
    phone: z
      .string()
      .trim()
      .refine((value) => PHONE_RE.test(normalisePhone(value)), 'ნომრის ფორმატი: 5XX XX XX XX'),
    email: z
      .string()
      .trim()
      .max(120)
      .refine(
        (value) => value === '' || z.email().safeParse(value).success,
        'ელფოსტის ფორმატი არასწორია',
      )
      .default(''),
    notes: z.string().trim().max(600, 'ტექსტი 600 სიმბოლოს არ უნდა აღემატებოდეს').default(''),
  })

export const bookingUpdateSchema = z.object({
  status: z.enum(['received', 'confirmed', 'declined', 'cancelled']).optional(),
  staffNote: z.string().trim().max(2000).optional(),
})

export const bookingQuerySchema = z.object({
  status: z.enum(['received', 'confirmed', 'declined', 'cancelled']).optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

/* ----------------------------- content --------------------------- */

/*
   Each resource is declared once as a base object, then exposed twice:
   `*Schema` for a create (everything required) and `*UpdateSchema` for a
   PATCH (everything optional). Keeping one source avoids the two drifting.
*/

const programBase = z.object({
  id: slug.optional(),
  title: text(2, 80, 'სათაური'),
  tagline: text(2, 120, 'ქვესათაური'),
  description: text(10, 1200, 'აღწერა'),
  ageMin: z.coerce.number().int().min(0).max(18),
  ageMax: z.coerce.number().int().min(0).max(18),
  durationMinutes: z.coerce.number().int().min(15).max(600),
  image: text(1, 500, 'სურათი'),
  highlights: z.array(text(1, 80, 'პუნქტი')).max(12).default([]),
  accent,
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  /** Left out on create → the factory appends the row to the end of the list. */
  sortOrder: z.coerce.number().int().min(0).optional(),
})

/** Only checked when both ends of the range are present. */
const ageRangeIsOrdered = (value: { ageMin?: number; ageMax?: number }): boolean =>
  value.ageMin === undefined || value.ageMax === undefined || value.ageMin <= value.ageMax

const ageRangeIssue = {
  message: 'მინიმალური ასაკი მაქსიმალურზე მეტი ვერ იქნება',
  path: ['ageMin'],
}

export const programSchema = programBase.refine(ageRangeIsOrdered, ageRangeIssue)
export const programUpdateSchema = programBase.partial().refine(ageRangeIsOrdered, ageRangeIssue)

const activityBase = z.object({
  id: slug.optional(),
  title: text(2, 80, 'სათაური'),
  description: text(5, 400, 'აღწერა'),
  icon: text(1, 40, 'აიკონი'),
  accent,
  published: z.boolean().default(true),
  /** Left out on create → the factory appends the row to the end of the list. */
  sortOrder: z.coerce.number().int().min(0).optional(),
})

export const activitySchema = activityBase
export const activityUpdateSchema = activityBase.partial()

const benefitBase = z.object({
  id: slug.optional(),
  title: text(2, 80, 'სათაური'),
  description: text(5, 400, 'აღწერა'),
  icon: text(1, 40, 'აიკონი'),
  published: z.boolean().default(true),
  /** Left out on create → the factory appends the row to the end of the list. */
  sortOrder: z.coerce.number().int().min(0).optional(),
})

export const benefitSchema = benefitBase
export const benefitUpdateSchema = benefitBase.partial()

const extraBase = z.object({
  id: slug.optional(),
  title: text(2, 80, 'სათაური'),
  description: text(5, 400, 'აღწერა'),
  icon: text(1, 40, 'აიკონი'),
  published: z.boolean().default(true),
  /** Left out on create → the factory appends the row to the end of the list. */
  sortOrder: z.coerce.number().int().min(0).optional(),
})

export const extraSchema = extraBase
export const extraUpdateSchema = extraBase.partial()

const menuCategoryBase = z.object({
  id: slug.optional(),
  group: z.enum(['food', 'drinks']),
  title: text(2, 80, 'სათაური'),
  description: text(5, 300, 'აღწერა'),
  icon: text(1, 40, 'აიკონი'),
  published: z.boolean().default(true),
  /** Left out on create → the factory appends the row to the end of the list. */
  sortOrder: z.coerce.number().int().min(0).optional(),
})

export const menuCategorySchema = menuCategoryBase
export const menuCategoryUpdateSchema = menuCategoryBase.partial()

const menuItemBase = z.object({
  id: slug.optional(),
  categoryId: z.string().trim().min(1, 'აირჩიეთ კატეგორია'),
  title: text(2, 80, 'დასახელება'),
  description: optionalText(300).default(null),
  /** null is meaningful — it renders "დასაზუსტებელია" instead of a number. */
  price: z.coerce.number().int().min(0).max(100000).nullable().default(null),
  unit: optionalText(40).default(null),
  tags: z.array(z.enum(['veg', 'popular'])).max(4).default([]),
  published: z.boolean().default(true),
  /** Left out on create → the factory appends the row to the end of the list. */
  sortOrder: z.coerce.number().int().min(0).optional(),
})

export const menuItemSchema = menuItemBase
export const menuItemUpdateSchema = menuItemBase.partial()

const galleryImageBase = z.object({
  id: slug.optional(),
  src: text(1, 500, 'სურათი'),
  alt: text(2, 200, 'აღწერა'),
  category: z.enum(['zeimi', 'aqtivobebi', 'dekoracia', 'photozona', 'torti']),
  span: z.enum(['normal', 'tall', 'wide']).default('normal'),
  published: z.boolean().default(true),
  /** Left out on create → the factory appends the row to the end of the list. */
  sortOrder: z.coerce.number().int().min(0).optional(),
})

export const galleryImageSchema = galleryImageBase
export const galleryImageUpdateSchema = galleryImageBase.partial()

const galleryCategoryBase = z.object({
  id: slug.optional(),
  label: text(1, 40, 'დასახელება'),
  published: z.boolean().default(true),
  /** Left out on create → the factory appends the row to the end of the list. */
  sortOrder: z.coerce.number().int().min(0).optional(),
})

export const galleryCategorySchema = galleryCategoryBase
export const galleryCategoryUpdateSchema = galleryCategoryBase.partial()

/* ------------------------- site settings ------------------------- */

export const siteSettingsSchema = z.object({
  name: text(1, 60, 'დასახელება'),
  nameLatin: text(1, 60, 'დასახელება (ლათინურად)'),
  tagline: text(1, 200, 'სლოგანი'),
  city: text(1, 60, 'ქალაქი'),

  phone: optionalText(40).default(null),
  phoneDisplay: optionalText(40).default(null),
  email: optionalText(120)
    .default(null)
    .refine(
      (value) => value === null || z.email().safeParse(value).success,
      'ელფოსტის ფორმატი არასწორია',
    ),
  address: optionalText(200).default(null),
  addressHint: z.string().trim().max(120).default(''),

  facebook: optionalText(300).default(null),
  instagram: optionalText(300).default(null),

  mapQuery: text(1, 200, 'რუკის მისამართი'),
  mapIsExact: z.boolean().default(false),
  mapZoom: z.coerce.number().int().min(1).max(21).default(12),

  priceNote: text(0, 600, 'ფასის შენიშვნა'),
  menuNotes: z.array(text(1, 300, 'შენიშვნა')).max(10).default([]),

  minLeadDays: z.coerce.number().int().min(0).max(60).default(1),
  maxAheadDays: z.coerce.number().int().min(7).max(730).default(90),
  maxChildren: z.coerce.number().int().min(1).max(500).default(40),

  openingHours: z
    .array(
      z.object({
        day: text(1, 60, 'დღე'),
        hours: optionalText(60).default(null),
      }),
    )
    .max(14)
    .default([]),
})

/* -------------------------- availability ------------------------- */

const scheduleSlotBase = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  time: timeOfDay,
  durationMinutes: z.coerce.number().int().min(15).max(600).default(120),
  published: z.boolean().default(true),
})

export const scheduleSlotSchema = scheduleSlotBase
export const scheduleSlotUpdateSchema = scheduleSlotBase.partial()

export const blackoutDateSchema = z.object({
  date: isoDate,
  reason: optionalText(200).default(null),
})

export const availabilityQuerySchema = z.object({
  from: isoDate,
  to: isoDate,
})

/* ------------------------------ auth ----------------------------- */

export const loginSchema = z.object({
  email: z.email('ელფოსტის ფორმატი არასწორია').trim().toLowerCase(),
  password: z.string().min(1, 'შეიყვანეთ პაროლი'),
})

export const createUserSchema = z.object({
  email: z.email('ელფოსტის ფორმატი არასწორია').trim().toLowerCase(),
  name: text(2, 60, 'სახელი'),
  password: z.string().min(10, 'პაროლი მინიმუმ 10 სიმბოლო უნდა იყოს').max(200),
  role: z.enum(['admin', 'moderator']).default('moderator'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'შეიყვანეთ მიმდინარე პაროლი'),
  newPassword: z.string().min(10, 'პაროლი მინიმუმ 10 სიმბოლო უნდა იყოს').max(200),
})

/** Body of the drag-and-drop reorder endpoint. */
export const reorderSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(500),
})
