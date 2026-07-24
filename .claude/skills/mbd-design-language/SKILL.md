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

Ported from ASC v2 (`asc/css/styles.css` "v2 auth shell" +
`renderLogin/paintLogin` in `asc/js/app.js`); live at Smart Solutions
`js/app.js renderGate()` + the login-gate section of `css/app.css`.

- **Startup splash**: the brand mark ALONE (no wordmark), centered on
  the flat canvas with a small load bar (132×3px capsule, brand-color
  fill scaling in ~1s) — then the splash fades (~420 ms) and the gate's
  entrance sequence begins. Splash shows only on first paint, never on
  logout; skipped entirely under reduced motion.
- **Split shell**: one opaque rounded container (36px), `min(880px,
  100% − 32px)`, centered with `margin:auto` on a scrollable canvas.
  White in light; solid anthracite (`#17181C`) in dark — matte, no
  backdrop blur, no highlight ring, no light shafts, ever. Left half is
  a near-black **stage** (`linear-gradient(175deg,#0B0C0E,#17181B)` —
  darker than the dark shell so the split survives both themes); right
  half is the form. Phones stack: compact stage on top.
- **Stage**: brand logo ~50px tall (42px phone), top-left, **depth via a
  brand-colored drop-shadow glow** (`drop-shadow(0 8px 22px
  rgba(brand,.35))`); display-font headline with the second line in 60%
  ink (`<br><span>`); one lead sentence, `max-width:34ch`; **chips replay
  real cached counts** from the last dashboard visit — never fake
  numbers; **corner notch tab** bottom-left: shell-colored label with two
  18px inverted-radius bevels (`radial-gradient(circle at 100% 0%,
  transparent 18px, shell 18.5px)`).
- **Form side**: seg pill top-right on the canvas tone (theme dot: filled
  = light, 2.5px inset ring = dark; plus HR/EN segments when i18n
  exists); title + one quiet sub line; capsule (999px) fields 52px tall,
  no leading icons, eye toggle inside; Google capsule on the canvas
  tone, borderless; quiet lowercase divider with gradient hairlines;
  lone right-aligned forgot link; **gradient capsule CTA**
  (`linear-gradient(140deg, lighter, brand 55%, darker)`) with a quiet
  glow (`0 12px 28px -12px rgba(brand,.30)`) and an arrow that slides
  +3px on hover; centered create-account line.
- **Backdrop**: stylised composition from the palette, never a photo —
  grainy brand bloom top-left, blurred diagonal sash band, huge quiet
  arc bottom-right, fine SVG-noise grain wash (.05), optional cursor
  glow (transform-only, hidden on touch/reduced-motion). Everything
  resolves from heavy blur on startup (`authBgIn` 1.5s); the shell
  emerges once, blur-fade + 8px rise (620 ms); logo splash-fades. After
  startup nothing on the gate animates.

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
