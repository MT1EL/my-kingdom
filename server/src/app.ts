import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Express } from 'express'
import { env } from './env.ts'
import { ApiError } from './lib/http.ts'
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
  app.use(
    env.uploadUrlPath,
    express.static(env.uploadDir, {
      maxAge: '365d',
      immutable: true,
      index: false,
      dotfiles: 'ignore',
    }),
  )

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() })
  })

  app.use('/api/auth', authRouter)
  app.use('/api', contentRouter)
  app.use('/api', bookingsRouter)
  app.use('/api/admin', adminRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
