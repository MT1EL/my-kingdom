# Deployment

Three pieces, and they do not all go to the same place:

| Piece | What it is | Where it goes |
| --- | --- | --- |
| `src/` | The public site | Netlify ✅ already deployed |
| `admin/` | The dashboard | A second Netlify site |
| `server/` | The API + database + photos | **A Node host — not Netlify** |

## Why the API cannot go on Netlify

Netlify serves static files. `server/` does not build a website — it builds
a Node *program* that has to be **run** and listen on a port. Point a
Netlify site at it and there is no `index.html` to serve, so every URL
returns "Page not found". No build setting changes that.

(Netlify *can* run backend code as serverless Functions, but a function has
no disk that survives between requests — the database and every uploaded
photo would vanish. That route means moving the database to Turso and the
uploads to Netlify Blobs. It is a real option, just a different project.)

So the API needs a host that runs a process and gives it a disk.

---

## 1. Deploy the API

Pick one. All three read config that is already in this repo.

### Option A — Render (`render.yaml`)

New → **Blueprint** → this repository. Render reads `render.yaml`.

⚠️ The blueprint asks for a 1 GB disk, and **on Render a persistent disk
requires a paid instance type**. Free web services cannot have one, and
without a disk you lose the database and every photo on each deploy. Check
the current plans before committing to this.

### Option B — Fly.io (`fly.toml`, `Dockerfile`)

```bash
fly launch --no-deploy          # keep the existing fly.toml
fly volumes create mykingdom_data --size 1 --region fra
fly secrets set \
  SESSION_SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')" \
  ADMIN_EMAIL="you@example.com" \
  ADMIN_PASSWORD="a-real-password" \
  CORS_ORIGINS="https://starlit-buttercream-3e619c.netlify.app"
fly deploy
```

The volume is what makes the data survive. Keep it to **one** machine —
SQLite is a single file with one writer.

### Option C — Railway, Koyeb, or a VPS (`Dockerfile`)

Build from the repository root (`docker build -t mykingdom-api .`), mount a
volume at `/var/data`, and set the same environment variables. On a VPS,
put nginx or Caddy in front for TLS.

### Environment variables (all options)

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `file:/var/data/mykingdom.db` |
| `UPLOAD_DIR` | `/var/data/uploads` |
| `SESSION_SECRET` | long random string — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_EMAIL` | your dashboard login |
| `ADMIN_PASSWORD` | a real password, not `changeme123` |
| `CORS_ORIGINS` | both Netlify URLs, comma-separated |

The server **refuses to start in production** without the last four. That
is deliberate — it stops a deployment going live with a publicly known
password. If the deploy fails, read the log: it names exactly what is
missing.

On first boot it applies its own migrations, loads the starting content and
creates the admin account. Nothing to run by hand, and restarting is safe:
it only fills in what is missing and never overwrites edited content.

**Check it:** `https://YOUR-API/api/health` → `{"status":"ok",...}`

### The disk is not optional

The SQLite file and every uploaded photo live on it. A service without a
persistent disk loses all of it on every deploy — bookings included.

If you would rather not pay for a disk, the database can move to
[Turso](https://turso.tech) with **no code change**: set `DATABASE_URL` to
the Turso URL and `DATABASE_AUTH_TOKEN` to its token. Photos would still
need somewhere to live, so the upload feature would have to be rewritten
against object storage first — ask before going that way.

---

## 2. Point the site at the API

In `netlify.toml`, replace both `API_HOST` placeholders with the API's host
(no scheme, no trailing slash):

```toml
to = "https://mykingdom-api.onrender.com/api/:splat"
```

Push. Netlify redeploys and the site starts working.

That file also adds the single-page-app fallback, which fixes a second,
separate bug: without it `/menu`, `/programs` and every other path return
404 on a refresh or a direct visit.

---

## 3. Deploy the dashboard

Netlify → Add new site → same repository → **Base directory: `admin`**.
It picks up `admin/netlify.toml`; replace `API_HOST` there too.

Then set `CORS_ORIGINS` on the API to both site URLs and redeploy it:

```
https://starlit-buttercream-3e619c.netlify.app,https://YOUR-ADMIN-SITE.netlify.app
```

---

## 4. After the first deploy

- Sign in to the dashboard and **change the admin password**.
- Fill in the real phone, address and opening hours under **პარამეტრები**.
  Until then the site honestly shows "დასაზუსტებელია" rather than inventing
  contact details.
- Replace the **placeholder menu prices** — everything under მენიუ is a
  realistic starting point, not the venue's real price list.
- Swap the stock photos in **გალერეა** and on the programmes.

---

## Backups

The whole database is one file:

```bash
cp /var/data/mykingdom.db /var/data/backup-$(date +%F).db
```

Download it periodically — a disk on the same machine is not a backup.
Photos in `/var/data/uploads` need copying too.

---

## Local development

```bash
npm run setup        # installs server + admin deps, seeds the database
npm run dev:api      # API       → :4000
npm run dev          # site      → :5173
npm run dev:admin    # dashboard → :5174
```

The Vite dev servers proxy `/api` and `/uploads` to port 4000. **That proxy
is a dev-server feature and does not exist in production** — in production
the `netlify.toml` redirects do the same job.
