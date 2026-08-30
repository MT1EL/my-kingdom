import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { env } from '../env.ts'
import { ApiError } from '../lib/http.ts'
import { resolveSession } from '../lib/sessions.ts'
import type { User, UserRole } from '../../../shared/types.ts'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Set by `attachUser` on every request; null when signed out. */
      user?: User | null
    }
  }
}

export const readSessionToken = (req: Request): string | undefined => {
  const signed = req.signedCookies?.[env.session.cookieName]
  return typeof signed === 'string' ? signed : undefined
}

/** Resolves the session on every request without requiring one. */
export const attachUser: RequestHandler = (req, _res, next) => {
  resolveSession(readSessionToken(req))
    .then((user) => {
      req.user = user
      next()
    })
    .catch(next)
}

/** Rejects the request unless a moderator is signed in. */
export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(ApiError.unauthorized())
    return
  }
  next()
}

/** Rejects the request unless the signed-in user holds one of `roles`. */
export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      next(ApiError.unauthorized())
      return
    }
    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden())
      return
    }
    next()
  }
