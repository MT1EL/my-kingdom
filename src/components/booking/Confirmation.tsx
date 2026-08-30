import { Link } from 'react-router-dom'
import { CalendarDays, CircleCheckBig, Clock, Copy, PartyPopper, Phone } from 'lucide-react'
import { useState } from 'react'
import type { BookingDraft, BookingRequestResult } from '@/types'
import { useProgram, useSite } from '@/content'
import { formatDateWithYear } from '@/lib/date'
import { LinkButton, Button, AnchorButton } from '@/components/ui/Button'
import { FacebookIcon } from '@/components/ui/SocialIcons'

interface ConfirmationProps {
  draft: BookingDraft
  result: BookingRequestResult
  onReset: () => void
}

export function Confirmation({ draft, result, onReset }: ConfirmationProps) {
  const program = useProgram(draft.programId)
  const site = useSite()
  const [copied, setCopied] = useState(false)

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(result.reference)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="relative mx-auto grid size-20 place-items-center rounded-full bg-mint-100 text-mint-600">
        <CircleCheckBig className="size-10" strokeWidth={2} />
        <span
          aria-hidden="true"
          className="absolute -right-3 -top-3 animate-float text-3xl"
        >
          🎉
        </span>
      </div>

      <h1 className="mt-7 text-balance text-3xl leading-tight text-royal-950 sm:text-4xl">
        მოთხოვნა მიღებულია!
      </h1>

      <p className="mt-4 text-pretty leading-relaxed text-royal-900/70">
        გმადლობთ, {draft.parentName || 'ძვირფასო მშობელო'}. თქვენი ჯავშნის მოთხოვნა ჩვენამდე
        მოვიდა. <strong className="text-royal-950">ჯავშანი ჯერ არ არის დადასტურებული</strong> —
        ჩვენი გუნდი დაგიკავშირდებათ ნომერზე {draft.phone} დეტალებისა და ღირებულების
        შესათანხმებლად.
      </p>

      <div className="mt-8 rounded-4xl border border-royal-100 bg-white p-6 text-left shadow-soft sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-royal-100 pb-5">
          <div>
            <p className="text-sm font-semibold text-royal-900/55">მოთხოვნის ნომერი</p>
            <p className="mt-1 font-display text-xl font-bold text-royal-950">
              {result.reference}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={copyReference}>
            <Copy className="size-4" />
            {copied ? 'დაკოპირდა' : 'დააკოპირე'}
          </Button>
        </div>

        <ul className="mt-5 flex flex-col gap-4">
          <li className="flex items-center gap-3">
            <CalendarDays className="size-5 shrink-0 text-royal-400" />
            <span className="text-royal-950">
              {draft.date ? formatDateWithYear(draft.date) : '—'}
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Clock className="size-5 shrink-0 text-royal-400" />
            <span className="text-royal-950">{draft.time ?? '—'}</span>
          </li>
          <li className="flex items-center gap-3">
            <PartyPopper className="size-5 shrink-0 text-royal-400" />
            <span className="text-royal-950">{program?.title ?? '—'}</span>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="mt-0.5 size-5 shrink-0 text-royal-400" />
            <span className="text-royal-950">
              {draft.parentName} · {draft.phone}
              {draft.email && ` · ${draft.email}`}
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <LinkButton to="/">დაბრუნდი მთავარზე</LinkButton>
        <Button variant="outline" onClick={onReset}>
          ახალი მოთხოვნის გაგზავნა
        </Button>
        {site.social.facebook && (
          <AnchorButton
            href={site.social.facebook}
            target="_blank"
            rel="noreferrer noopener"
            variant="outline"
          >
            <FacebookIcon className="size-4" />
            დაგვიკავშირდი
          </AnchorButton>
        )}
      </div>

      <p className="mt-6 text-sm text-royal-900/55">
        კითხვები გაქვთ? ნახეთ{' '}
        <Link to="/location" className="font-semibold text-royal-700 underline underline-offset-4">
          საკონტაქტო გვერდი
        </Link>
        .
      </p>
    </div>
  )
}
