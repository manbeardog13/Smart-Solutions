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
- **Entry flow**: splash (logo on the night scene) → glass login card
  with a diagonal light shaft (`::before` rotated gradient) → animated
  hand-off (gate glides out ~340 ms, never a hard innerHTML cut) →
  dashboard cards **dealt center-out, pairs left/right, settled ≤620 ms**.
- **Edge surfaces**: left rail 72→280 px on edge-hover, pinnable by
  click, first-tap-opens on touch; right shelf = slim red handle at rest,
  glass capsule on hover/focus/tap, monochrome icons until hover, every
  button a real destination. Essential controls (save, alerts, logout,
  theme) are never hidden — phones surface them in the top bar.

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
