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

/**
 * Splits a comma-separated list of browser origins.
 *
 * Entries may be written without a scheme — Render's `fromService` only
 * exposes `host` or `host:port` — so one is added, because the browser's
 * Origin header always carries it and the comparison is exact.
 */
const list = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) return fallback;
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => (/^https?:\/\//.test(entry) ? entry : `https://${entry}`))
    .map((entry) => entry.replace(/\/$/, ""));
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",

  port: int(process.env.PORT, 4000),

  /** PostgreSQL connection string. Required — there is no sensible default. */
  databaseUrl: process.env.DATABASE_URL ?? "",
  /** Free Postgres instances allow few connections; this API is not busy. */
  databasePoolSize: int(process.env.DATABASE_POOL_SIZE, 5),

  /**
   * Where uploaded photos go.
   *
   * "disk"       — writes into `uploadDir`. Fine locally and on any host
   *                 with a persistent volume.
   * "database"    — keeps the bytes in Postgres and serves them from the
   *                 API. For hosts with neither a disk nor object storage.
   * "cloudinary"  — offloads to Cloudinary's CDN.
   */
  storageDriver: (process.env.STORAGE_DRIVER ?? "disk") as
    | "disk"
    | "database"
    | "cloudinary",

  /** Used by the "disk" driver, and to serve what it has already written. */
  uploadDir: process.env.UPLOAD_DIR ?? path.join(SERVER_ROOT, "uploads"),
  uploadUrlPath: "/uploads",
  maxUploadBytes: int(process.env.MAX_UPLOAD_BYTES, 12 * 1024 * 1024),

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
    /** Keeps this project's photos together in the Cloudinary media library. */
    folder: process.env.CLOUDINARY_FOLDER ?? "mykingdom",
  },

  /**
   * Browser origins allowed to send credentialed requests.
   * The public site and the dashboard both need to be listed in production.
   */
  corsOrigins: list(process.env.CORS_ORIGINS, [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ]),

  /**
   * Serve the built dashboard from this server at /admin.
   * Same-origin means its session cookie is first-party, which no browser
   * privacy setting will interfere with.
   */
  serveAdmin: process.env.SERVE_ADMIN === "true",

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
  if (!env.databaseUrl) {
    problems.push("DATABASE_URL is unset — there is no database to serve.");
  }
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
  if (env.storageDriver === "cloudinary") {
    const missing = (
      [
        ["CLOUDINARY_CLOUD_NAME", env.cloudinary.cloudName],
        ["CLOUDINARY_API_KEY", env.cloudinary.apiKey],
        ["CLOUDINARY_API_SECRET", env.cloudinary.apiSecret],
      ] as const
    )
      .filter(([, value]) => !value)
      .map(([name]) => name);

    if (missing.length > 0) {
      problems.push(
        `STORAGE_DRIVER is "cloudinary" but ${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} unset — photo uploads would fail.`,
      );
    }
  }
  if (env.storageDriver === "disk") {
    // Not fatal — a host with a mounted volume is fine — but on a disk-less
    // host this is the setting that silently loses every uploaded photo.
    console.warn(
      '[api] STORAGE_DRIVER is "disk". If this host has no persistent volume, uploaded photos are lost on the next deploy. Use "database" or "cloudinary" instead.',
    );
  }

  if (problems.length > 0) {
    throw new Error(
      `Refusing to start in production:\n  - ${problems.join("\n  - ")}`,
    );
  }
}
