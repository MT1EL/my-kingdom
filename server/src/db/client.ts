import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { env } from '../env.ts'
import * as schema from './schema.ts'

/* ------------------------------------------------------------------
   Database handle.

   One connection pool for the process. Managed Postgres almost always
   requires TLS but issues certificates from its own internal authority,
   so verification is relaxed for those hosts — see `needsTls` below.
------------------------------------------------------------------- */

if (!env.databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set.\n' +
      'Locally: start Postgres and put its URL in server/.env — see server/.env.example.\n' +
      'On Render: attach the database and copy its Internal Database URL.',
  )
}

/**
 * Localhost Postgres normally has no TLS at all; a hosted one requires it.
 * Getting this wrong is the most common first-connection failure, so it is
 * decided from the URL rather than left to the caller.
 */
const isLocal = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(env.databaseUrl)

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  // A free instance allows few connections, and this API is not busy.
  max: env.databasePoolSize,
  connectionTimeoutMillis: 15_000,
  idleTimeoutMillis: 30_000,
})

// A pool error with no listener would take the process down.
pool.on('error', (error) => {
  console.error('[db] idle client error:', error.message)
})

export const db = drizzle(pool, { schema })

/** Closes the pool on shutdown. */
export const closeDatabase = (): Promise<void> => pool.end()

export { schema }
