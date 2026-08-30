import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'
import { env } from '../env.ts'
import { ApiError } from '../lib/http.ts'
import type { ApiErrorBody } from '../../../shared/types.ts'

/** 404 for anything no route matched. */
export const notFoundHandler: RequestHandler = (_req, res) => {
  const body: ApiErrorBody = {
    error: { code: 'NOT_FOUND', message: 'ასეთი მისამართი არ არსებობს.' },
  }
  res.status(404).json(body)
}

/** Flattens a Zod failure into `field → message`. */
function fieldsFromZod(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    fields[key] ??= issue.message
  }
  return fields
}

/**
 * The single place that turns a thrown value into a response body.
 * Unexpected errors are logged in full but reported generically — an
 * internal message (or a SQL error) must never reach a visitor.
 */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    const body: ApiErrorBody = {
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    }
    res.status(error.status).json(body)
    return
  }

  if (error instanceof ZodError) {
    const body: ApiErrorBody = {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'შევსებული მონაცემები არასწორია.',
        fields: fieldsFromZod(error),
      },
    }
    res.status(400).json(body)
    return
  }

  // Multer rejects oversized uploads with this code.
  if (typeof error === 'object' && error && (error as { code?: string }).code === 'LIMIT_FILE_SIZE') {
    const body: ApiErrorBody = {
      error: {
        code: 'FILE_TOO_LARGE',
        message: `ფაილი ძალიან დიდია (მაქსიმუმ ${Math.round(env.maxUploadBytes / 1024 / 1024)}MB).`,
      },
    }
    res.status(413).json(body)
    return
  }

  console.error('[api] unhandled error:', error)

  const body: ApiErrorBody = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'სერვერზე მოულოდნელი შეცდომა მოხდა. სცადეთ თავიდან.',
    },
  }
  res.status(500).json(body)
}
