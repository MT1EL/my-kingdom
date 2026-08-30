import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.ts'
import { bookingsAdminRouter } from './bookings.ts'
import { contentAdminRouter } from './content.ts'
import { scheduleRouter } from './schedule.ts'
import { settingsRouter } from './settings.ts'
import { uploadsRouter } from './uploads.ts'
import { usersRouter } from './users.ts'

/* ------------------------------------------------------------------
   Everything under /api/admin. Mounted behind `requireAuth` in one place,
   so no individual route can accidentally be left public.
------------------------------------------------------------------- */

export const adminRouter: Router = Router()

adminRouter.use(requireAuth)
// Nothing a moderator sees should ever be cached by a proxy or the browser.
adminRouter.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

adminRouter.use('/settings', settingsRouter)
adminRouter.use('/schedule', scheduleRouter)
adminRouter.use('/bookings', bookingsAdminRouter)
adminRouter.use('/uploads', uploadsRouter)
adminRouter.use('/users', usersRouter)
adminRouter.use('/', contentAdminRouter)
