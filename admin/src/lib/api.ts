import type { ApiErrorBody } from '@shared/types'

/* ------------------------------------------------------------------
   API client for the dashboard.

   Same contract as the public site's client, plus the write verbs and
   multipart upload the dashboard needs. `credentials: 'include'` sends
   the session cookie on every call.
------------------------------------------------------------------- */

const RAW_BASE = import.meta.env?.VITE_API_URL ?? ''

/**
 * The API's origin, normalised.
 *
 * Accepts a full URL or a bare hostname, and trims a trailing "/api" —
 * every path here already starts with it, so pasting the endpoint instead
 * of the origin would otherwise produce "/api/api/…".
 */
export const API_BASE = (() => {
  if (!RAW_BASE) return ''
  const withScheme = /^https?:\/\//.test(RAW_BASE) ? RAW_BASE : `https://${RAW_BASE}`
  return withScheme.replace(/\/+$/, '').replace(/\/api$/, '')
})()

const BASE_URL = API_BASE

/**
 * Resolves a stored image path against the API.
 *
 * Photos are saved as "/uploads/…", which is correct when the dashboard is
 * served by the API. Hosted separately, the browser would resolve them
 * against the dashboard's own origin and show a broken image, so the API's
 * origin goes back in front. Absolute URLs pass through untouched.
 */
export function mediaUrl(src: string): string {
  if (!src || !API_BASE) return src
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) return src
  return src.startsWith('/') ? `${API_BASE}${src}` : src
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  /** Per-field messages from the server, keyed by field name. */
  readonly fields: Record<string, string>

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }

  /** True when the session has expired or was never established. */
  get isUnauthorized(): boolean {
    return this.status === 401
  }
}

const NETWORK_MESSAGE = 'სერვერთან კავშირი ვერ დამყარდა. შეამოწმეთ, გაშვებულია თუ არა API.'

async function parse(response: Response): Promise<unknown> {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function send<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, credentials: 'include' })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_MESSAGE)
  }

  const payload = await parse(response)

  if (!response.ok) {
    const body = (payload as ApiErrorBody | null)?.error
    throw new ApiError(
      response.status,
      body?.code ?? 'UNKNOWN',
      body?.message ?? 'მოულოდნელი შეცდომა. სცადეთ თავიდან.',
      body?.fields ?? {},
    )
  }

  return payload as T
}

const json = (body: unknown): RequestInit => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const api = {
  get: <T>(path: string, signal?: AbortSignal): Promise<T> => send<T>(path, { method: 'GET', signal }),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    send<T>(path, { method: 'POST', ...(body === undefined ? {} : json(body)) }),
  put: <T>(path: string, body: unknown): Promise<T> => send<T>(path, { method: 'PUT', ...json(body) }),
  patch: <T>(path: string, body: unknown): Promise<T> =>
    send<T>(path, { method: 'PATCH', ...json(body) }),
  delete: (path: string): Promise<void> => send<void>(path, { method: 'DELETE' }),

  /** Multipart upload — the browser sets the boundary, so no Content-Type here. */
  upload: <T>(path: string, file: File): Promise<T> => {
    const form = new FormData()
    form.append('file', file)
    return send<T>(path, { method: 'POST', body: form })
  },
}

export interface UploadResult {
  id: string
  url: string
  renditions: Record<string, string>
  width: number
  height: number
  bytes: number
}
