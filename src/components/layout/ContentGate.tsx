import type { ReactNode } from 'react'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { useContentState } from '@/content'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

/* ------------------------------------------------------------------
   Holds the site until its content has arrived.

   Every page reads from the same bundle, so there is no useful partial
   render: showing a header with no name and empty programme lists would
   be worse than a brief, deliberate loading state. Below this gate the
   content hooks are guaranteed to have data.
------------------------------------------------------------------- */

function LoadingScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-cream px-5" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5 text-center">
        <img
          src="/logo.png"
          alt=""
          width={72}
          height={72}
          className="size-18 animate-float object-contain"
        />
        <p className="text-royal-900/60">იტვირთება…</p>
      </div>
    </div>
  )
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-cream px-5">
      <Container size="narrow">
        <div
          role="alert"
          className="mx-auto flex max-w-lg flex-col items-center gap-5 rounded-4xl border border-royal-100 bg-white p-8 text-center shadow-soft sm:p-10"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-candy-100 text-candy-700">
            <TriangleAlert className="size-7" />
          </span>

          <div>
            <h1 className="text-2xl text-royal-950">საიტი ვერ ჩაიტვირთა</h1>
            <p className="mt-3 text-pretty leading-relaxed text-royal-900/65">{message}</p>
          </div>

          <Button onClick={onRetry}>
            <RefreshCw className="size-4" />
            სცადე თავიდან
          </Button>

          <p className="text-sm text-royal-900/50">
            თუ პრობლემა გრძელდება, დაგვიკავშირდით{' '}
            <a
              href="https://www.facebook.com/mykingdommmm"
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-royal-700 underline underline-offset-4"
            >
              Facebook-ზე
            </a>
            .
          </p>
        </div>
      </Container>
    </div>
  )
}

export function ContentGate({ children }: { children: ReactNode }) {
  const { content, loading, error, reload } = useContentState()

  if (loading && !content) return <LoadingScreen />
  if (error && !content) return <ErrorScreen message={error.message} onRetry={reload} />
  if (!content) return <LoadingScreen />

  return <>{children}</>
}
