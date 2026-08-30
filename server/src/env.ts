import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* ------------------------------------------------------------------
   Configuration, read once at boot.

   Everything is overridable through environment variables so the same
   build runs in development and production. See `.env.example`.
------------------------------------------------------------------- */

const here = path.dirname(fileURLToPath(import.meta.url));
/**
 * Root of the server package (…/server).
 * `here` is `src` when running through tsx and `dist/server/src` after a
 * build, so the root is found by walking up until `package.json` appears
 * rather than by counting directories.
 */
export const SERVER_ROOT = (() => {
  let dir = here;
  for (let depth = 0; depth < 6; depth += 1) {
    if (fs.existsSync(path.join(dir, "package.json"))) return dir;
    dir = path.dirname(dir);
  }
  return path.resolve(here, "..");
})();

/**
 * Loads `server/.env` if it exists.
 * Without this the file would be written and silently ignored — real
 * variables in the environment still win, which is what a deployment wants.
 */
const envFile = path.join(SERVER_ROOT, ".env");
if (fs.existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const int = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const list = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) return fallback;
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",

  port: int(process.env.PORT, 4000),

  /** libSQL URL. A `file:` URL keeps the whole database in one local file. */
  databaseUrl:
    process.env.DATABASE_URL ??
    `file:${path.join(SERVER_ROOT, "data/mykingdom.db")}`,
  databaseAuthToken: process.env.DATABASE_AUTH_TOKEN,

  /** Where uploaded images are written, and the path they are served from. */
  uploadDir: process.env.UPLOAD_DIR ?? path.join(SERVER_ROOT, "uploads"),
  uploadUrlPath: "/uploads",
  maxUploadBytes: int(process.env.MAX_UPLOAD_BYTES, 12 * 1024 * 1024),

  /**
   * Browser origins allowed to send credentialed requests.
   * The public site and the dashboard both need to be listed in production.
   */
  corsOrigins: list(process.env.CORS_ORIGINS, [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ]),

  session: {
    cookieName: "mk_session",
    /** How long a moderator stays signed in. */
    ttlDays: int(process.env.SESSION_TTL_DAYS, 14),
    /** Required in production — the cookie is signed with it. */
    secret: process.env.SESSION_SECRET ?? "dev-only-insecure-secret",
  },

  /** Seeded on first run so somebody can sign in to the dashboard. */
  bootstrapAdmin: {
    email: process.env.ADMIN_EMAIL ?? "admin@mykingdom.ge",
    password: process.env.ADMIN_PASSWORD ?? "changeme123",
    name: process.env.ADMIN_NAME ?? "ადმინისტრატორი",
  },
} as const;

/** Fails fast rather than starting a production server with dev defaults. */
export function assertProductionConfig(): void {
  if (!env.isProduction) return;

  const problems: string[] = [];
  if (env.session.secret === "dev-only-insecure-secret") {
    problems.push("SESSION_SECRET is unset — sessions would be forgeable.");
  }
  if (env.bootstrapAdmin.password === "changeme123") {
    problems.push(
      "ADMIN_PASSWORD is unset — the default admin password is public.",
    );
  }
  if (!process.env.CORS_ORIGINS) {
    problems.push(
      "CORS_ORIGINS is unset — only localhost origins would be allowed.",
    );
  }

  if (problems.length > 0) {
    throw new Error(
      `Refusing to start in production:\n  - ${problems.join("\n  - ")}`,
    );
  }
}
