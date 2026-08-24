import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Loader2, Send } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { StepIndicator, type StepMeta } from '@/components/booking/StepIndicator'
import { DateStep } from '@/components/booking/DateStep'
import { TimeStep } from '@/components/booking/TimeStep'
import { ProgramStep } from '@/components/booking/ProgramStep'
import { ExtrasStep } from '@/components/booking/ExtrasStep'
import { DetailsStep } from '@/components/booking/DetailsStep'
import { ReviewStep } from '@/components/booking/ReviewStep'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { Confirmation } from '@/components/booking/Confirmation'
import { submitBookingRequest } from '@/lib/api'
import { getProgram } from '@/data/programs'
import { hasErrors, validateDetails } from '@/lib/validation'
import type { BookingDraft, BookingRequestResult, FieldErrors } from '@/types'
import { usePageMeta } from '@/lib/usePageMeta'

const steps: StepMeta[] = [
  { id: 1, label: 'თარიღი' },
  { id: 2, label: 'დრო' },
  { id: 3, label: 'პროგრამა' },
  { id: 4, label: 'დამატებები' },
  { id: 5, label: 'დეტალები' },
  { id: 6, label: 'შეჯამება' },
]

const emptyDraft: BookingDraft = {
  date: null,
  time: null,
  programId: null,
  extraIds: [],
  childName: '',
  childAge: '',
  childrenCount: '',
  parentName: '',
  phone: '',
  email: '',
  notes: '',
}

export default function BookingPage() {
  usePageMeta(
    'დაჯავშნე დაბადების დღე — ჩემი სამეფო',
    'აირჩიეთ თარიღი, დრო და პროგრამა და გამოგვიგზავნეთ ჯავშნის მოთხოვნა — დაგიკავშირდებით დეტალების შესათანხმებლად.',
  )

  const [searchParams, setSearchParams] = useSearchParams()
  const preselected = searchParams.get('program')

  const [draft, setDraft] = useState<BookingDraft>(() => ({
    ...emptyDraft,
    programId: getProgram(preselected)?.id ?? null,
  }))
  const [step, setStep] = useState(1)
  const [maxReached, setMaxReached] = useState(1)
  const [errors, setErrors] = useState<FieldErrors<BookingDraft>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<BookingRequestResult | null>(null)

  const contentRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  /** A ?program= id is consumed once, then dropped so the URL stays clean. */
  useEffect(() => {
    if (!preselected) return
    const program = getProgram(preselected)
    if (program) {
      setDraft((current) => ({ ...current, programId: program.id }))
    }
    const next = new URLSearchParams(searchParams)
    next.delete('program')
    setSearchParams(next, { replace: true })
  }, [preselected, searchParams, setSearchParams])

  /** Keep the active step in view when navigating between them. */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step, result])

  const update = useCallback(
    <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => {
      setDraft((current) => ({ ...current, [key]: value }))
      setErrors((current) => ({ ...current, [key]: undefined }))
    },
    [],
  )

  const goTo = useCallback((next: number) => {
    setStep(next)
    setMaxReached((current) => Math.max(current, next))
  }, [])

  const canContinue = useMemo(() => {
    switch (step) {
      case 1:
        return Boolean(draft.date)
      case 2:
        return Boolean(draft.time)
      case 3:
        return Boolean(draft.programId)
      case 4:
        return true
      case 5:
        return true
      default:
        return true
    }
  }, [draft.date, draft.programId, draft.time, step])

  const handleNext = () => {
    if (step === 5) {
      const found = validateDetails(draft)
      setErrors(found)
      if (hasErrors(found)) {
        // Focus the first field that failed so the error is not missed.
        const firstKey = Object.keys(found)[0]
        document.getElementById(firstKey)?.focus()
        return
      }
    }
    if (step < steps.length) goTo(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    const found = validateDetails(draft)
    setErrors(found)
    if (hasErrors(found) || !draft.date || !draft.time || !draft.programId) {
      setSubmitError('ზოგიერთი ველი არასწორადაა შევსებული — გთხოვთ, შეამოწმოთ დეტალების ნაბიჯი.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const response = await submitBookingRequest({
        ...draft,
        date: draft.date,
        time: draft.time,
        programId: draft.programId,
      })
      setResult(response)
    } catch {
      setSubmitError('მოთხოვნის გაგზავნა ვერ მოხერხდა. სცადეთ ხელახლა ან დაგვიკავშირდით Facebook-ზე.')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setDraft(emptyDraft)
    setErrors({})
    setResult(null)
    setSubmitError(null)
    setStep(1)
    setMaxReached(1)
  }

  if (result) {
    return (
      <>
        <PageHeader
          eyebrow="ჯავშანი"
          title="მადლობა მოთხოვნისთვის"
          description="მალე დაგიკავშირდებით და ზეიმის დეტალებს ერთად შევათანხმებთ."
        />
        <section ref={contentRef} className="py-14 sm:py-20">
          <Container>
            <Confirmation draft={draft} result={result} onReset={reset} />
          </Container>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="ჯავშანი"
        title="დაჯავშნე დაბადების დღე"
        description="ექვსი მოკლე ნაბიჯი — თარიღი, დრო, პროგრამა და საკონტაქტო. გაგზავნის შემდეგ დაგიკავშირდებით ჯავშნის დასადასტურებლად."
      />

      <section className="py-10 sm:py-16">
        <Container size="wide">
          <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-start lg:gap-10">
            <div ref={contentRef} className="flex scroll-mt-28 flex-col gap-7">
              <StepIndicator
                steps={steps}
                current={step}
                maxReached={maxReached}
                onSelect={setStep}
              />

              {step === 1 && (
                <DateStep
                  value={draft.date}
                  onChange={(date) => {
                    setDraft((current) => ({
                      ...current,
                      date,
                      // A new date invalidates a previously picked slot.
                      time: current.date === date ? current.time : null,
                    }))
                  }}
                />
              )}

              {step === 2 && draft.date && (
                <TimeStep
                  date={draft.date}
                  value={draft.time}
                  onChange={(time) => update('time', time)}
                />
              )}

              {step === 3 && (
                <ProgramStep
                  value={draft.programId}
                  onChange={(programId) => update('programId', programId)}
                />
              )}

              {step === 4 && (
                <ExtrasStep
                  value={draft.extraIds}
                  onChange={(extraIds) => update('extraIds', extraIds)}
                />
              )}

              {step === 5 && <DetailsStep draft={draft} errors={errors} onChange={update} />}

              {step === 6 && <ReviewStep draft={draft} onEdit={setStep} error={submitError} />}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={step === 1 || submitting}
                  className="sm:w-auto"
                >
                  <ArrowLeft className="size-4" />
                  უკან
                </Button>

                {step < steps.length ? (
                  <Button size="lg" onClick={handleNext} disabled={!canContinue}>
                    შემდეგი
                    <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        იგზავნება…
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        გააგზავნე ჯავშნის მოთხოვნა
                      </>
                    )}
                  </Button>
                )}
              </div>

              {!canContinue && step < steps.length && (
                <p className="text-center text-sm text-royal-900/50 sm:text-right">
                  გასაგრძელებლად აირჩიეთ ვარიანტი ამ ნაბიჯზე.
                </p>
              )}
            </div>

            <div className="lg:sticky lg:top-28">
              <BookingSummary draft={draft} />
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
