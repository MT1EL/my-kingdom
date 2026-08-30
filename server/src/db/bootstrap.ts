import { migrate } from 'drizzle-orm/node-postgres/migrator'
import path from 'node:path'
import { db } from './client.ts'
import { env, SERVER_ROOT } from '../env.ts'
import { newId } from '../lib/ids.ts'
import { hashPassword } from '../lib/password.ts'
import * as data from './seed-data.ts'
import * as schema from './schema.ts'

/* ------------------------------------------------------------------
   Getting a database ready to serve.

   This runs on every boot, not just from the seed script: a managed host
   gives you no convenient place to run a one-off command, so a fresh
   deployment has to be able to bring its own schema up. Both steps are
   idempotent — migrations are tracked, and content is only inserted into
   tables that are empty — so restarting never duplicates or overwrites
   anything the venue has edited.
------------------------------------------------------------------- */

const count = (table: Parameters<typeof db.$count>[0]): Promise<number> => db.$count(table)

/** Hides the password when a connection string has to appear in a log. */
function describeTarget(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.hostname}:${parsed.port || '5432'}${parsed.pathname}`
  } catch {
    return '(DATABASE_URL is not a valid URL)'
  }
}

export async function migrateDatabase(log = console.log): Promise<void> {
  log('[db] applying migrations')

  try {
    await migrate(db, { migrationsFolder: path.join(SERVER_ROOT, 'drizzle') })
  } catch (cause) {
    // The first thing that touches the database, so a bad DATABASE_URL always
    // surfaces here. The raw driver error names neither the setting nor the
    // address it tried, which makes it needlessly hard to act on.
    const code = (cause as { code?: string }).code
    if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT') {
      throw new Error(
        `Cannot reach the database at ${describeTarget(env.databaseUrl)} (${code}).\n` +
          'Check DATABASE_URL. On Render it must be the database\'s Internal\n' +
          'Database URL — a service created by hand does not inherit the value\n' +
          'from render.yaml, so set it explicitly or deploy via a Blueprint.\n' +
          'Locally, run `npm run db:local` first. See DEPLOYMENT.md.',
        { cause },
      )
    }
    throw cause
  }
}

/** Wipes editable content. Bookings and users are never touched. */
export async function clearContent(log = console.log): Promise<void> {
  log('[db] clearing existing content')
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

export async function seedContent(log = console.log): Promise<void> {
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
    log('  · site settings')
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
    log(`  · ${data.seedOpeningHours.length} opening hours`)
  }

  if ((await count(schema.programs)) === 0) {
    await db.insert(schema.programs).values(
      data.seedPrograms.map((program, index) => ({
        ...program,
        highlights: JSON.stringify(program.highlights),
        sortOrder: index,
      })),
    )
    log(`  · ${data.seedPrograms.length} programmes`)
  }

  if ((await count(schema.activities)) === 0) {
    await db
      .insert(schema.activities)
      .values(data.seedActivities.map((activity, index) => ({ ...activity, sortOrder: index })))
    log(`  · ${data.seedActivities.length} activities`)
  }

  if ((await count(schema.benefits)) === 0) {
    await db
      .insert(schema.benefits)
      .values(data.seedBenefits.map((benefit, index) => ({ ...benefit, sortOrder: index })))
    log(`  · ${data.seedBenefits.length} benefits`)
  }

  if ((await count(schema.extras)) === 0) {
    await db
      .insert(schema.extras)
      .values(data.seedExtras.map((extra, index) => ({ ...extra, sortOrder: index })))
    log(`  · ${data.seedExtras.length} extras`)
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
    log(`  · ${data.seedMenu.length} menu categories, ${items.length} items`)
  }

  if ((await count(schema.galleryCategories)) === 0) {
    await db
      .insert(schema.galleryCategories)
      .values(
        data.seedGalleryCategories.map((category, index) => ({ ...category, sortOrder: index })),
      )
    log(`  · ${data.seedGalleryCategories.length} gallery categories`)
  }

  if ((await count(schema.galleryImages)) === 0) {
    await db
      .insert(schema.galleryImages)
      .values(data.seedGallery.map((image, index) => ({ ...image, sortOrder: index })))
    log(`  · ${data.seedGallery.length} gallery images`)
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
    log(`  · ${slots.length} weekly slots`)
  }
}

/** Creates the first admin so somebody can sign in to a fresh deployment. */
export async function seedAdmin(log = console.log): Promise<void> {
  if ((await count(schema.users)) > 0) return

  const { email, password, name } = env.bootstrapAdmin
  await db.insert(schema.users).values({
    id: newId(),
    email: email.toLowerCase(),
    name,
    role: 'admin',
    passwordHash: await hashPassword(password),
  })

  log(`  · admin account: ${email}`)
  if (password === 'changeme123') {
    log('    ⚠️  using the default password — change it before going live.')
  }
}

/** Everything a fresh database needs before the server can answer a request. */
export async function prepareDatabase(
  options: { reset?: boolean; log?: (message: string) => void } = {},
): Promise<void> {
  const log = options.log ?? console.log

  await migrateDatabase(log)
  if (options.reset) await clearContent(log)

  log('[db] seeding anything missing')
  await seedContent(log)
  await seedAdmin(log)
}
