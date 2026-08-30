# ჩემი სამეფო — მართვის პანელი

The dashboard the venue's owner and moderators use to change everything on
the public site. It talks to the API in `../server`; it has no database or
content of its own.

## Running it

```bash
# in one terminal — the API must be up first
npm run dev:api

# in another
npm run dev:admin      # http://localhost:5174
```

Sign in with the account created by `npm run seed`
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`, default `admin@mykingdom.ge` /
`changeme123`).

Vite proxies `/api` and `/uploads` to port 4000, so the dashboard and the
API share one origin in development and the session cookie behaves exactly
as it will in production.

## What can be edited

| Screen | Changes |
| --- | --- |
| **მთავარი** | Counts of new / upcoming / confirmed bookings. |
| **ჯავშნები** | Work through requests: confirm, decline, cancel, add a private note. Filter by status, search by reference, name or phone. |
| **განრიგი** | The weekly opening pattern and one-off closures. |
| **პროგრამები** | Party themes: text, ages, duration, photo, highlights, card colour. |
| **მენიუ** | Categories and dishes, with prices. |
| **გალერეა** | Photos, with drag-free up/down ordering and categories. |
| **აქტივობები / რატომ ჩვენ / დამატებები** | The home-page blocks and booking add-ons. |
| **პარამეტრები** | Name, contacts, map, opening hours, price note, booking window. |

Two behaviours worth knowing:

- **Confirming a booking holds the slot.** It disappears from the public
  calendar the moment you confirm. A request that is only "new" does not
  block anybody — two families can ask for the same hour.
- **Empty means "not set", not "blank".** Clearing a phone number or a menu
  price stores `null`, and the site renders its honest "დასაზუსტებელია"
  chip rather than an empty gap or an invented number.
- **Unpublishing is not deleting.** Un-tick "გამოქვეყნებული" to take
  something off the site while keeping it.

## How it is built

The seven content screens are one component. `ResourcePage` handles list,
create, edit, delete and reorder; each content type is a configuration in
`src/pages/content.tsx` that says what fields it has and how a row reads.
Adding a field is one line there, not a new form.

`src/components/resource/fields.tsx` renders those field descriptors —
text, number, price, image upload, icon picker, gradient picker and so on.

The menu and settings screens are hand-written because they are not flat
lists: the menu is a tree, and settings is one record with nested groups.

## Deploying

```bash
npm --prefix admin run build     # → admin/dist
```

Serve `admin/dist` as a static site on its own hostname (e.g.
`admin.mykingdom.ge`), and add that origin to the API's `CORS_ORIGINS`.
Point `VITE_API_URL` at the API if it is not behind the same domain.

Keep it off the public site's domain — that way none of this code ships to
families browsing the site.
