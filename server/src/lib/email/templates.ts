import type { Booking } from '../../../../shared/types.ts'

/* ------------------------------------------------------------------
   The two messages a booking request produces.

   Written as small inline-styled tables rather than a templating library:
   email clients support roughly 2005-era HTML, and the whole point is that
   these render the same in Gmail, Outlook and a phone's mail app.

   Every message also carries a plain-text alternative — some clients show
   it, and spam filters treat HTML-only mail with suspicion.
------------------------------------------------------------------- */

export interface Message {
  subject: string
  html: string
  text: string
}

const MONTHS = [
  'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
  'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი',
]

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`)
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}, ${date.getUTCFullYear()}`
}

/** Email bodies are HTML, and every value in them is visitor-supplied. */
function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface Row {
  label: string
  value: string
}

const rows = (entries: Row[]): string =>
  entries
    .filter((entry) => entry.value)
    .map(
      (entry) => `
        <tr>
          <td style="padding:8px 0;color:#4c2a60;opacity:0.65;font-size:14px;white-space:nowrap;vertical-align:top">${escape(entry.label)}</td>
          <td style="padding:8px 0 8px 16px;color:#2f143f;font-size:14px;font-weight:600">${escape(entry.value)}</td>
        </tr>`,
    )
    .join('')

const textRows = (entries: Row[]): string =>
  entries.filter((entry) => entry.value).map((entry) => `${entry.label}: ${entry.value}`).join('\n')

function layout(options: {
  siteName: string
  heading: string
  intro: string
  body: string
  footer: string
}): string {
  return `<!doctype html>
<html lang="ka">
<body style="margin:0;padding:24px 12px;background:#f6f5f8;font-family:'Noto Sans Georgian',-apple-system,Segoe UI,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8d8f5">
    <tr>
      <td style="background:linear-gradient(135deg,#70378f,#cd2b94 55%,#f99b07);padding:24px;color:#ffffff">
        <div style="font-size:13px;opacity:0.85">${escape(options.siteName)}</div>
        <div style="font-size:20px;font-weight:700;margin-top:4px">${escape(options.heading)}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px">
        <p style="margin:0 0 16px;color:#2f143f;font-size:15px;line-height:1.6">${options.intro}</p>
        ${options.body}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 24px 24px;border-top:1px solid #f3ebfa;color:#4c2a60;opacity:0.6;font-size:12px;line-height:1.6">
        ${options.footer}
      </td>
    </tr>
  </table>
</body>
</html>`
}

interface Context {
  booking: Booking
  siteName: string
  /** Human title of the chosen programme, when it is still on offer. */
  programTitle: string | null
  extraTitles: string[]
  /** Where the venue reads its requests. */
  dashboardUrl: string | null
  /** Shown to the family so they can reach a human. */
  venuePhone: string | null
}

/* ------------------------ to the family -------------------------- */

export function familyRequestReceived(context: Context): Message {
  const { booking, siteName } = context

  const details: Row[] = [
    { label: 'ნომერი', value: booking.reference },
    { label: 'თარიღი', value: formatDate(booking.date) },
    { label: 'დრო', value: booking.time },
    { label: 'პროგრამა', value: context.programTitle ?? '—' },
    { label: 'დამატებები', value: context.extraTitles.join(', ') },
    { label: 'დაბადების დღის ბავშვი', value: `${booking.childName}, ${booking.childAge} წლის` },
    { label: 'სტუმრები', value: `${booking.childrenCount} ბავშვი` },
  ]

  const contactLine = context.venuePhone
    ? `კითხვის შემთხვევაში დაგვირეკეთ: ${escape(context.venuePhone)}.`
    : 'კითხვის შემთხვევაში გვიპასუხეთ ამ წერილზე.'

  return {
    subject: `თქვენი მოთხოვნა მიღებულია — ${booking.reference}`,
    html: layout({
      siteName,
      heading: 'მოთხოვნა მიღებულია',
      intro: `გმადლობთ, ${escape(booking.parentName)}. თქვენი ჯავშნის მოთხოვნა ჩვენამდე მოვიდა.`,
      body: `
        <div style="background:#fff2c6;border-radius:12px;padding:12px 14px;margin:0 0 20px;color:#943e0c;font-size:14px;line-height:1.6">
          <strong>ჯავშანი ჯერ არ არის დადასტურებული.</strong>
          დაგიკავშირდებით დეტალებისა და ღირებულების შესათანხმებლად.
        </div>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${rows(details)}</table>`,
      footer: `${contactLine}<br />ეს წერილი გამოგზავნილია, რადგან ჯავშნის ფორმაში მიუთითეთ ეს ელფოსტა.`,
    }),
    text: [
      `გმადლობთ, ${booking.parentName}. თქვენი ჯავშნის მოთხოვნა მიღებულია.`,
      '',
      'ჯავშანი ჯერ არ არის დადასტურებული — დაგიკავშირდებით დეტალების შესათანხმებლად.',
      '',
      textRows(details),
      '',
      context.venuePhone ? `კითხვის შემთხვევაში: ${context.venuePhone}` : '',
      siteName,
    ]
      .filter(Boolean)
      .join('\n'),
  }
}

/* ------------------------- to the venue -------------------------- */

export function venueNewRequest(context: Context): Message {
  const { booking, siteName } = context

  const details: Row[] = [
    { label: 'ნომერი', value: booking.reference },
    { label: 'თარიღი', value: formatDate(booking.date) },
    { label: 'დრო', value: booking.time },
    { label: 'პროგრამა', value: context.programTitle ?? '—' },
    { label: 'დამატებები', value: context.extraTitles.join(', ') },
    { label: 'ბავშვი', value: `${booking.childName}, ${booking.childAge} წლის` },
    { label: 'სტუმრები', value: `${booking.childrenCount} ბავშვი` },
    { label: 'მშობელი', value: booking.parentName },
    { label: 'ტელეფონი', value: booking.phone },
    { label: 'ელფოსტა', value: booking.email ?? '' },
    { label: 'კომენტარი', value: booking.notes },
  ]

  const action = context.dashboardUrl
    ? `<p style="margin:20px 0 0">
         <a href="${escape(context.dashboardUrl)}/bookings"
            style="display:inline-block;background:#70378f;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:600">
           პანელში გახსნა
         </a>
       </p>`
    : ''

  return {
    subject: `ახალი ჯავშნის მოთხოვნა — ${formatDate(booking.date)} ${booking.time}`,
    html: layout({
      siteName,
      heading: 'ახალი ჯავშნის მოთხოვნა',
      intro: `<strong>${escape(booking.parentName)}</strong> ითხოვს ზეიმს ${escape(formatDate(booking.date))}, ${escape(booking.time)}.`,
      body: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${rows(details)}</table>${action}`,
      footer:
        'დრო კალენდრიდან მხოლოდ დადასტურების შემდეგ ქრება — სანამ არ დაადასტურებთ, სხვა ოჯახსაც შეუძლია იმავე საათის მოთხოვნა.',
    }),
    text: [
      `ახალი ჯავშნის მოთხოვნა — ${formatDate(booking.date)} ${booking.time}`,
      '',
      textRows(details),
      '',
      context.dashboardUrl ? `${context.dashboardUrl}/bookings` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  }
}
