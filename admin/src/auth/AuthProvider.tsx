import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@shared/types'
import { api, ApiError } from '@/lib/api'

/* ------------------------------------------------------------------
   Who is signed in.

   The session lives in an httpOnly cookie, so the dashboard cannot read
   it directly — it asks `/api/auth/me` on boot instead. That also means a
   refresh keeps you signed in, and a expired session is discovered once,
   here, rather than by every page failing on its own.
------------------------------------------------------------------- */

interface AuthState {
  user: User | null
  /** True until the first `/me` has answered. */
  checking: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  /** Called when any request comes back 401, to drop back to the login screen. */
  clear: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    api
      .get<{ user: User | null }>('/api/auth/me', controller.signal)
      .then((result) => {
        setUser(result.user)
        setChecking(false)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        // A network failure is not a signed-out state, but there is nothing
        // useful to show without the API either — the login screen surfaces it.
        setUser(null)
        setChecking(false)
      })

    return () => controller.abort()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<{ user: User }>('/api/auth/login', { email, password })
    setUser(result.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } finally {
      // Even if the request fails, drop the local session — staying "signed in"
      // against a server that disagrees is worse than signing out twice.
      setUser(null)
    }
  }, [])

  const clear = useCallback(() => setUser(null), [])

  const value = useMemo<AuthState>(
    () => ({ user, checking, login, logout, clear }),
    [user, checking, login, logout, clear],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const state = useContext(AuthContext)
  if (!state) throw new Error('useAuth must be used inside <AuthProvider>')
  return state
}

/** Signed-in user, guaranteed. Only call inside the authenticated shell. */
export function useCurrentUser(): User {
  const { user } = useAuth()
  if (!user) throw new Error('useCurrentUser called while signed out')
  return user
}

export { ApiError }
