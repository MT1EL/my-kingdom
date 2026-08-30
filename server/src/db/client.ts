import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import fs from 'node:fs'
import path from 'node:path'
import { env } from '../env.ts'
import * as schema from './schema.ts'

/* ------------------------------------------------------------------
   Database handle.

   One libSQL client for the process. For a `file:` URL the directory has
   to exist before the driver opens it, so we create it here — that keeps
   a fresh clone working with nothing but `npm run seed`.
------------------------------------------------------------------- */

if (env.databaseUrl.startsWith('file:')) {
  const file = env.databaseUrl.slice('file:'.length)
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true })
}

export const client = createClient({
  url: env.databaseUrl,
  authToken: env.databaseAuthToken,
})

export const db = drizzle(client, { schema })

export { schema }
