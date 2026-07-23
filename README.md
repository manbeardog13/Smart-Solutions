# Smart Solutions · Operativa

Operations platform for Smart Solutions (Dubrovnik): warehouse inventory,
work orders, movements, QR-labelled parts with supplier-aware reordering,
and role-based interfaces — owner, field technician (big-controls mode),
and warehouse staff. Croatian UI. Premium glass design language, light and
dark themes, splash → login → dealt-cards dashboard entrance.

Modeled on the **ASC platform build** (`manbeardog13/ASC`): a static PWA
with no build step — plain ES modules — designed for Supabase
(Postgres + Auth + RLS + Realtime) and free GitHub Pages hosting. Until
Supabase credentials are set in `js/config.js`, the app runs in **demo
mode**: demo accounts and localStorage persistence.

## Run

Any static file server from the repo root:

```
npx http-server .        # or: python3 -m http.server
```

Open the page, pick a demo account (Vido = owner, Marko = field
technician, Ana = warehouse), and explore.

## Verify

```
for f in $(find js -name '*.js'); do node --check "$f"; done
node --test tests/*.test.mjs
```

CI (`.github/workflows/ci.yml`) runs the same on every push.

## Layout

| Path | What |
| --- | --- |
| `index.html`, `js/`, `css/` | The application (ES modules, no build step) |
| `js/domain.js` | Business rules — roles, stock/reorder, QR payloads, device classes, deal timing — fully unit-tested |
| `js/store.js` | State + session persistence + protected-data (incl. Gemini cache) cleanup on user change |
| `js/db.js` | Data layer: demo implementation now, Supabase wiring point later |
| `js/views/` | Dashboard, Skladište, Kretanja, Radni nalozi, Skeniranje, Upravljanje |
| `tests/` | `node --test` unit tests |
| `catalogue/` | Product catalogue (Panasonic 2026/27) — originals + WebP thumbnails |
| `design/` | Design direction spec + curated inspiration library |
| `docs/REQUIREMENTS.md` | Functional requirements |
| `reference/` | Prior standalone reference pages (design-language origin) |
| `site/` | Dated snapshot of the earlier chatgpt.site deployment |
| `brand/` | Logo artwork (original + transparent crops), app icons, nature-scene backdrops |

## Roadmap

1. Supabase: schema + RLS + auth (mirror ASC's `supabase/schema.sql` approach), replacing demo mode.
2. Real QR stickers (`qrcode-generator` SVG) + live camera scanning (`html5-qrcode` + photo fallback, ASC pattern).
3. Gemini photo-to-QR flow for big parts (serial-plate reading with "better picture" fallback).
4. GitHub Pages deployment + PWA service worker.
