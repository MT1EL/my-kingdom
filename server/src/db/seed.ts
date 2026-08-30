import { client } from './client.ts'
import { prepareDatabase } from './bootstrap.ts'
import { env } from '../env.ts'

/* ------------------------------------------------------------------
   Seeding, from the command line.

     npm run seed          — safe to re-run; only fills what is missing
     npm run seed:reset    — wipes content first (bookings and users kept)

   The server does the same work at boot, so this script exists for local
   development and for `--reset`, not because a deployment needs it.
------------------------------------------------------------------- */

const reset = process.argv.includes('--reset')

console.log(`[seed] database: ${env.databaseUrl}`)

prepareDatabase({ reset })
  .then(() => {
    console.log('[seed] done')
    client.close()
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error('[seed] failed:', error)
    client.close()
    process.exit(1)
  })
