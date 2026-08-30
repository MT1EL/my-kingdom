import type { ApiErrorBody } from '@/types'

/* ------------------------------------------------------------------
   The site's HTTP client.

   One place that knows how to call the API and how a failure looks, so
   components deal with typed data and a single error shape instead of
   `fetch` mechanics.
------------------------------------------------------------------- */

/**
 * Where the API lives. Empty in development and in a single-domain
 * deployment (Vite proxies `/api`); set `VITE_API_URL` when the API is on
 * its own host, e.g. "https://api.mykingdom.ge".
 */
const BASE_URL = import.meta.env?.VITE_API_URL ?? ''

/** A failed request, carrying the API's own message so the UI can show it. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: Record<string, string>

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }

  /** True when the request never reached the server. */
  get isOffline(): boolean {
    return this.status === 0
  }
}

const NETWORK_MESSAGE = 'სერვერთან კავშირი ვერ დამყარდა. შეამოწმეთ ინტერნეტი და სცადეთ თავიდან.'

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Aborts the request; used by the content loader when a page unmounts. */
  signal?: AbortSignal
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      // Sends the session cookie. Harmless on the public site, required once
      // the dashboard shares this client.
      credentials: 'include',
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch (error) {
    // An aborted request is the caller's own doing — let it through untouched
    // so it is not reported to the visitor as a failure.
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_MESSAGE)
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const error = (payload as ApiErrorBody | null)?.error
    throw new ApiError(
      response.status,
      error?.code ?? 'UNKNOWN',
      error?.message ?? 'მოულოდნელი შეცდომა. სცადეთ თავიდან.',
      error?.fields ?? {},
    )
  }

  return payload as T
}

export const get = <T>(path: string, signal?: AbortSignal): Promise<T> =>
  request<T>(path, { method: 'GET', signal })

export const post = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>(path, { method: 'POST', body })
