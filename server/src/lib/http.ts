import type { NextFunction, Request, RequestHandler, Response } from 'express'

/* ------------------------------------------------------------------
   HTTP helpers.

   Every failure leaves a route as an `ApiError`, so the error middleware
   can render one consistent body (see `ApiErrorBody` in shared/types).
------------------------------------------------------------------- */

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string>

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }

  static badRequest(message: string, fields?: Record<string, string>) {
    return new ApiError(400, 'BAD_REQUEST', message, fields)
  }

  static unauthorized(message = 'ავტორიზაცია საჭიროა.') {
    return new ApiError(401, 'UNAUTHORIZED', message)
  }

  static forbidden(message = 'ამ მოქმედების ნებართვა არ გაქვთ.') {
    return new ApiError(403, 'FORBIDDEN', message)
  }

  static notFound(message = 'მოთხოვნილი ჩანაწერი ვერ მოიძებნა.') {
    return new ApiError(404, 'NOT_FOUND', message)
  }

  static conflict(code: string, message: string) {
    return new ApiError(409, code, message)
  }

  /** A feature that exists but is switched off, rather than a failure. */
  static unavailable(code: string, message: string) {
    return new ApiError(503, code, message)
  }
}

/**
 * Reads a route parameter as a string.
 * Express types `req.params` values as `string | string[]` because a pattern
 * can repeat; none of ours do, so this narrows in one place instead of at
 * every call site.
 */
export function param(req: Request, name: string): string {
  const value = req.params[name]
  if (typeof value !== 'string' || value.length === 0) {
    throw ApiError.badRequest(`მისამართის პარამეტრი "${name}" არასწორია.`)
  }
  return value
}

/** Wraps an async route so a rejected promise reaches the error middleware. */
export const route =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    handler(req, res, next).catch(next)
  }
