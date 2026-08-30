# Deployment

Everything runs on Render's free tier, as three resources created from one
blueprint:

| Resource | Type | Holds |
| --- | --- | --- |
| `mykingdom-db` | Postgres | Content, bookings, and the photos |
| `mykingdom-api` | Web Service | The API, and the dashboard at `/admin` |
| `mykingdom-site` | Static Site | The public site |

Two consequences of the free tier that shape the design:

- **No persistent disk and no object storage.** The database is Postgres
  rather than a SQLite file, and uploaded photos are stored as rows in it
  (`STORAGE_DRIVER=database`) and served from `/uploads`.
- **The dashboard is served by the API**, not as its own static site. That
  keeps its login cookie first-party, which no browser privacy setting will
  interfere with.

---

## 1. Deploy

Render → **New → Blueprint** → this repository. It reads `render.yaml` and
creates all three resources, wiring the database URL and the two service
hostnames together automatically.

Set two variables on `mykingdom-api` before the first deploy:

| Variable | Value |
| --- | --- |
| `ADMIN_EMAIL` | your dashboard login |
| `ADMIN_PASSWORD` | a real password, not `changeme123` |

Everything else — `DATABASE_URL`, `SESSION_SECRET`, `CORS_ORIGINS`,
`STORAGE_DRIVER`, `SERVE_ADMIN` — the blueprint fills in.

The server **refuses to start in production** if the auth variables are
missing, and the log names exactly which ones. That is deliberate: it stops
a deployment going live with a publicly known password.

On first boot it applies its own migrations, loads the starting content and
creates the admin account. Nothing to run by hand. Restarting is safe — it
only fills in what is missing and never overwrites edited content.

**Check it:**

- `https://mykingdom-api.onrender.com/api/health` → `{"status":"ok",...}`
- `https://mykingdom-site.onrender.com` → the site
- `https://mykingdom-api.onrender.com/admin` → the dashboard login

---

## 2. Two things about the free tier

### The web service sleeps

After a stretch with no traffic Render suspends a free service, and the next
request waits for it to start — tens of seconds. For a venue's website that
is a visitor staring at a loading screen.

Ping `https://mykingdom-api.onrender.com/api/health` every ~10 minutes from
a free scheduler (cron-job.org, UptimeRobot) to keep it warm. The real fix
is a paid instance, which needs no code change.

### ⚠️ Free Postgres expires

Render's free Postgres has historically been **deleted** after a fixed
period, not merely suspended. If that is still the policy, everything —
bookings included — goes with it.

**Check Render's current terms before treating this as production.** If the
expiry is real, the options are a paid Postgres (no code change) or moving
the database to another free host such as Neon or Turso.

Either way, take backups (below).

---

## 3. After the first deploy

- Sign in at `/admin` and **change the admin password**.
- Fill in the real phone, address and opening hours under **პარამეტრები**.
  Until then the site honestly shows "დასაზუსტებელია" rather than inventing
  contact details.
- Replace the **placeholder menu prices** — everything under მენიუ is a
  realistic starting point, not the venue's real price list.
- Swap the stock photos in **გალერეა** and on the programmes.

---

## Backups

Everything, including the photos, is in the one database:

```bash
pg_dump "$EXTERNAL_DATABASE_URL" > backup-$(date +%F).sql
```

Render shows the External Database URL on the database page. Do this on a
schedule and keep the files somewhere other than your laptop — especially
while the free instance has an expiry.

---

## Local development

No Postgres installation needed.

```bash
npm run setup            # installs server + admin dependencies

# terminal 1 — a real PostgreSQL (PGlite) on :5433
npm --prefix server run db:local

# terminal 2
cp server/.env.example server/.env
npm run dev:api          # API       → :4000

# terminal 3
npm run dev              # site      → :5173

# terminal 4 (optional)
npm run dev:admin        # dashboard → :5174
```

The Vite dev servers proxy `/api` and `/uploads` to port 4000. **That proxy
is a dev-server feature and does not exist in production** — there the site
calls the API directly via `VITE_API_URL`, and the dashboard is served from
the API itself.

Locally `STORAGE_DRIVER` defaults to `disk`, so uploads land in
`server/uploads` and you can see them as files.
