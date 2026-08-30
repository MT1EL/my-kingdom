import { randomBytes, randomUUID } from 'node:crypto'

export const newId = (): string => randomUUID()

/** URL-safe opaque token, used for session cookies and upload filenames. */
export const newToken = (bytes = 32): string => randomBytes(bytes).toString('base64url')

/**
 * Turns a title into a stable, readable id.
 * Georgian has no ASCII transliteration here, so a non-latin title collapses
 * to an empty slug — we fall back to a short random id rather than returning
 * something empty or colliding.
 */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)

  return slug || `item-${randomBytes(4).toString('hex')}`
}
