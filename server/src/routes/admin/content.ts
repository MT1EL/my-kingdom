import { eq } from 'drizzle-orm'
import { Router } from 'express'
import { db, schema } from '../../db/client.ts'
import { ApiError, route } from '../../lib/http.ts'
import {
  toActivity,
  toBenefit,
  toExtra,
  toGalleryImage,
  toMenuItem,
  toProgram,
} from '../../lib/serialize.ts'
import {
  activitySchema,
  activityUpdateSchema,
  benefitSchema,
  benefitUpdateSchema,
  extraSchema,
  extraUpdateSchema,
  galleryCategorySchema,
  galleryCategoryUpdateSchema,
  galleryImageSchema,
  galleryImageUpdateSchema,
  menuCategorySchema,
  menuCategoryUpdateSchema,
  menuItemSchema,
  menuItemUpdateSchema,
  programSchema,
  programUpdateSchema,
} from '../../lib/validators.ts'
import { defined, resourceRouter } from './resource.ts'

/* ------------------------------------------------------------------
   Content the dashboard edits.

   Each resource supplies only what makes it different from the others:
   its table, its schemas, and the mapping from validated body to columns.
   Everything else — list, create, update, delete, reorder — comes from
   `resourceRouter`.
------------------------------------------------------------------- */

export const contentAdminRouter: Router = Router()

/* ---------------------------- programmes -------------------------- */

contentAdminRouter.use(
  '/programs',
  resourceRouter({
    table: schema.programs,
    createSchema: programSchema,
    updateSchema: programUpdateSchema,
    deriveId: (input) => input.title,
    serialize: (row) => toProgram(row),
    toColumns: (input) =>
      defined({
        title: input.title,
        tagline: input.tagline,
        description: input.description,
        ageMin: input.ageMin,
        ageMax: input.ageMax,
        durationMinutes: input.durationMinutes,
        image: input.image,
        highlights: input.highlights ? JSON.stringify(input.highlights) : undefined,
        accent: input.accent,
        featured: input.featured,
        published: input.published,
        sortOrder: input.sortOrder,
      }),
  }),
)

/* ---------------------------- activities -------------------------- */

contentAdminRouter.use(
  '/activities',
  resourceRouter({
    table: schema.activities,
    createSchema: activitySchema,
    updateSchema: activityUpdateSchema,
    deriveId: (input) => input.title,
    serialize: (row) => toActivity(row),
    toColumns: (input) =>
      defined({
        title: input.title,
        description: input.description,
        icon: input.icon,
        accent: input.accent,
        published: input.published,
        sortOrder: input.sortOrder,
      }),
  }),
)

/* ----------------------------- benefits --------------------------- */

contentAdminRouter.use(
  '/benefits',
  resourceRouter({
    table: schema.benefits,
    createSchema: benefitSchema,
    updateSchema: benefitUpdateSchema,
    deriveId: (input) => input.title,
    serialize: (row) => toBenefit(row),
    toColumns: (input) =>
      defined({
        title: input.title,
        description: input.description,
        icon: input.icon,
        published: input.published,
        sortOrder: input.sortOrder,
      }),
  }),
)

/* ------------------------------ extras ---------------------------- */

contentAdminRouter.use(
  '/extras',
  resourceRouter({
    table: schema.extras,
    createSchema: extraSchema,
    updateSchema: extraUpdateSchema,
    deriveId: (input) => input.title,
    serialize: (row) => toExtra(row),
    toColumns: (input) =>
      defined({
        title: input.title,
        description: input.description,
        icon: input.icon,
        published: input.published,
        sortOrder: input.sortOrder,
      }),
  }),
)

/* ------------------------- menu categories ------------------------ */

contentAdminRouter.use(
  '/menu-categories',
  resourceRouter({
    table: schema.menuCategories,
    createSchema: menuCategorySchema,
    updateSchema: menuCategoryUpdateSchema,
    deriveId: (input) => input.title,
    // The API exposes `group`; the column is `group_name` because GROUP is
    // reserved in SQL. Items are attached by the public content route.
    serialize: (row) => ({
      id: row.id,
      group: row.group,
      title: row.title,
      description: row.description,
      icon: row.icon,
      published: row.published,
      sortOrder: row.sortOrder,
    }),
    toColumns: (input) =>
      defined({
        group: input.group,
        title: input.title,
        description: input.description,
        icon: input.icon,
        published: input.published,
        sortOrder: input.sortOrder,
      }),
    guardDelete: async (id) => {
      const items = await db
        .select({ id: schema.menuItems.id })
        .from(schema.menuItems)
        .where(eq(schema.menuItems.categoryId, id))
        .limit(1)

      if (items.length > 0) {
        throw ApiError.conflict(
          'CATEGORY_NOT_EMPTY',
          'კატეგორიაში კერძები ჯერ კიდევ არის — ჯერ ისინი წაშალეთ ან სხვა კატეგორიაში გადაიტანეთ.',
        )
      }
    },
  }),
)

