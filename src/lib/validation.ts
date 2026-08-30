import type { BookingDraft, FieldErrors } from '@/types'

/** Georgian mobile numbers, with or without the +995 prefix and spacing. */
const PHONE_RE = /^(\+?995)?[\s-]?5\d{2}[\s-]?\d{2}[\s-]?\d{2}[\s-]?\d{2}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

export type DetailsField = 'childName' | 'childAge' | 'childrenCount' | 'parentName' | 'phone' | 'email'

export function normalisePhone(value: string): string {
  return value.replace(/[\s()-]/g, '')
}

/**
 * Validates the "parent & child details" step. Email is optional.
 *
 * `maxChildren` is a venue setting, so it is passed in rather than imported —
 * the server enforces the same limit when the request is submitted.
 */
export function validateDetails(
  draft: BookingDraft,
  maxChildren: number,
): FieldErrors<BookingDraft> {
  const errors: FieldErrors<BookingDraft> = {}

  if (!draft.childName.trim()) {
    errors.childName = 'შეავსეთ ბავშვის სახელი'
  } else if (draft.childName.trim().length < 2) {
    errors.childName = 'სახელი ძალიან მოკლეა'
  }

  const age = Number(draft.childAge)
  if (!draft.childAge.trim()) {
    errors.childAge = 'მიუთითეთ ასაკი'
  } else if (!Number.isFinite(age) || !Number.isInteger(age) || age < 1 || age > 17) {
    errors.childAge = 'ასაკი უნდა იყოს 1-დან 17-მდე'
  }

  const count = Number(draft.childrenCount)
  if (!draft.childrenCount.trim()) {
    errors.childrenCount = 'მიუთითეთ ბავშვების რაოდენობა'
  } else if (
    !Number.isFinite(count) ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > maxChildren
  ) {
    errors.childrenCount = `რაოდენობა უნდა იყოს 1-დან ${maxChildren}-მდე`
  }

  if (!draft.parentName.trim()) {
    errors.parentName = 'შეავსეთ მშობლის სახელი'
  } else if (draft.parentName.trim().length < 2) {
    errors.parentName = 'სახელი ძალიან მოკლეა'
  }

  if (!draft.phone.trim()) {
    errors.phone = 'შეავსეთ ტელეფონის ნომერი'
  } else if (!PHONE_RE.test(normalisePhone(draft.phone))) {
    errors.phone = 'ნომრის ფორმატი: 5XX XX XX XX'
  }

  if (draft.email.trim() && !EMAIL_RE.test(draft.email.trim())) {
    errors.email = 'ელფოსტის ფორმატი არასწორია'
  }

  if (draft.notes.length > 600) {
    errors.notes = 'ტექსტი 600 სიმბოლოს არ უნდა აღემატებოდეს'
  }

  return errors
}

export const hasErrors = (errors: FieldErrors<BookingDraft>): boolean =>
  Object.values(errors).some(Boolean)
