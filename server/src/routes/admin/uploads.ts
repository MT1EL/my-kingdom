import { desc, eq } from 'drizzle-orm'
import { Router } from 'express'
import multer from 'multer'
import { db, schema } from '../../db/client.ts'
import { env } from '../../env.ts'
import { ApiError, param, route } from '../../lib/http.ts'
import { newId } from '../../lib/ids.ts'
import { storage } from '../../lib/storage.ts'

/* ------------------------------------------------------------------
   Image uploads.

   A moderator drops a photo from a phone — often 4000px and several MB.
   Serving that to every visitor would undo the site's performance, so it
   is always reduced to a few sensible widths before anyone sees it.

   Where the file ends up is `lib/storage.ts`'s problem: a local directory
   in development, Cloudinary on a host with no persistent disk. This route
   only cares that it gets URLs back.
------------------------------------------------------------------- */

export const uploadsRouter: Router = Router()

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      callback(ApiError.badRequest('დასაშვებია მხოლოდ სურათი (JPG, PNG, WebP, AVIF, GIF).'))
      return
    }
    callback(null, true)
  },
})

const parseRenditions = (value: string): Record<string, string> => {
  try {
    return JSON.parse(value) as Record<string, string>
  } catch {
    return {}
  }
}

uploadsRouter.post(
  '/',
  upload.single('file'),
  route(async (req, res) => {
    const file = req.file
    if (!file) throw ApiError.badRequest('ფაილი არ არის მიმაგრებული.', { file: 'აირჩიეთ სურათი' })

    // The original filename is untrusted input; it is kept only as a label.
    const stored = await storage.save(file.buffer, file.originalname.slice(0, 200))
    const id = newId()

    await db.insert(schema.uploads).values({
      id,
      filename: file.originalname.slice(0, 200),
      url: stored.url,
      renditions: JSON.stringify(stored.renditions),
      storageKey: stored.key,
      width: stored.width,
      height: stored.height,
      bytes: stored.bytes,
      uploadedBy: req.user?.id ?? null,
    })

    res.status(201).json({
      id,
      url: stored.url,
      renditions: stored.renditions,
      width: stored.width,
      height: stored.height,
      bytes: stored.bytes,
    })
  }),
)

/** Media library for picking an already-uploaded photo. */
uploadsRouter.get(
  '/',
  route(async (_req, res) => {
    const rows = await db
      .select()
      .from(schema.uploads)
      .orderBy(desc(schema.uploads.createdAt))
      .limit(200)

    res.json(
      rows.map((row) => ({
        id: row.id,
        filename: row.filename,
        url: row.url,
        renditions: parseRenditions(row.renditions),
        width: row.width,
        height: row.height,
        bytes: row.bytes,
        createdAt: row.createdAt,
      })),
    )
  }),
)

uploadsRouter.delete(
  '/:id',
  route(async (req, res) => {
    const rows = await db
      .select()
      .from(schema.uploads)
      .where(eq(schema.uploads.id, param(req, 'id')))
      .limit(1)

    const row = rows[0]
    if (!row) throw ApiError.notFound()

    await storage.remove(row.storageKey ?? '', parseRenditions(row.renditions))
    await db.delete(schema.uploads).where(eq(schema.uploads.id, row.id))

    res.status(204).end()
  }),
)
