import { asc, eq } from 'drizzle-orm'
import { Router } from 'express'
import { db, schema } from '../../db/client.ts'
import { ApiError, route } from '../../lib/http.ts'
import { newId } from '../../lib/ids.ts'
import { toOpeningHour, toSiteConfig } from '../../lib/serialize.ts'
import { siteSettingsSchema } from '../../lib/validators.ts'

/* ------------------------------------------------------------------
   Site settings — name, contacts, map, opening hours, booking window.

   A single row plus a small ordered list of opening hours. The hours are
   replaced wholesale on save rather than diffed: the dashboard edits them
   as one list, and there are never more than a handful of rows.
------------------------------------------------------------------- */

export const settingsRouter: Router = Router()

const SETTINGS_ID = 1

async function readSettings() {
  const [rows, hours] = await Promise.all([
    db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, SETTINGS_ID)).limit(1),
    db.select().from(schema.openingHours).orderBy(asc(schema.openingHours.sortOrder)),
  ])

  const settings = rows[0]
  if (!settings) {
    throw new ApiError(503, 'NOT_SEEDED', 'საიტის მონაცემები ჯერ არ არის ინიციალიზებული.')
  }

  return toSiteConfig(settings, hours.map(toOpeningHour))
}

settingsRouter.get(
  '/',
  route(async (_req, res) => {
    res.json(await readSettings())
  }),
)

settingsRouter.put(
  '/',
  route(async (req, res) => {
    const input = siteSettingsSchema.parse(req.body)

    await db.transaction(async (tx) => {
      await tx
        .update(schema.siteSettings)
        .set({
          name: input.name,
          nameLatin: input.nameLatin,
          tagline: input.tagline,
          city: input.city,
          phone: input.phone,
          phoneDisplay: input.phoneDisplay,
          email: input.email,
          address: input.address,
          addressHint: input.addressHint,
          facebook: input.facebook,
          instagram: input.instagram,
          mapQuery: input.mapQuery,
          mapIsExact: input.mapIsExact,
          mapZoom: input.mapZoom,
          priceNote: input.priceNote,
          menuNotes: JSON.stringify(input.menuNotes),
          minLeadDays: input.minLeadDays,
          maxAheadDays: input.maxAheadDays,
          maxChildren: input.maxChildren,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.siteSettings.id, SETTINGS_ID))

      await tx.delete(schema.openingHours)
      if (input.openingHours.length > 0) {
        await tx.insert(schema.openingHours).values(
          input.openingHours.map((entry, index) => ({
            id: newId(),
            day: entry.day,
            hours: entry.hours,
            sortOrder: index,
          })),
        )
      }
    })

    res.json(await readSettings())
  }),
)
