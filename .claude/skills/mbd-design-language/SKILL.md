---
name: mbd-design-language
description: The MBD Premium Platform DNA — glass surfaces, logo treatment, motion rules, nature backdrops, light/dark parity, field-mode sizing, and the accessibility floor. Use whenever styling any MBD platform UI, reviewing visual work against the design methodology, or porting the look to a new client brand.
---

# MBD Design Language (Premium Platform DNA)

Locked by the owner as the permanent standard: minimal, role-focused,
silky surfaces, premium translucent glass, soft rounded edges, fast
nonlinear motion, no dead controls, progressive disclosure, consistency
across devices, accessibility preserved. Craftsmanship stays constant;
each client gets its own brand color, imagery, and density.

Reference implementations: `css/app.css` (live tokens),
`reference/nadzor-flote-dubrovnik.html` (origin), `design/inspiration/`
(owner-curated references + index), `design/DESIGN-DIRECTION.md` (brief).

## Tokens (Smart Solutions values — swap brand color per client)

- Brand red `#DD0426` (dark variant `#B00320`); night `#121212`;
  paper `#F7F7F6` / dark `#0D0D0D`.
- Glass: light `rgba(255,255,255,.58/.74)`, dark `rgba(20,26,32,.42/.58)`
  + `backdrop-filter: blur(24-42px) saturate(180%)`. Reduce blur radii on
  phones (GPU cost); never stack blur on tiny controls like inputs.
- Radii: cards 20px, controls 14px, login card 26px. Shadows are layered
  stacks (`--shadow-1/2`) plus an inset top hairline (`--hairline`) —
  the "milky Apple" read comes from hairline + shadow together.
- Easing `cubic-bezier(.2,0,0,1)` ("snap"), transitions **180–260 ms**
  (token `--t:.2s`). Transform/opacity only; no layout-shift animation,
  no bouncing. `prefers-reduced-motion` kills all animation globally.

## Signature moves

- **Logo**: use the real artwork (`brand/logo-mark.png`,
  `logo-word.png` — background removed programmatically). Hover = lift,
  slight tilt, red drop-shadow, and a **sheen sweep masked to the logo
  shape** (`mask: url(logo) + animated gradient`). Idle = slow red-glow
  breathing. Never redraw the logo; refine, don't redesign.
- **Nature behind glass**: layered SVG mountainscapes with fog
  (`brand/bg-dawn.svg` light, `bg-night.svg` dark) behind the gate and,
  heavily veiled by the paper tone (`color-mix`), behind the whole app —
  the glass needs something real to refract. Never a product photo as a
  page backdrop.
- **Entry flow**: logon (below) → animated hand-off (gate glides out
  ~340 ms, never a hard innerHTML cut) → dashboard cards **dealt
  center-out, pairs left/right, settled ≤620 ms**.
- **Edge surfaces**: left rail 72→280 px on edge-hover, pinnable by
  click, first-tap-opens on touch; right shelf = slim red handle at rest,
  glass capsule on hover/focus/tap, monochrome icons until hover, every
  button a real destination. Essential controls (save, alerts, logout,
  theme) are never hidden — phones surface them in the top bar.

## Logon screen (hard standard — owner-locked, every MBD platform)

Matches the ASC PHONE BUILD (`asc/app/login.html` — the shipped app, not
the repo's newer split-shell experiment; the owner compared screenshots
and locked the card). Live at Smart Solutions `js/app.js renderGate()` +
the login-gate section of `css/app.css`. Parity is MEASURED, not
eyeballed: `scripts/audit-login.mjs` compares every metric (card edge
gaps, element sizes, side gaps, stacking gaps, fonts, radii) against the
ASC ruler and must pass within ±2px before shipping. Type is Inter with
Sora display (ASC pairing, Google Fonts). The theme switch is 38×22 with
a spring thumb and a `.kick` micro-glow in the BRAND color on every
press (red for Smart Solutions). Canvas: `#EEF0F1`/`#0A0C11` with three
quiet radial pools (brand-tinted, cool blue, gunmetal) + fine grain — no
drawn shapes, arcs, or lines, ever.

- **Startup splash**: the brand mark ALONE (no wordmark), centered on
  the flat canvas with a small load bar (132×3px capsule, brand-color
  fill scaling in ~1s) — then the splash fades (~420 ms) and the gate's
  entrance begins. NO glow behind the mark (a drop-shadow reads as a
  colored box on the flat canvas). Splash shows only on first paint,
  never on logout; skipped under reduced motion.
- **One compact card**: `min(376px, 100% − 40px)`, `margin:auto`,
  radius 28px, generous padding. Fully opaque and matte: white in
  light, anthracite (`#1B1C20`) in dark — no backdrop blur, no
  highlight ring, no light shafts, ever. Floats on a soft neutral
  shadow. Inside, top row = brand logo (~128px wordmark) left + an
  iOS-style theme switch right (52×32px, gray track, white knob, no
  label, no edges).
- **Copy**: bold title ("Dobrodošli natrag", ~26px/750), one quiet sub
  line ("<Product> · <City>"). Nothing else. Less is more everywhere.
- **Form order**: Google button (rounded-rect 16px, sunk tone, 1px
  line, 52px) → uppercase divider ("ILI EMAIL", 11.5px, ls .14em) →
  icon fields (rounded-rect 16px, sunk tone, 52px, leading mail/lock
  icon at 15px, eye toggle in the password field) → right-aligned
  semibold forgot link → **gradient CTA** (rounded-rect ~17px, 54px,
  `linear-gradient(180deg, lighter, brand 58%, darker)`, soft glow
  `0 16px 30px -10px rgba(brand,.42)`, inset top highlight, arrow that
  slides +3px on hover) → centered "Prvi put? Napravi račun".
- **Backdrop**: quiet stylised composition from the palette, never a
  photo — faint brand bloom, blurred diagonal sash, huge quiet arc,
  fine SVG grain (.05), optional cursor glow (transform-only, hidden on
  touch/reduced-motion). Resolves from heavy blur on startup; the card
  emerges once (blur-fade + 8px rise, 620 ms). After startup nothing on
  the gate animates. Top edge fades into the status-bar strip so dark
  mode runs behind the iPhone notch without a seam.
- **In-app carryover**: the dark stage language (near-black gradient
  panel, two-tone headline, corner notch tab with 18px inverted-radius
  bevels, faded catalogue imagery) lives on the DASHBOARD HERO, not on
  the logon.

## Maker's mark (every MBD platform)

Toni's MBD13 signature (`brand/mbd13.png`, white mark with alpha) sits
fixed at the bottom-center of every screen — gate and app — at ~20px,
8–9% opacity, `filter:invert(1)` in light mode, native white in dark.
Slightly noticeable, always present, never interactive
(`pointer-events:none`).

## Accessibility floor (non-negotiable)

44px touch targets (52px in field-mode); visible `:focus-visible` ring;
`role=switch`+`aria-checked` for toggles with constant accessible names;
modals get `aria-modal`, Escape, initial focus, focus restore through a
single close path; focus survives list re-renders (re-find by
action+item); view swaps move focus to the page title; toast is a
pre-existing `role=status` live region; AA contrast in BOTH themes
(check white-on-red metas and red text on dark glass specifically).

## Review checklist

Light AND dark screenshot of every changed screen; phone + desktop +
ultrawide (80dvw stage); reduced-motion pass; no sharp-corner hover
snaps (soft lifts only); no borrowed/wrong product imagery — honest
initial-tile fallback when no catalogue photo exists.
