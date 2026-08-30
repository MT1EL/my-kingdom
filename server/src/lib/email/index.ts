import { eq } from 'drizzle-orm'
import { db, schema } from '../../db/client.ts'
import { env } from '../../env.ts'
import type { Booking } from '../../../../shared/types.ts'
import { familyRequestReceived, venueNewRequest, type Message } from './templates.ts'

/* ------------------------------------------------------------------
   Sending mail.

   Two drivers, chosen by EMAIL_DRIVER:

     none    — logs what would have been sent. The default, so local
               development needs no account and no API key.
     resend  — sends through Resend's HTTP API.

   Nothing here is allowed to fail a booking. A family's request is the
   thing that matters; a notification that did not go out is a logged
   problem, not a reason to show them an error and lose the booking.
------------------------------------------------------------------- */

interface Envelope extends Message {
  to: string
}

type Driver = (envelope: Envelope) => Promise<void>

const logDriver: Driver = async (envelope) => {
  console.log(
    `[email] (not sent — EMAIL_DRIVER is "none")\n` +
      `        to:      ${envelope.to}\n` +
      `        subject: ${envelope.subject}`,
  )
}

const resendDriver: Driver = async (envelope) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.email.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.email.from,
      to: [envelope.to],
      subject: envelope.subject,
      html: envelope.html,
      text: envelope.text,
      ...(env.email.replyTo ? { reply_to: env.email.replyTo } : {}),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Resend refused the message (${response.status}): ${body.slice(0, 300)}`)
  }
}

const drivers: Record<string, Driver> = {
  none: logDriver,
  resend: resendDriver,
}

/** Sends, and turns any failure into a log line rather than an exception. */
async function deliver(envelope: Envelope, label: string): Promise<void> {
  const driver = drivers[env.email.driver] ?? logDriver

  try {
    await driver(envelope)
    if (env.email.driver !== 'none') {
      console.log(`[email] sent ${label} to ${envelope.to}`)
    }
  } catch (error) {
    console.error(`[email] failed to send ${label} to ${envelope.to}:`, error)
  }
}

/** Everything the templates need that does not live on the booking itself. */
async function gatherContext(booking: Booking) {
  const [settingsRows, programRows, extraRows] = await Promise.all([
    db.select().from(schema.siteSettings).limit(1),
    booking.programId
      ? db
          .select({ title: schema.programs.title })
          .from(schema.programs)
          .where(eq(schema.programs.id, booking.programId))
          .limit(1)
      : Promise.resolve([]),
    db.select({ id: schema.extras.id, title: schema.extras.title }).from(schema.extras),
  ])

  const settings = settingsRows[0]

  return {
    booking,
    siteName: settings?.name ?? 'ჩემი სამეფო',
    programTitle: programRows[0]?.title ?? null,
    extraTitles: booking.extraIds
      .map((id) => extraRows.find((extra) => extra.id === id)?.title)
      .filter((title): title is string => Boolean(title)),
    dashboardUrl: env.email.dashboardUrl,
    venuePhone: settings?.phoneDisplay ?? settings?.phone ?? null,
    /**
     * Where the venue's own notification goes. Configurable, but falling
     * back to the contact address the owner sets in the dashboard means it
     * keeps working without another environment variable to remember.
     */
    venueInbox: env.email.venueTo || settings?.email || null,
  }
}

/**
 * Notifies both sides that a request arrived.
 *
 * Deliberately not awaited by the route: the family's confirmation page
 * should not wait on an email provider, and must not fail because of one.
 */
export async function notifyBookingReceived(booking: Booking): Promise<void> {
  if (env.email.driver === 'none' && !env.isProduction) {
    // Keep the log quiet in development unless something is configured.
    console.log(`[email] booking ${booking.reference} received (no email driver configured)`)
    return
  }

  const context = await gatherContext(booking)

  if (context.venueInbox) {
    await deliver({ to: context.venueInbox, ...venueNewRequest(context) }, 'venue notification')
  } else {
    console.warn(
      `[email] no venue inbox for booking ${booking.reference} — set EMAIL_VENUE_TO, or fill in the contact email in the dashboard.`,
    )
  }

  if (booking.email) {
    await deliver(
      { to: booking.email, ...familyRequestReceived(context) },
      'family confirmation',
    )
  }
}
