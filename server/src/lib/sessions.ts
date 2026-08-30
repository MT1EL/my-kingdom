import { and, eq, gt, lt } from 'drizzle-orm'
import { createHash } from 'node:crypto'
import { db, schema } from '../db/client.ts'
import { env } from '../env.ts'
import { newToken } from './ids.ts'
import { toUser } from './serialize.ts'
import type { User } from '../../../shared/types.ts'

/* ------------------------------------------------------------------
   Server-side sessions.

   The cookie carries a random token; the database stores only its SHA-256.
   A leaked database backup therefore cannot be used to sign in as anybody,
   the way a table of raw tokens could.
------------------------------------------------------------------- */

const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex')

const expiryFromNow = (): string =>
  new Date(Date.now() + env.session.ttlDays * 24 * 60 * 60 * 1000).toISOString()

/** Creates a session and returns the token to put in the cookie. */
export async function createSession(userId: string): Promise<{ token: string; expiresAt: string }> {
  const token = newToken()
  const expiresAt = expiryFromNow()

  await db.insert(schema.sessions).values({
    id: hashToken(token),
    userId,
    expiresAt,
  })

  return { token, expiresAt }
}

/** Resolves a cookie token to its user, or null when missing/expired. */
export async function resolveSession(token: string | undefined): Promise<User | null> {
  if (!token) return null

  const rows = await db
    .select({ user: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(
      and(
        eq(schema.sessions.id, hashToken(token)),
        gt(schema.sessions.expiresAt, new Date().toISOString()),
      ),
    )
    .limit(1)

  const row = rows[0]
  return row ? toUser(row.user) : null
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return
  await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)))
}

/** Signing out everywhere — used after a password change. */
export async function destroyUserSessions(userId: string): Promise<void> {
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId))
}

/** Housekeeping, run on boot and daily. */
export async function purgeExpiredSessions(): Promise<void> {
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date().toISOString()))
}

export const sessionCookieOptions = (maxAgeMs: number) =>
  ({
    httpOnly: true,
    sameSite: env.isProduction ? ('none' as const) : ('lax' as const),
    // `sameSite: 'none'` is only honoured on a secure connection, and the
    // dashboard is served from a different subdomain than the API.
    secure: env.isProduction,
    signed: true,
    maxAge: maxAgeMs,
    path: '/',
  }) as const
