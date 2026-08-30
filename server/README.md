# ჩემი სამეფო — API

Express + SQLite (via libSQL) backend for the public site and, next, the
moderator dashboard.

## Running it

```bash
cd server
cp .env.example .env      # then fill in SESSION_SECRET and ADMIN_PASSWORD
npm install
npm run seed              # applies migrations + loads the starting content
npm run dev               # http://localhost:4000
```

The site's dev server proxies `/api` and `/uploads` here, so `npm run dev` in
the repo root just works once this is running.

The first admin account comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
(defaults: `admin@mykingdom.ge` / `changeme123` — change both before going
live; the server refuses to start in production with the defaults).

## Where things live

| Path | What it holds |
| --- | --- |
| `data/mykingdom.db` | The entire database. Back it up by copying this file. |
| `uploads/` | Uploaded photos, re-encoded to WebP at 400/800/1400px. |
| `drizzle/` | Generated migrations. Commit these. |
| `src/db/seed-data.ts` | The site's starting content. Runs once; after that the database is the source of truth. |

## Endpoints

### Public

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness check. |
| `GET` | `/api/content` | The whole public site in one payload. |
| `GET` | `/api/availability?from=&to=` | Bookable days and slots. |
| `POST` | `/api/booking-requests` | Submit a booking *request*. |

### Auth

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Sets an httpOnly session cookie. |
| `POST` | `/api/auth/logout` | Ends the session. |
| `GET` | `/api/auth/me` | Current user, or `null`. |
| `POST` | `/api/auth/change-password` | Signs out other devices. |

### Admin (session required)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET/PUT` | `/api/admin/settings` | Name, contacts, map, hours, booking window. |
| CRUD | `/api/admin/programs` | Also `activities`, `benefits`, `extras`, `menu-categories`, `menu-items`, `gallery`, `gallery-categories`. |
| `POST` | `/api/admin/<resource>/reorder` | Drag-and-drop ordering. |
| `GET` | `/api/admin/menu` | Categories with their items, already nested. |
| `GET/POST/DELETE` | `/api/admin/schedule/slots` | The weekly opening pattern. |
| `GET/POST/DELETE` | `/api/admin/schedule/blackouts` | One-off closures. |
| `GET/PATCH` | `/api/admin/bookings` | Work through requests; `/summary` for counts. |
| `POST/GET/DELETE` | `/api/admin/uploads` | Photo upload and media library. |
| CRUD | `/api/admin/users` | Admin only. |

Every failure returns `{ error: { code, message, fields? } }`, with `message`
in Georgian so the UI can show it as-is.

## How availability works

A slot is bookable when all three hold:

1. the weekly schedule has that slot on that weekday,
2. the date is not in `blackout_dates`,
3. no **confirmed** booking already holds it.

A `received` booking does *not* block the slot. Two families may ask for the
same time; confirming one in the dashboard is what takes it off the calendar.

## Deploying

See [../DEPLOYMENT.md](../DEPLOYMENT.md) for the full walkthrough.

```bash
npm run build     # tsc → dist/
npm start         # node dist/server/src/index.js
```

Set `NODE_ENV=production`, `SESSION_SECRET`, `ADMIN_PASSWORD` and
`CORS_ORIGINS` (the site's and dashboard's origins, comma-separated). The
server refuses to start if any of those still hold a development default.

On boot it applies migrations and seeds anything missing, so a fresh
deployment needs no one-off command. Both steps are idempotent — restarting
never duplicates or overwrites edited content.

Two things must be on persistent storage, or every deploy loses them:

- `DATABASE_URL` — the SQLite file (`file:/var/data/mykingdom.db`)
- `UPLOAD_DIR` — the photos (`/var/data/uploads`)

Run it behind nginx, Caddy or a platform proxy with TLS — the session
cookie is `Secure` in production and will not be sent over plain HTTP.
