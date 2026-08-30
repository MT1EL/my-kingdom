import { asc, eq, inArray, sql } from 'drizzle-orm'
import type { SQLiteColumn, SQLiteTable } from 'drizzle-orm/sqlite-core'
import { Router } from 'express'
import type { ZodType } from 'zod'
import { db } from '../../db/client.ts'
import { ApiError, param, route } from '../../lib/http.ts'
import { slugify } from '../../lib/ids.ts'
import { reorderSchema } from '../../lib/validators.ts'

/* ------------------------------------------------------------------
   CRUD factory for the content tables.

   Programmes, activities, extras, menu categories, menu items, gallery
   images and gallery categories are the same resource with different
   columns: list / create / update / delete / reorder, ordered by
   `sortOrder`, with a slug id the dashboard can link to.

   Writing that seven times would mean seven places to fix a bug, so each
   resource declares only what is actually different — its table, its
   schemas, and how a validated body becomes columns.
------------------------------------------------------------------- */

/** The shape every content table shares — what the factory relies on. */
type ContentRow = { id: string; sortOrder: number; published: boolean }

export interface ResourceConfig<TTable extends SQLiteTable, TCreate, TUpdate> {
  /** Drizzle table. Must have a text `id` and an integer `sort_order`. */
  table: TTable
  createSchema: ZodType<TCreate>
  updateSchema: ZodType<TUpdate>
  /** Turns a validated body into database columns. */
  toColumns: (input: Partial<TCreate & TUpdate>) => Record<string, unknown>
  /** Turns a row into the API shape. */
  serialize: (row: TTable['$inferSelect'] & ContentRow) => unknown
  /** Derives an id when the dashboard does not supply one. */
  deriveId: (input: TCreate) => string
  /** Extra check before a create/update, e.g. "the category must exist". */
  validateRefs?: (input: Partial<TCreate & TUpdate>) => Promise<void>
  /** Refuse to delete, e.g. a category that still has items. */
  guardDelete?: (id: string) => Promise<void>
}

/**
 * Narrow accessor for the columns the factory relies on.
 * Drizzle cannot express "any table with these columns" generically, so the
 * cast is confined here rather than spread through every query below.
 */
const col = (table: SQLiteTable, name: 'id' | 'sortOrder' | 'updatedAt'): SQLiteColumn =>
  (table as unknown as Record<string, SQLiteColumn>)[name]!

const nowISO = () => new Date().toISOString()

/** Ensures a create never overwrites an existing row through a colliding id. */
async function uniqueId(table: SQLiteTable, base: string): Promise<string> {
  let candidate = base
  for (let attempt = 2; attempt < 100; attempt += 1) {
    const existing = await db
      .select({ id: col(table, 'id') })
      .from(table)
      .where(eq(col(table, 'id'), candidate))
      .limit(1)

    if (existing.length === 0) return candidate
    candidate = `${base}-${attempt}`
  }
  throw ApiError.conflict('ID_COLLISION', 'ამ დასახელებით ჩანაწერი უკვე ბევრია — შეცვალეთ სათაური.')
}

/** Appends new rows after everything that already exists. */
async function nextSortOrder(table: SQLiteTable): Promise<number> {
  const rows = await db
    .select({ max: sql<number | null>`max(${col(table, 'sortOrder')})` })
    .from(table)

  return (rows[0]?.max ?? -1) + 1
}

export function resourceRouter<TTable extends SQLiteTable, TCreate, TUpdate>(
  config: ResourceConfig<TTable, TCreate, TUpdate>,
): Router {
  const router: Router = Router()
  const { table } = config

  type Row = TTable['$inferSelect'] & ContentRow

  const findOne = async (id: string): Promise<Row> => {
    const rows = await db.select().from(table).where(eq(col(table, 'id'), id)).limit(1)
    const row = rows[0]
    if (!row) throw ApiError.notFound()
    return row as Row
  }

  /** Unpublished rows are included — the dashboard edits drafts too. */
  router.get(
    '/',
    route(async (_req, res) => {
      const rows = await db.select().from(table).orderBy(asc(col(table, 'sortOrder')))
      res.json(rows.map((row) => config.serialize(row as Row)))
    }),
  )

  router.get(
    '/:id',
    route(async (req, res) => {
      const row = await findOne(param(req, 'id'))
      res.json(config.serialize(row))
    }),
  )

  router.post(
    '/',
    route(async (req, res) => {
      const input = config.createSchema.parse(req.body)
      await config.validateRefs?.(input as Partial<TCreate & TUpdate>)

      const requested = (input as { id?: string }).id
      const id = await uniqueId(table, requested ?? slugify(config.deriveId(input)))
      const timestamp = nowISO()

      const columns: Record<string, unknown> = {
        ...config.toColumns(input as Partial<TCreate & TUpdate>),
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      // A dashboard "add" always lands at the end of the list unless the
      // caller deliberately positioned it.
      if ((input as { sortOrder?: number }).sortOrder === undefined) {
        columns.sortOrder = await nextSortOrder(table)
      }

      await db.insert(table).values(columns as TTable['$inferInsert'])
      const row = await findOne(id)
      res.status(201).json(config.serialize(row))
    }),
  )

  router.patch(
    '/:id',
    route(async (req, res) => {
      const id = param(req, 'id')
      await findOne(id)

      const input = config.updateSchema.parse(req.body)
      await config.validateRefs?.(input as Partial<TCreate & TUpdate>)

      const columns = config.toColumns(input as Partial<TCreate & TUpdate>)
      // `id` is immutable: changing it would break links and booking history.
      delete columns.id
      columns.updatedAt = nowISO()

      await db.update(table).set(columns as Partial<TTable['$inferInsert']>).where(eq(col(table, 'id'), id))
      const row = await findOne(id)
      res.json(config.serialize(row))
    }),
  )

  router.delete(
    '/:id',
    route(async (req, res) => {
      const id = param(req, 'id')
      await findOne(id)
      await config.guardDelete?.(id)
      await db.delete(table).where(eq(col(table, 'id'), id))
      res.status(204).end()
    }),
  )

  /** Drag-and-drop: the dashboard sends the ids in their new order. */
  router.post(
    '/reorder',
    route(async (req, res) => {
      const { ids } = reorderSchema.parse(req.body)

      const existing = await db
        .select({ id: col(table, 'id') })
        .from(table)
        .where(inArray(col(table, 'id'), ids))

      if (existing.length !== ids.length) {
        throw ApiError.badRequest('სიაში ისეთი ჩანაწერია, რომელიც აღარ არსებობს — გადატვირთეთ გვერდი.')
      }

      const timestamp = nowISO()
      await db.transaction(async (tx) => {
        for (const [index, id] of ids.entries()) {
          await tx
            .update(table)
            .set({ sortOrder: index, updatedAt: timestamp } as Partial<TTable['$inferInsert']>)
            .where(eq(col(table, 'id'), id))
        }
      })

      const rows = await db.select().from(table).orderBy(asc(col(table, 'sortOrder')))
      res.json(rows.map((row) => config.serialize(row as Row)))
    }),
  )

  return router
}

/** Drops keys the caller did not send, so a PATCH never nulls a field by accident. */
export function defined(columns: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(columns).filter(([, value]) => value !== undefined))
}
