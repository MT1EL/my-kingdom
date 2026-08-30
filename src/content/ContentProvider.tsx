import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ContentBundle } from '@/types'
import { ApiError, get } from '@/lib/http'

/* ------------------------------------------------------------------
   Site content, loaded once.

   Everything a visitor reads — programmes, menu, gallery, contacts — comes
   from `GET /api/content` in a single request at boot. One payload means
   the site can never render half-updated content, and one round trip beats
   six for pages that have no reason to load at different times.

   Moderators change this content in the dashboard; nothing here is a
   constant in the bundle any more.
------------------------------------------------------------------- */

export interface ContentState {
  content: ContentBundle | null
  loading: boolean
  error: ApiError | null
  /** Re-fetches; wired to the "try again" button on the error screen. */
  reload: () => void
}

export const ContentContext = createContext<ContentState | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentBundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [attempt, setAttempt] = useState(0)

  const reload = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    get<ContentBundle>('/api/content', controller.signal)
      .then((bundle) => {
        setContent(bundle)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === 'AbortError') return
        setError(
          cause instanceof ApiError
            ? cause
            : new ApiError(0, 'UNKNOWN', 'საიტის მონაცემები ვერ ჩაიტვირთა.'),
        )
        setLoading(false)
      })

    return () => controller.abort()
  }, [attempt])

  const value = useMemo<ContentState>(
    () => ({ content, loading, error, reload }),
    [content, loading, error, reload],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
