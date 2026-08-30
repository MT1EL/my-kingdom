import cookieParser from 'cookie-parser'
import cors from 'cors'
import { eq } from 'drizzle-orm'
import express, { type Express } from 'express'
import path from 'node:path'
import { db, schema } from './db/client.ts'
import { env, SERVER_ROOT } from './env.ts'
import { ApiError, route } from './lib/http.ts'
import { attachUser } from './middleware/auth.ts'
import { errorHandler, notFoundHandler } from './middleware/errors.ts'
import { adminRouter } from './routes/admin/index.ts'
import { authRouter } from './routes/auth.ts'
import { bookingsRouter } from './routes/bookings.ts'
import { contentRouter } from './routes/content.ts'

/* ------------------------------------------------------------------
   The Express application.

   Kept separate from `index.ts` (which listens) so tests and scripts can
   build the app without binding a port.
------------------------------------------------------------------- */

export function createApp(): Express {
  const app = express()

  // Behind nginx/Caddy in production; without this `req.ip` is the proxy's
  // address and the login rate limit would apply to everyone at once.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(
    cors({
      origin: (origin, callback) => {
        // Same-origin requests and curl send no Origin header.
        if (!origin || env.corsOrigins.includes(origin)) {
          callback(null, true)
          return
        }
        callback(ApiError.forbidden(`Origin ${origin} is not allowed.`))
      },
      credentials: true,
    }),
  )

  app.use(express.json({ limit: '256kb' }))
  app.use(cookieParser(env.session.secret))
  app.use(attachUser)

  // Uploaded images. Immutable because every rendition has a random name —
  // a changed photo is a new file, never a new version of the same URL.
  const imageCacheControl = 'public, max-age=31536000, immutable'

  if (env.storageDriver === 'database') {
    // The bytes live in Postgres, so they are read and streamed here rather
    // than served off the filesystem.
    app.get(
      `${env.uploadUrlPath}/:file`,
      route(async (req, res) => {
        const file = req.params.file
        if (typeof file !== 'string') throw ApiError.notFound()

        const rows = await db
          .select()
          .from(schema.imageFiles)
          .where(eq(schema.imageFiles.id, file))
          .limit(1)

        const image = rows[0]
        if (!image) throw ApiError.notFound()

        res.set('Content-Type', image.contentType)
        res.set('Cache-Control', imageCacheControl)
        res.send(image.data)
      }),
    )
  } else {
    app.use(
      env.uploadUrlPath,
      express.static(env.uploadDir, {
        maxAge: '365d',
        immutable: true,
        index: false,
        dotfiles: 'ignore',
      }),
    )
  }

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() })
  })

  app.use('/api/auth', authRouter)
  app.use('/api', contentRouter)
  app.use('/api', bookingsRouter)
  app.use('/api/admin', adminRouter)

  // Optionally serve the built dashboard from this same origin. That keeps
  // its login cookie first-party, which is the most reliable arrangement and
  // avoids depending on a static host being able to proxy to the API.
  if (env.serveAdmin) {
    const adminDist = path.resolve(SERVER_ROOT, '..', 'admin', 'dist')

    app.use(
      '/admin',
      express.static(adminDist, { index: false, maxAge: '1h' }),
    )
    // The dashboard is a single-page app: every unmatched path is its router's.
    app.get(/^\/admin(?:\/.*)?$/, (_req, res) => {
      res.sendFile(path.join(adminDist, 'index.html'))
    })
  }

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