/* ---------------------------- menu items -------------------------- */

contentAdminRouter.use(
  '/menu-items',
  resourceRouter({
    table: schema.menuItems,
    createSchema: menuItemSchema,
    updateSchema: menuItemUpdateSchema,
    deriveId: (input) => input.title,
    serialize: (row) => ({
      ...toMenuItem(row),
      categoryId: row.categoryId,
      published: row.published,
      sortOrder: row.sortOrder,
    }),
    toColumns: (input) =>
      defined({
        categoryId: input.categoryId,
        title: input.title,
        description: input.description,
        price: input.price,
        unit: input.unit,
        tags: input.tags ? JSON.stringify(input.tags) : undefined,
        published: input.published,
        sortOrder: input.sortOrder,
      }),
    validateRefs: async (input) => {
      if (input.categoryId === undefined) return
      const category = await db
        .select({ id: schema.menuCategories.id })
        .from(schema.menuCategories)
        .where(eq(schema.menuCategories.id, input.categoryId))
        .limit(1)

      if (category.length === 0) {
        throw ApiError.badRequest('ასეთი კატეგორია არ არსებობს.', {
          categoryId: 'აირჩიეთ არსებული კატეგორია',
        })
      }
    },
  }),
)

/* ------------------------------ gallery --------------------------- */

contentAdminRouter.use(
  '/gallery',
  resourceRouter({
    table: schema.galleryImages,
    createSchema: galleryImageSchema,
    updateSchema: galleryImageUpdateSchema,
    deriveId: (input) => input.alt,
    serialize: (row) => ({
      ...toGalleryImage(row),
      published: row.published,
      sortOrder: row.sortOrder,
    }),
    toColumns: (input) =>
      defined({
        src: input.src,
        alt: input.alt,
        category: input.category,
        span: input.span,
        published: input.published,
        sortOrder: input.sortOrder,
      }),
    validateRefs: async (input) => {
      if (input.category === undefined) return
      const category = await db
        .select({ id: schema.galleryCategories.id })
        .from(schema.galleryCategories)
        .where(eq(schema.galleryCategories.id, input.category))
        .limit(1)

      if (category.length === 0) {
        throw ApiError.badRequest('ასეთი კატეგორია არ არსებობს.', {
          category: 'აირჩიეთ არსებული კატეგორია',
        })
      }
    },
  }),
)

contentAdminRouter.use(
  '/gallery-categories',
  resourceRouter({
    table: schema.galleryCategories,
    createSchema: galleryCategorySchema,
    updateSchema: galleryCategoryUpdateSchema,
    deriveId: (input) => input.label,
    serialize: (row) => ({
      id: row.id,
      label: row.label,
      published: row.published,
      sortOrder: row.sortOrder,
    }),
    toColumns: (input) =>
      defined({
        label: input.label,
        published: input.published,
        sortOrder: input.sortOrder,
      }),
    guardDelete: async (id) => {
      const images = await db
        .select({ id: schema.galleryImages.id })
        .from(schema.galleryImages)
        .where(eq(schema.galleryImages.category, id))
        .limit(1)

      if (images.length > 0) {
        throw ApiError.conflict(
          'CATEGORY_NOT_EMPTY',
          'ამ კატეგორიაში ფოტოებია — ჯერ ისინი გადაიტანეთ ან წაშალეთ.',
        )
      }
    },
  }),
)

/* ------------------------- menu, assembled ------------------------ */

/**
 * The menu is edited as two tables but read as one tree. This endpoint saves
 * the dashboard from stitching categories and items together itself.
 */
contentAdminRouter.get(
  '/menu',
  route(async (_req, res) => {
    const [categories, items] = await Promise.all([
      db.select().from(schema.menuCategories).orderBy(schema.menuCategories.sortOrder),
      db.select().from(schema.menuItems).orderBy(schema.menuItems.sortOrder),
    ])

    res.json(
      categories.map((category) => ({
        id: category.id,
        group: category.group,
        title: category.title,
        description: category.description,
        icon: category.icon,
        published: category.published,
        sortOrder: category.sortOrder,
        items: items
          .filter((item) => item.categoryId === category.id)
          .map((item) => ({
            ...toMenuItem(item),
            categoryId: item.categoryId,
            published: item.published,
            sortOrder: item.sortOrder,
          })),
      })),
    )
  }),
)
