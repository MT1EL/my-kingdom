/* ------------------------------------------------------------------
   Build-time feature switches.

   Read from the site's environment (a local `.env`, Netlify, Render) and
   baked into the bundle by Vite, so a switch is flipped by a rebuild
   rather than at runtime. The code behind a switch stays in the
   repository — turning it back on is a one-line change, not a revert.
------------------------------------------------------------------- */

/**
 * Whether families can request a booking on the site.
 *
 * `VITE_BOOKING_ENABLED=false` hides every way into the booking flow: the
 * navbar and footer buttons, the calls to action on every page, and the
 * `/booking` route itself, which then redirects home so existing links and
 * bookmarks do not land on a 404. Anything else (or unset) leaves it on.
 *
 * This hides the interface only. Turn the API's `BOOKING_ENABLED` off as
 * well, or its booking endpoints stay open to anyone who calls them
 * directly.
 */
export const bookingEnabled = import.meta.env?.VITE_BOOKING_ENABLED !== 'false'
