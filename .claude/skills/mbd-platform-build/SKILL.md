---
name: mbd-platform-build
description: Build an MBD-family operations platform (Smart Solutions Operativa pattern) — ASC-style static PWA architecture, roles with field mode, QR+supplier inventory flows, demo-mode-first data layer, and the verification bar every claim must clear. Use when building a new MBD platform, adding a major feature to an existing one, or porting this architecture to a new client repo.
---

# MBD Platform Build

The proven architecture from `manbeardog13/ASC` (tire hotel, in production)
and `manbeardog13/Smart-Solutions` (Operativa). Every new MBD platform
starts from this shape — craftsmanship stays constant, branding and
workflows change per client.

## Bootstrap (MANDATORY, before any code — no exceptions)

Every new platform repo starts by installing the company contract and the
parity tooling, copied from `manbeardog13/Smart-Solutions`:

1. `docs/platform/DEFAULT_COMPANY_PLATFORM_STANDARD.md` — Toni's mandatory
   platform contract (splash → login → role-aware dashboard sequence,
   minimalism, adaptive one-product rule, token system, checklists). Copy
   it VERBATIM; never edit, summarize, or fork it.
2. `CLAUDE.md` referencing the standard with the §26 recommended
   instruction, plus the project facts and quality gates.
3. `scripts/audit-login.mjs` — the logon-parity audit. The logon of every
   MBD platform must measure within ±2px of the ASC phone build
   (`asc/app/login.html`) at 390×844: card edge gaps, every element's
   size, side gaps, stacking gaps, fonts and radii. Only brand-intrinsic
   metrics are exempt (logo aspect, text-metric edges). Scale the card —
   never cut it.
4. The logon + splash implementation from the `mbd-design-language` skill,
   re-tinted to the client brand (accent color, logo, city line).

## Architecture (ASC pattern — do not reinvent)

- **Static PWA, no build step.** Plain ES modules served from the repo
  root: `index.html`, `js/`, `css/`, `manifest.webmanifest`. Any static
  server runs it; GitHub Pages hosts it free.
- **File roles are fixed:**
  - `js/config.js` — Supabase URL/key placeholders + `isConfigured()`.
    Until real credentials land, the app runs in **demo mode**. Also
    `appBaseUrl()`: printed QR stickers must follow the live deployment
    origin, not a hardcoded personal domain.
  - `js/domain.js` — pure business rules, zero DOM/storage/network, so
    every rule is directly unit-testable. Roles/visibility, stock math,
    QR payloads, device classes live here.
  - `js/store.js` — one state object + tiny observer (`on`/`emit`).
    Owns session persistence and the **protected-data wipe**: any signIn
    that cannot prove "same user" clears `ss.protected.*`/`ss.gemini.*`.
  - `js/db.js` — every data operation. Demo implementation on
    localStorage now; the single Supabase wiring point later. Errors are
    human sentences in the user's language. A failed write must throw —
    never let the UI report success that didn't persist.
  - `js/ui.js` — `esc()`, inline SVG `icon()`, `toast()`, `hrCount()`
    (Croatian plural rules), `thumb()` (honest image fallback).
  - `js/app.js` — boot, splash → gate → shell, hash router with
    lazy-loaded views (`js/views/*.js`, each exports `render(main, ctx)`).
  - `tests/*.test.mjs` — `node --test`, no framework. Stub
    `globalThis.localStorage` with a Map to test `db.js`.
- **Router invariants** (all were real bugs once — keep them):
  sequence-token guard so a slow dynamic import can't overwrite a newer
  route; normalize unknown/disallowed hashes via guarded
  `history.replaceState`; a role can NEVER be locked out (empty
  visibility override falls back to defaults; dashboard always
  reachable); logged-out hashchange must not rebuild a visible gate
  (wipes typed input); logout clears hash, scrims, and mode classes.
- **Roles**: owner sees all; field technicians get `field-mode`
  (big buttons, big numbers, big letters — including secondary text);
  admins edit a visibility matrix that must mirror the domain rules
  (always-on views shown disabled, `role=switch` + `aria-checked`).

## Inventory + QR system

- QR stickers encode a URL: `<base>/#/item/<id>?s=<supplier>` — a plain
  phone camera opens the exact record. Supplier travels in the payload
  because **reordering requires the supplier**.
- Deep link renders a confirmation card: product image, DB-authoritative
  supplier (warn on sticker mismatch), qty, and direct actions.
- Stock rules: low at `qty <= min`; proposal = deficit + one batch;
  **one open reorder per item** (idempotent `placeReorder`); receiving
  back above min closes the open order; issuing at zero errors —
  never log a movement that didn't happen.
- Parse hostile QR text defensively: malformed percent-encoding returns
  `null`, never throws.

## Verification bar (nothing ships below it)

1. `node --check` every module; `node --test tests/*.test.mjs` green.
2. CI workflow runs exactly what the README claims.
3. Playwright drive-through against a local server
   (`/opt/pw-browsers/chromium`): login per role, every view, deep link,
   theme toggle, phone viewport — **zero console errors**, screenshots
   reviewed by eye.
4. No claim without evidence: a feature "done" means commit + test +
   screenshot. Chat transcripts are not evidence. (This rule exists
   because this project began with a fabricated status report.)
5. After any substantial milestone, run the `mbd-audit-loop` skill.

## Croatian UI copy

UI is Croatian; code/comments English. Counts must decline
(`hrCount(n, ["artikl","artikla","artikala"])`). Watch gender agreement
("Spremne pozicije", not "Pozicija spremno"). Timestamps include the day.
