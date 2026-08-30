import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/auth/AuthProvider'

/* ------------------------------------------------------------------
   Loading data from the API.

   Every page needs the same four things — data, a loading flag, an error,
   and a way to reload after a write. A 401 anywhere means the session has
   expired, so it is reported to the auth layer once here rather than
   handled page by page.
------------------------------------------------------------------- */

export interface Resource<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  reload: () => void
  /** Replaces the local copy after a write, so the UI updates without a refetch. */
  set: (value: T) => void
}

export function useApiResource<T>(path: string | null): Resource<T> {
  const { clear } = useAuth()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [attempt, setAttempt] = useState(0)

  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    if (path === null) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    api
      .get<T>(path, controller.signal)
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        const failure =
          cause instanceof ApiError ? cause : new ApiError(0, 'UNKNOWN', 'ჩატვირთვა ვერ მოხერხდა.')
        if (failure.isUnauthorized) clear()
        setError(failure)
        setLoading(false)
      })

    return () => controller.abort()
  }, [path, attempt, clear])

  return { data, loading, error, reload, set: setData }
}

/**
 * Turns any thrown value into a message worth showing.
 * Keeps every catch block in the dashboard down to one line.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'მოულოდნელი შეცდომა. სცადეთ თავიდან.'
}

export function errorFields(error: unknown): Record<string, string> {
  return error instanceof ApiError ? error.fields : {}
}
