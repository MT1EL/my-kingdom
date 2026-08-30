import { createApp } from './app.ts'
import { client } from './db/client.ts'
import { assertProductionConfig, env } from './env.ts'
import { purgeExpiredSessions } from './lib/sessions.ts'

/* ------------------------------------------------------------------
   Entry point: validate the configuration, start listening, shut down
   cleanly when the process manager asks.
------------------------------------------------------------------- */

assertProductionConfig()

const app = createApp()

const server = app.listen(env.port, () => {
  console.log(`[api] listening on http://localhost:${env.port} (${env.nodeEnv})`)
})

purgeExpiredSessions().catch((error: unknown) => {
  console.error('[api] failed to purge expired sessions:', error)
})

const DAY_MS = 24 * 60 * 60 * 1000
const purgeTimer = setInterval(() => {
  purgeExpiredSessions().catch((error: unknown) => {
    console.error('[api] failed to purge expired sessions:', error)
  })
}, DAY_MS)
// Housekeeping must not be the reason the process stays alive.
purgeTimer.unref()

function shutdown(signal: string): void {
  console.log(`[api] ${signal} received, shutting down`)
  server.close(() => {
    client.close()
    process.exit(0)
  })

  // Do not hang forever on a stuck connection.
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
