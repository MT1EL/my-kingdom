import { asc, eq } from 'drizzle-orm'
import { Router } from 'express'
import { db, schema } from '../db/client.ts'
import { ApiError, route } from '../lib/http.ts'
import {
  toActivity,
  toBenefit,
  toExtra,
  toGalleryImage,
  toMenuCategory,
  toMenuItem,
  toOpeningHour,
  toProgram,
  toSiteConfig,
} from '../lib/serialize.ts'
import type { ContentBundle, GalleryCategoryOption } from '../../../shared/types.ts'

/* ------------------------------------------------------------------
   Public content.

   The whole site is one request. It is a few kilobytes of JSON, and one
   round trip at boot beats six — the pages have no reason to load at
   different times, and a single payload cannot render half-updated.

   Only published rows are ever returned here; the dashboard reads drafts
   through the admin routes instead.
------------------------------------------------------------------- */

export const contentRouter: Router = Router()

export async function loadContentBundle(): Promise<ContentBundle> {
  const [
    settingsRows,
    hourRows,
    programRows,
    activityRows,
    benefitRows,
    extraRows,
    menuCategoryRows,
    menuItemRows,
    galleryRows,
    galleryCategoryRows,
  ] = await Promise.all([
    db.select().from(schema.siteSettings).limit(1),
    db.select().from(schema.openingHours).orderBy(asc(schema.openingHours.sortOrder)),
    db
      .select()
      .from(schema.programs)
      .where(eq(schema.programs.published, true))
      .orderBy(asc(schema.programs.sortOrder)),
    db
      .select()
      .from(schema.activities)
      .where(eq(schema.activities.published, true))
      .orderBy(asc(schema.activities.sortOrder)),
    db
      .select()
      .from(schema.benefits)
      .where(eq(schema.benefits.published, true))
      .orderBy(asc(schema.benefits.sortOrder)),
    db
      .select()
      .from(schema.extras)
      .where(eq(schema.extras.published, true))
      .orderBy(asc(schema.extras.sortOrder)),
    db
      .select()
      .from(schema.menuCategories)
      .where(eq(schema.menuCategories.published, true))
      .orderBy(asc(schema.menuCategories.sortOrder)),
    db
      .select()
      .from(schema.menuItems)
      .where(eq(schema.menuItems.published, true))
      .orderBy(asc(schema.menuItems.sortOrder)),
    db
      .select()
      .from(schema.galleryImages)
      .where(eq(schema.galleryImages.published, true))
      .orderBy(asc(schema.galleryImages.sortOrder)),
    db
      .select()
      .from(schema.galleryCategories)
      .where(eq(schema.galleryCategories.published, true))
      .orderBy(asc(schema.galleryCategories.sortOrder)),
  ])

  const settings = settingsRows[0]
  if (!settings) {
    // Only happens on an unseeded database — a clear message beats a 500.
    throw new ApiError(
      503,
      'NOT_SEEDED',
      'საიტის მონაცემები ჯერ არ არის ინიციალიზებული (გაუშვით `npm run seed`).',
    )
  }

  const itemsByCategory = new Map<string, ReturnType<typeof toMenuItem>[]>()
  for (const row of menuItemRows) {
    const list = itemsByCategory.get(row.categoryId) ?? []
    list.push(toMenuItem(row))
    itemsByCategory.set(row.categoryId, list)
  }

  const galleryCategories: GalleryCategoryOption[] = [
    { id: 'all', label: 'ყველა' },
    ...galleryCategoryRows.map((row) => ({
      id: row.id as GalleryCategoryOption['id'],
      label: row.label,
    })),
  ]

  return {
    site: toSiteConfig(settings, hourRows.map(toOpeningHour)),
    programs: programRows.map(toProgram),
    activities: activityRows.map(toActivity),
    benefits: benefitRows.map(toBenefit),
    extras: extraRows.map(toExtra),
    menu: menuCategoryRows.map((row) => toMenuCategory(row, itemsByCategory.get(row.id) ?? [])),
    gallery: galleryRows.map(toGalleryImage),
    galleryCategories,
  }
}

contentRouter.get(
  '/content',
  route(async (_req, res) => {
    const bundle = await loadContentBundle()
    // Short cache: a moderator's edit should show up within a minute, but a
    // burst of visitors should not each hit the database.
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=300')
    res.json(bundle)
  }),
)
