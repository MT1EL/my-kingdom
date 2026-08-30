import { migrate } from 'drizzle-orm/libsql/migrator'
import path from 'node:path'
import { client, db } from './client.ts'
import { env, SERVER_ROOT } from '../env.ts'
import { newId } from '../lib/ids.ts'
import { hashPassword } from '../lib/password.ts'
import * as data from './seed-data.ts'
import * as schema from './schema.ts'

/* ------------------------------------------------------------------
   Applies migrations, then fills an empty database with the site's
   starting content and the first dashboard account.

     npm run seed          — safe to re-run; skips tables that have rows
     npm run seed:reset    — wipes content first (bookings are kept)

   Bookings and users are never touched by `--reset`: losing a family's
   request to a stray flag would be unrecoverable.
------------------------------------------------------------------- */

const reset = process.argv.includes('--reset')

/** Number of rows in a table, used to decide whether to seed it. */
async function count(table: Parameters<typeof db.$count>[0]): Promise<number> {
  return db.$count(table)
}

async function seedContent(): Promise<void> {
  if (reset) {
    console.log('  · clearing existing content')
    // Order matters: menu items reference their category.
    await db.delete(schema.menuItems)
    await db.delete(schema.menuCategories)
    await db.delete(schema.galleryImages)
    await db.delete(schema.galleryCategories)
    await db.delete(schema.programs)
    await db.delete(schema.activities)
    await db.delete(schema.benefits)
    await db.delete(schema.extras)
    await db.delete(schema.scheduleSlots)
    await db.delete(schema.openingHours)
    await db.delete(schema.siteSettings)
  }

  if ((await count(schema.siteSettings)) === 0) {
    await db.insert(schema.siteSettings).values({
      id: 1,
      name: data.seedSite.name,
      nameLatin: data.seedSite.nameLatin,
      tagline: data.seedSite.tagline,
      city: data.seedSite.city,
      phone: data.seedSite.phone,
      phoneDisplay: data.seedSite.phoneDisplay,
      email: data.seedSite.email,
      address: data.seedSite.address,
      addressHint: data.seedSite.addressHint,
      facebook: data.seedSite.facebook,
      instagram: data.seedSite.instagram,
      mapQuery: data.seedSite.mapQuery,
      mapIsExact: data.seedSite.mapIsExact,
      mapZoom: data.seedSite.mapZoom,
      priceNote: data.seedSite.priceNote,
      menuNotes: JSON.stringify(data.seedSite.menuNotes),
      minLeadDays: data.seedSite.minLeadDays,
      maxAheadDays: data.seedSite.maxAheadDays,
      maxChildren: data.seedSite.maxChildren,
    })
    console.log('  · site settings')
  }

  if ((await count(schema.openingHours)) === 0) {
    await db.insert(schema.openingHours).values(
      data.seedOpeningHours.map((entry, index) => ({
        id: newId(),
        day: entry.day,
        hours: entry.hours,
        sortOrder: index,
      })),
    )
    console.log(`  · ${data.seedOpeningHours.length} opening hours`)
  }

  if ((await count(schema.programs)) === 0) {
    await db.insert(schema.programs).values(
      data.seedPrograms.map((program, index) => ({
        ...program,
        highlights: JSON.stringify(program.highlights),
        sortOrder: index,
      })),
    )
    console.log(`  · ${data.seedPrograms.length} programmes`)
  }

  if ((await count(schema.activities)) === 0) {
    await db
      .insert(schema.activities)
      .values(data.seedActivities.map((activity, index) => ({ ...activity, sortOrder: index })))
    console.log(`  · ${data.seedActivities.length} activities`)
  }

  if ((await count(schema.benefits)) === 0) {
    await db
      .insert(schema.benefits)
      .values(data.seedBenefits.map((benefit, index) => ({ ...benefit, sortOrder: index })))
    console.log(`  · ${data.seedBenefits.length} benefits`)
  }

  if ((await count(schema.extras)) === 0) {
    await db
      .insert(schema.extras)
      .values(data.seedExtras.map((extra, index) => ({ ...extra, sortOrder: index })))
    console.log(`  · ${data.seedExtras.length} extras`)
  }

  if ((await count(schema.menuCategories)) === 0) {
    await db.insert(schema.menuCategories).values(
      data.seedMenu.map((category, index) => ({
        id: category.id,
        group: category.group,
        title: category.title,
        description: category.description,
        icon: category.icon,
        sortOrder: index,
      })),
    )

    const items = data.seedMenu.flatMap((category) =>
      category.items.map((item, index) => ({
        id: item.id,
        categoryId: category.id,
        title: item.title,
        description: item.description ?? null,
        price: item.price,
        unit: item.unit,
        tags: JSON.stringify(item.tags),
        sortOrder: index,
      })),
    )
    await db.insert(schema.menuItems).values(items)
    console.log(`  · ${data.seedMenu.length} menu categories, ${items.length} items`)
  }

  if ((await count(schema.galleryCategories)) === 0) {
    await db
      .insert(schema.galleryCategories)
      .values(data.seedGalleryCategories.map((category, index) => ({ ...category, sortOrder: index })))
    console.log(`  · ${data.seedGalleryCategories.length} gallery categories`)
  }

  if ((await count(schema.galleryImages)) === 0) {
    await db
      .insert(schema.galleryImages)
      .values(data.seedGallery.map((image, index) => ({ ...image, sortOrder: index })))
    console.log(`  · ${data.seedGallery.length} gallery images`)
  }

  if ((await count(schema.scheduleSlots)) === 0) {
    const slots = data.seedScheduleSlots.flatMap((day) =>
      day.times.map((time) => ({
        id: newId(),
        weekday: day.weekday,
        time,
        durationMinutes: data.SLOT_DURATION_MINUTES,
      })),
    )
    await db.insert(schema.scheduleSlots).values(slots)
    console.log(`  · ${slots.length} weekly slots`)
  }
}

async function seedAdmin(): Promise<void> {
  if ((await count(schema.users)) > 0) return

  const { email, password, name } = env.bootstrapAdmin
  await db.insert(schema.users).values({
    id: newId(),
    email: email.toLowerCase(),
    name,
    role: 'admin',
    passwordHash: await hashPassword(password),
  })

  console.log(`  · admin account: ${email}`)
  if (password === 'changeme123') {
    console.warn('    ⚠️  using the default password — change it before going live.')
  }
}

async function main(): Promise<void> {
  console.log(`[seed] database: ${env.databaseUrl}`)

  console.log('[seed] applying migrations')
  await migrate(db, { migrationsFolder: path.join(SERVER_ROOT, 'drizzle') })

  console.log('[seed] content')
  await seedContent()

  console.log('[seed] admin')
  await seedAdmin()

  console.log('[seed] done')
}

main()
  .then(() => {
    client.close()
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error('[seed] failed:', error)
    client.close()
    process.exit(1)
  })
