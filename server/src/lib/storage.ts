import { eq } from 'drizzle-orm'
import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { db, schema } from '../db/client.ts'
import { env } from '../env.ts'
import { ApiError } from './http.ts'
import { newToken } from './ids.ts'

/* ------------------------------------------------------------------
   Where uploaded photos live.

   Three drivers, chosen by STORAGE_DRIVER:

     disk        — writes into UPLOAD_DIR and serves from /uploads.
                   The default, and what local development uses.

     database    — keeps the bytes in Postgres; the API serves them from
                   /uploads/:file. For hosts with neither a persistent disk
                   nor object storage, which is Render's free tier.

     cloudinary  — uploads to Cloudinary and lets it resize on the fly.

   All three return the same shape, so the upload route and the dashboard
   do not know or care which one is running.
------------------------------------------------------------------- */

/** Widths the site renders. Matches `SmartImage`'s usage. */
const RENDITIONS = [400, 800, 1400] as const

export interface StoredImage {
  /** Largest rendition — what gets saved on a programme or gallery row. */
  url: string
  /** width → public URL. */
  renditions: Record<string, string>
  width: number
  height: number
  bytes: number
  /** Identifier the driver needs in order to delete it later. */
  key: string
}

export interface Storage {
  save: (buffer: Buffer, originalName: string) => Promise<StoredImage>
  remove: (key: string, renditions: Record<string, string>) => Promise<void>
}

/** Reads the dimensions, and rejects anything that is not really an image. */
async function measure(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer, { failOn: 'error' }).metadata()
  const width = metadata.width ?? 0
  const height = metadata.height ?? 0

  if (width === 0 || height === 0) {
    throw ApiError.badRequest('ფაილი სურათად ვერ წაიკითხა.')
  }

  return { width, height }
}

/** Re-encodes an upload to the widths the site actually renders. */
async function renditionsOf(
  buffer: Buffer,
  width: number,
): Promise<{ target: number; output: Buffer }[]> {
  const out: { target: number; output: Buffer }[] = []

  for (const target of RENDITIONS) {
    const output = await sharp(buffer)
      .rotate() // honour the EXIF orientation before it is stripped
      // Never upscale: a 600px photo stays 600px rather than being blown up.
      .resize({ width: Math.min(target, width), withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()

    out.push({ target, output })
  }

  return out
}

/* ----------------------------- disk ------------------------------ */

const diskStorage: Storage = {
  async save(buffer) {
    await fs.mkdir(env.uploadDir, { recursive: true })

    const { width, height } = await measure(buffer)
    const base = newToken(8)
    const renditions: Record<string, string> = {}
    let bytes = 0

    for (const { target, output } of await renditionsOf(buffer, width)) {
      const filename = `${base}-${target}.webp`
      await fs.writeFile(path.join(env.uploadDir, filename), output)
      renditions[String(target)] = `${env.uploadUrlPath}/${filename}`
      bytes += output.byteLength
    }

    return {
      url: renditions[String(RENDITIONS.at(-1))]!,
      renditions,
      width,
      height,
      bytes,
      key: base,
    }
  },

  async remove(_key, renditions) {
    const root = path.resolve(env.uploadDir)
    for (const url of Object.values(renditions)) {
      // Resolve against the upload directory and refuse anything that escapes
      // it, so a tampered database row cannot delete arbitrary files.
      const target = path.resolve(root, path.basename(url))
      if (!target.startsWith(root)) continue
      await fs.rm(target, { force: true })
    }
  },
}

/* --------------------------- database ---------------------------- */

const databaseStorage: Storage = {
  async save(buffer) {
    const { width, height } = await measure(buffer)
    const base = newToken(8)
    const renditions: Record<string, string> = {}
    const rows: (typeof schema.imageFiles.$inferInsert)[] = []
    let bytes = 0

    for (const { target, output } of await renditionsOf(buffer, width)) {
      const filename = `${base}-${target}.webp`
      rows.push({
        id: filename,
        storageKey: base,
        contentType: 'image/webp',
        width: target,
        bytes: output.byteLength,
        data: output,
      })
      renditions[String(target)] = `${env.uploadUrlPath}/${filename}`
      bytes += output.byteLength
    }

    await db.insert(schema.imageFiles).values(rows)

    return {
      url: renditions[String(RENDITIONS.at(-1))]!,
      renditions,
      width,
      height,
      bytes,
      key: base,
    }
  },

  async remove(key) {
    if (!key) return
    await db.delete(schema.imageFiles).where(eq(schema.imageFiles.storageKey, key))
  },
}

/* -------------------------- cloudinary --------------------------- */

const cloudinaryBase = (): string =>
  `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}`

/**
 * Cloudinary signs requests with a SHA-1 of the sorted parameters plus the
 * API secret. Done here with fetch rather than their SDK — it is a few lines
 * and keeps a dependency (and its release cadence) out of the project.
 */
function sign(params: Record<string, string>): string {
  const canonical = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  return createHash('sha1').update(canonical + env.cloudinary.apiSecret).digest('hex')
}

interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  width: number
  height: number
  bytes: number
  error?: { message: string }
}

const cloudinaryStorage: Storage = {
  async save(buffer, originalName) {
    const { width, height } = await measure(buffer)

    const timestamp = String(Math.floor(Date.now() / 1000))
    const folder = env.cloudinary.folder
    const signed = { folder, timestamp }

    const form = new FormData()
    form.append('file', new Blob([new Uint8Array(buffer)]), originalName)
    form.append('api_key', env.cloudinary.apiKey)
    form.append('timestamp', timestamp)
    form.append('folder', folder)
    form.append('signature', sign(signed))

    const response = await fetch(`${cloudinaryBase()}/image/upload`, {
      method: 'POST',
      body: form,
    })

    const result = (await response.json()) as CloudinaryUploadResponse
    if (!response.ok) {
      throw new ApiError(
        502,
        'UPLOAD_FAILED',
        `სურათის ატვირთვა ვერ მოხერხდა: ${result.error?.message ?? response.statusText}`,
      )
    }

    // Cloudinary resizes from the URL, so the renditions are derived rather
    // than uploaded — one stored original, any size on demand.
    const renditions: Record<string, string> = {}
    for (const target of RENDITIONS) {
      renditions[String(target)] = result.secure_url.replace(
        '/image/upload/',
        `/image/upload/c_limit,w_${target},f_auto,q_auto/`,
      )
    }

    return {
      url: renditions[String(RENDITIONS.at(-1))]!,
      renditions,
      width: result.width || width,
      height: result.height || height,
      bytes: result.bytes,
      key: result.public_id,
    }
  },

  async remove(key) {
    if (!key) return

    const timestamp = String(Math.floor(Date.now() / 1000))
    const body = new URLSearchParams({
      public_id: key,
      api_key: env.cloudinary.apiKey,
      timestamp,
      signature: sign({ public_id: key, timestamp }),
    })

    const response = await fetch(`${cloudinaryBase()}/image/destroy`, {
      method: 'POST',
      body,
    })

    if (!response.ok) {
      // The database row is going away regardless; a stranded remote file is
      // worth a log line, not a failed request the moderator has to retry.
      console.warn(`[uploads] Cloudinary refused to delete ${key}: ${response.statusText}`)
    }
  },
}

/* ---------------------------- selection -------------------------- */

const drivers = {
  disk: diskStorage,
  database: databaseStorage,
  cloudinary: cloudinaryStorage,
} as const

export const storage: Storage = drivers[env.storageDriver] ?? diskStorage

export { RENDITIONS }
