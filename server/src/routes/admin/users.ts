import { asc, eq, sql } from 'drizzle-orm'
import { Router } from 'express'
import { db, schema } from '../../db/client.ts'
import { ApiError, param, route } from '../../lib/http.ts'
import { newId } from '../../lib/ids.ts'
import { hashPassword } from '../../lib/password.ts'
import { toUser } from '../../lib/serialize.ts'
import { destroyUserSessions } from '../../lib/sessions.ts'
import { createUserSchema } from '../../lib/validators.ts'
import { requireRole } from '../../middleware/auth.ts'

/* ------------------------------------------------------------------
   Dashboard accounts. Admin-only — a moderator edits content, not who
   else can edit content.
------------------------------------------------------------------- */

export const usersRouter: Router = Router()

usersRouter.use(requireRole('admin'))

usersRouter.get(
  '/',
  route(async (_req, res) => {
    const rows = await db.select().from(schema.users).orderBy(asc(schema.users.createdAt))
    res.json(rows.map(toUser))
  }),
)

usersRouter.post(
  '/',
  route(async (req, res) => {
    const input = createUserSchema.parse(req.body)

    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, input.email))
      .limit(1)

    if (existing.length > 0) {
      throw ApiError.conflict('EMAIL_TAKEN', 'ამ ელფოსტით მომხმარებელი უკვე არსებობს.')
    }

    const id = newId()
    await db.insert(schema.users).values({
      id,
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash: await hashPassword(input.password),
    })

    const rows = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1)
    res.status(201).json(toUser(rows[0]!))
  }),
)

usersRouter.delete(
  '/:id',
  route(async (req, res) => {
    const id = param(req, 'id')

    if (req.user?.id === id) {
      throw ApiError.badRequest('საკუთარი ანგარიშის წაშლა შეუძლებელია.')
    }

    const rows = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1)
    const user = rows[0]
    if (!user) throw ApiError.notFound()

    if (user.role === 'admin') {
      // Losing every admin would lock the dashboard permanently.
      const admins = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.users)
        .where(eq(schema.users.role, 'admin'))

      if ((admins[0]?.count ?? 0) <= 1) {
        throw ApiError.badRequest('ბოლო ადმინისტრატორის წაშლა შეუძლებელია.')
      }
    }

    await destroyUserSessions(id)
    await db.delete(schema.users).where(eq(schema.users.id, id))
    res.status(204).end()
  }),
)

/** Resetting somebody else's password — signs them out everywhere. */
usersRouter.post(
  '/:id/password',
  route(async (req, res) => {
    const id = param(req, 'id')
    const { password } = createUserSchema.pick({ password: true }).parse(req.body)

    const rows = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.id, id)).limit(1)
    if (rows.length === 0) throw ApiError.notFound()

    await db
      .update(schema.users)
      .set({ passwordHash: await hashPassword(password) })
      .where(eq(schema.users.id, id))

    await destroyUserSessions(id)
    res.status(204).end()
  }),
)
