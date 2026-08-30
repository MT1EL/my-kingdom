import { eq } from 'drizzle-orm'
import { Router } from 'express'
import { db, schema } from '../db/client.ts'
import { env } from '../env.ts'
import { ApiError, route } from '../lib/http.ts'
import { hashPassword, verifyPassword } from '../lib/password.ts'
import { toUser } from '../lib/serialize.ts'
import {
  createSession,
  destroySession,
  destroyUserSessions,
  sessionCookieOptions,
} from '../lib/sessions.ts'
import { changePasswordSchema, loginSchema } from '../lib/validators.ts'
import { readSessionToken, requireAuth } from '../middleware/auth.ts'

/* ------------------------------------------------------------------
   Authentication for the dashboard.

   Sessions are cookie-based rather than token-in-localStorage: an httpOnly
   cookie cannot be read by injected script, and the dashboard never has to
   store a credential itself.
------------------------------------------------------------------- */

export const authRouter: Router = Router()

/** Rough brute-force brake, per IP. Resets on restart, which is fine here. */
const attempts = new Map<string, { count: number; firstAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

function registerAttempt(key: string): boolean {
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now })
    return true
  }

  entry.count += 1
  return entry.count <= MAX_ATTEMPTS
}

authRouter.post(
  '/login',
  route(async (req, res) => {
    const key = req.ip ?? 'unknown'
    if (!registerAttempt(key)) {
      throw new ApiError(
        429,
        'TOO_MANY_ATTEMPTS',
        'ძალიან ბევრი მცდელობა. სცადეთ 15 წუთში.',
      )
    }

    const body = loginSchema.parse(req.body)

    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, body.email))
      .limit(1)

    const user = rows[0]
    // Hash even when the account does not exist, so response time does not
    // reveal which emails are registered.
    const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin'
    const ok = await verifyPassword(body.password, hash)

    if (!user || !ok) {
      throw ApiError.unauthorized('ელფოსტა ან პაროლი არასწორია.')
    }

    attempts.delete(key)

    const { token } = await createSession(user.id)
    res.cookie(
      env.session.cookieName,
      token,
      sessionCookieOptions(env.session.ttlDays * 24 * 60 * 60 * 1000),
    )
    res.json({ user: toUser(user) })
  }),
)

authRouter.post(
  '/logout',
  route(async (req, res) => {
    await destroySession(readSessionToken(req))
    res.clearCookie(env.session.cookieName, { path: '/' })
    res.status(204).end()
  }),
)

authRouter.get('/me', (req, res) => {
  res.set('Cache-Control', 'no-store')
  res.json({ user: req.user ?? null })
})

authRouter.post(
  '/change-password',
  requireAuth,
  route(async (req, res) => {
    const body = changePasswordSchema.parse(req.body)
    const current = req.user
    if (!current) throw ApiError.unauthorized()

    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, current.id))
      .limit(1)

    const user = rows[0]
    if (!user || !(await verifyPassword(body.currentPassword, user.passwordHash))) {
      throw ApiError.badRequest('მიმდინარე პაროლი არასწორია.', {
        currentPassword: 'პაროლი არასწორია',
      })
    }

    await db
      .update(schema.users)
      .set({ passwordHash: await hashPassword(body.newPassword) })
      .where(eq(schema.users.id, user.id))

    // Every other device is signed out; this one gets a fresh session.
    await destroyUserSessions(user.id)
    const { token } = await createSession(user.id)
    res.cookie(
      env.session.cookieName,
      token,
      sessionCookieOptions(env.session.ttlDays * 24 * 60 * 60 * 1000),
    )

    res.status(204).end()
  }),
)
