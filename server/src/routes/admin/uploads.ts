import { desc, eq } from 'drizzle-orm'
import { Router } from 'express'
import multer from 'multer'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { db, schema } from '../../db/client.ts'
import { env } from '../../env.ts'
import { ApiError, param, route } from '../../lib/http.ts'
import { newId, newToken } from '../../lib/ids.ts'

/* ------------------------------------------------------------------
   Image uploads.

   A moderator drops a photo from a phone — often 4000px and several MB.
   Serving that to every visitor would undo the site's performance, so each
   upload is re-encoded to WebP at three widths and the original is dropped.

   Files are written under `env.uploadDir` with a random name: the original
   filename is untrusted input and is kept only as a label in the database.
------------------------------------------------------------------- */

export const uploadsRouter: Router = Router()

/** Widths the site actually renders. Matches `SmartImage`'s usage. */
const RENDITIONS = [400, 800, 1400] as const

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

uploadsRouter.post(
  '/',
  upload.single('file'),
  route(async (req, res) => {
    const file = req.file
    if (!file) throw ApiError.badRequest('ფაილი არ არის მიმაგრებული.', { file: 'აირჩიეთ სურათი' })

    await fs.mkdir(env.uploadDir, { recursive: true })

    const image = sharp(file.buffer, { failOn: 'error' })
    const metadata = await image.metadata()
    const width = metadata.width ?? 0
    const height = metadata.height ?? 0

    if (width === 0 || height === 0) {
      throw ApiError.badRequest('ფაილი სურათად ვერ წაიკითხა.')
    }

    const base = newToken(8)
    const renditions: Record<string, string> = {}
    let bytes = 0

    for (const target of RENDITIONS) {
      // Never upscale: a 600px photo stays 600px rather than being blown up.
      const resizeTo = Math.min(target, width)
      const filename = `${base}-${target}.webp`

      const output = await sharp(file.buffer)
        .rotate() // honour the EXIF orientation before it is stripped
        .resize({ width: resizeTo, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer()

      await fs.writeFile(path.join(env.uploadDir, filename), output)
      renditions[String(target)] = `${env.uploadUrlPath}/${filename}`
      bytes += output.byteLength
    }

    const largest = renditions[String(RENDITIONS[RENDITIONS.length - 1])]!
    const id = newId()

    await db.insert(schema.uploads).values({
      id,
      filename: file.originalname.slice(0, 200),
      url: largest,
      renditions: JSON.stringify(renditions),
      width,
      height,
      bytes,
      uploadedBy: req.user?.id ?? null,
    })

    res.status(201).json({ id, url: largest, renditions, width, height, bytes })
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
        renditions: JSON.parse(row.renditions) as Record<string, string>,
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

    const renditions = JSON.parse(row.renditions) as Record<string, string>
    for (const url of Object.values(renditions)) {
      // Resolve against the upload directory and refuse anything that escapes
      // it, so a tampered database row cannot delete arbitrary files.
      const target = path.resolve(env.uploadDir, path.basename(url))
      if (!target.startsWith(path.resolve(env.uploadDir))) continue
      await fs.rm(target, { force: true })
    }

    await db.delete(schema.uploads).where(eq(schema.uploads.id, row.id))
    res.status(204).end()
  }),
)
