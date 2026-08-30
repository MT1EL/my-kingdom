/**
 * Domain types.
 *
 * These now live in `shared/types.ts` so the site, the API and the dashboard
 * all describe the same shapes. This file re-exports them, which keeps every
 * existing `@/types` import working.
 */
export type * from '@shared/types'
