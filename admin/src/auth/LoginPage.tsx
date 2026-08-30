import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'
import { errorMessage } from '@/lib/useResource'
import { Button, Card, Field, inputClasses } from '@/components/ui'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
    } catch (cause) {
      setError(errorMessage(cause))
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src="/logo.png" alt="" width={56} height={56} className="size-14 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-royal-950">მართვის პანელი</h1>
            <p className="mt-1 text-sm text-royal-900/60">ჩემი სამეფო</p>
          </div>
        </div>

        <Card>
          <form
            className="flex flex-col gap-4 p-6"
            onSubmit={(event) => {
              event.preventDefault()
              void submit()
            }}
          >
            <Field label="ელფოსტა" htmlFor="email" required>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClasses(Boolean(error))}
              />
            </Field>

            <Field label="პაროლი" htmlFor="password" required>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClasses(Boolean(error))}
              />
            </Field>

            {error && (
              <p role="alert" className="text-sm font-medium text-candy-700">
                {error}
              </p>
            )}

            <Button type="submit" loading={busy} className="mt-1">
              <LogIn className="size-4" />
              შესვლა
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
