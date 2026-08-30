import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'
import fs from 'node:fs'
import path from 'node:path'
import { SERVER_ROOT } from '../src/env.ts'

/* ------------------------------------------------------------------
   A local Postgres for development, with nothing to install.

   PGlite is a real PostgreSQL build compiled to WebAssembly. This script
   puts it behind a TCP socket, so the API talks to it through the ordinary
   `pg` driver — the same code path it uses against Render's Postgres.

     npm run db:local

   Then in server/.env:
     DATABASE_URL=postgres://postgres:postgres@localhost:5433/postgres
     DATABASE_POOL_SIZE=1

   The pool size matters: this server handles one connection at a time,
   and the content endpoint issues its queries in parallel. Managed
   Postgres has no such limit, which is why it is only set locally.

   Data is kept in server/data/pglite, so it survives a restart. Delete
   that directory for a clean slate.
------------------------------------------------------------------- */

const port = Number(process.env.PGLITE_PORT ?? 5433)
const dataDir = path.join(SERVER_ROOT, 'data/pglite')

// PGlite creates the leaf directory but not its parents.
fs.mkdirSync(dataDir, { recursive: true })

const db = await PGlite.create({ dataDir })
const server = new PGLiteSocketServer({ db, port, host: '127.0.0.1' })

await server.start()

console.log(`[pglite] PostgreSQL on localhost:${port}`)
console.log(`[pglite] data directory: ${dataDir}`)
console.log('[pglite] DATABASE_URL=postgres://postgres:postgres@localhost:5433/postgres')
console.log('[pglite] DATABASE_POOL_SIZE=1')

const shutdown = async (): Promise<void> => {
  console.log('\n[pglite] shutting down')
  await server.stop()
  await db.close()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown())
process.on('SIGTERM', () => void shutdown())
