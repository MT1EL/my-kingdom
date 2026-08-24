# ჩემი სამეფო — My Kingdom

Website for **ჩემი სამეფო**, a children's birthday party venue in Tbilisi, Georgia.

Stack: **React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router + Lucide**.
Primary language: **Georgian (ka)**. Mobile-first, fully responsive.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

## Pages

| Route       | What it does |
|-------------|--------------|
| `/`         | Hero, intro, featured programmes, activities, why-us, gallery preview, booking CTA |
| `/programs` | All birthday programmes with an age filter; each card links to `/booking?program=<id>` |
| `/gallery`  | Filterable masonry gallery with a keyboard- and swipe-navigable lightbox |
| `/location` | Contact details, opening hours, Google Map, directions |
| `/booking`  | Six-step booking request flow with validation and a confirmation screen |
| `*`         | 404 page |

## ⚠️ Placeholders to replace before launch

Nothing on this site invents a fact about the business. Anything unknown is either
`null` in the config (the UI then renders an honest "დასაზუსტებელია" chip instead of a
fake value or a dead link) or marked with a `⚠️ PLACEHOLDER` comment in the data file.

Work through these five files and the site is ready:

### `src/data/site.ts` — contact & map
- `contact.phone`, `contact.phoneDisplay`, `contact.email`, `contact.address` — currently `null`.
  Fill them in and they automatically become `tel:` / `mailto:` links.
- `social.instagram` — `null`; set it and the icon appears in the footer.
- `map.mapQuery` — set to the venue's real address, then flip `map.isExactLocation` to `true`
  to remove the "map shows Tbilisi for now" notice. The embedded map and the
  "მარშრუტის აგება" button both derive from this one value.
- `openingHours[].hours` — `null` until confirmed.
- `priceNote` — the single place any price-related wording lives. **No prices are hard-coded anywhere.**
- `booking.minLeadDays` / `maxAheadDays` / `maxChildren` — booking window rules.

### `src/data/programs.ts` — birthday themes
Titles, descriptions, age ranges, durations and photos. Ages and durations are a
starting point for the owner to correct, not confirmed offers.

### `src/data/activities.ts` — activities + "why choose us"
`icon` must be a `lucide-react` export **that is registered in
`src/components/ui/Icon.tsx`** (an explicit map keeps the bundle small — add new icons there).

### `src/data/gallery.ts` — photos
Every image is temporary stock photography from Unsplash. Replace with the venue's own
photos: put files in `public/gallery/` and set `src: '/gallery/name.jpg'`.
`span: 'tall' | 'wide'` controls the masonry layout.

### `src/data/availability.ts` — opening pattern
`schedule` maps weekday → slot start times (`null` = closed). Currently Monday is closed
and roughly a third of slots are marked booked by a deterministic hash so the flow can be
demonstrated.

## Connecting a backend

There is **no backend yet**, and the site never claims a booking is confirmed — it submits a
*booking request* and tells the family the venue will call back.

All server interaction is isolated in **`src/lib/api.ts`**. Swap the mock bodies for `fetch`
calls and nothing else changes:

```
GET  /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD  → DayAvailability[]
POST /api/booking-requests                            → BookingRequestResult
```

Request/response shapes live in `src/types/index.ts`.

## Structure

```
src/
  components/
    layout/     Navbar, Footer, Layout (+ scroll restoration, skip link)
    ui/         Button, Container, SectionHeading, SmartImage, Reveal, Icon, …
    home/       Hero, Intro, ProgramsPreview, Activities, WhyUs, GalleryPreview, BookingCta
    programs/   ProgramCard
    gallery/    Lightbox
    booking/    StepIndicator, DateStep, TimeStep, ProgramStep, ExtrasStep,
                DetailsStep, ReviewStep, BookingSummary, Confirmation, Field
  data/         site.ts, programs.ts, activities.ts, gallery.ts, availability.ts, extras.ts
  lib/          api.ts (server boundary), date.ts, validation.ts, usePageMeta.ts, cn.ts
  pages/        HomePage, ProgramsPage, GalleryPage, LocationPage, BookingPage, NotFoundPage
  types/        shared domain types
```

## Notes

- Brand colours (`royal`, `candy`, `sun`, `mint`) are derived from the logo and defined as
  Tailwind theme tokens in `src/index.css`.
- Georgian has no uppercase, so `text-transform` is globally neutralised in `src/index.css` —
  don't reintroduce `uppercase` utilities.
- Fonts: Noto Serif Georgian (headings) + Noto Sans Georgian (body), loaded from Google Fonts.
- `SmartImage` shows a branded skeleton while loading and a fallback if a photo 404s, so a
  swapped-out image never leaves a broken icon.
- Animations respect `prefers-reduced-motion`.
