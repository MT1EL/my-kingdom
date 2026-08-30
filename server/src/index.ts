import { createApp } from './app.ts'
import { client } from './db/client.ts'
import { prepareDatabase } from './db/bootstrap.ts'
import { assertProductionConfig, env } from './env.ts'
import { purgeExpiredSessions } from './lib/sessions.ts'

/* ------------------------------------------------------------------
   Entry point: validate the configuration, bring the database up to date,
   start listening, and shut down cleanly when the process manager asks.
------------------------------------------------------------------- */

assertProductionConfig()

async function start(): Promise<void> {
  // Before the first request, not after: a managed host has nowhere
  // convenient to run a one-off migration, so a fresh deployment brings its
  // own schema up. Both steps are idempotent.
  await prepareDatabase()

  await purgeExpiredSessions()

  const app = createApp()

  const server = app.listen(env.port, () => {
    console.log(`[api] listening on http://localhost:${env.port} (${env.nodeEnv})`)
  })

  const DAY_MS = 24 * 60 * 60 * 1000
  const purgeTimer = setInterval(() => {
    purgeExpiredSessions().catch((error: unknown) => {
      console.error('[api] failed to purge expired sessions:', error)
    })
  }, DAY_MS)
  // Housekeeping must not be the reason the process stays alive.
  purgeTimer.unref()

  const shutdown = (signal: string): void => {
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
}

start().catch((error: unknown) => {
  // Starting without a usable database would mean serving 500s to every
  // visitor; failing loudly lets the host restart or roll back instead.
  console.error('[api] failed to start:', error)
  process.exit(1)
})
