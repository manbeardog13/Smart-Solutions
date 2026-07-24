# Smart Solutions · Operativa — agent instructions

Before making any product, UI, UX, architecture, or responsive-layout change,
read and comply with `docs/platform/DEFAULT_COMPANY_PLATFORM_STANDARD.md`.
This standard is mandatory for Claude, Codex, and all implementation agents.
Project-specific instructions may override individual rules only when
explicitly stated by Toni.

## Project facts

- Static PWA, repo root is the app. No build step; plain ES modules
  (`js/app.js` boot + router, `js/views/*` lazy views, `js/db.js` data layer,
  `js/store.js` session state, `js/domain.js` business rules).
- Croatian UI. Demo mode until Supabase credentials land in `js/config.js`.
- Brand: Smart Solutions red `#DD0426` (HVAC, Dubrovnik). Assets in `brand/`.
- Design language: `.claude/skills/mbd-design-language` (owner-locked logon
  card + splash; ASC-parity audited).

## Quality gates

- `for f in js/**/*.js: node --check` and `node --test tests/*.test.mjs`
  must pass (also run in CI).
- Logon parity: `node scripts/audit-login.mjs` measures the logon geometry
  against the ASC phone build (serve `/workspace/asc/app` on :8124 and this
  repo on :8123). All metrics must stay within ±2px.
- Light AND dark screenshots for every changed screen; phone + desktop.
- After substantial milestones run the `mbd-audit-loop` skill.
