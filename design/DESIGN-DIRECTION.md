# Smart Solutions — Design Direction

Transcribed 2026-07-23 from the project owner's design conversation
(ChatGPT "Work" chat with Nero). This is the authoritative design brief for
the platform UI. The visual references it cites live in
`design/inspiration/`; the brand palette anchor is the official logo red
on the Smart Solutions logo (`brand/smart-solutions-logo.png`,
`#DD0426` in the existing reference implementations).

## Design ethos

- Premium Apple-quality feel: silky white underglow, smooth edges,
  beautifully cornered cards, soft bevels, conventional curves.
- Minimalism is key. Keep it clean and never too small.
- Blur and glass everywhere it earns its place — glassy cards are premium.
- Every element of the platform must feel like the reference cards
  (see `design/inspiration/`, esp. `product-card-light-dark.jpeg`,
  `typography-oswald-nunito.jpeg` "Lost Particle" for typography and
  color smoothness; its red maps to the Smart Solutions logo red).
- Where old and new UI mix, redesign the old into the new — no mixed
  generations of UI on one screen.

## Entry flow

1. **Splash screen** when the application starts, before the login card
   appears.
2. **Login gate**: username, password, forgot-password, Login button,
   Login with Google (Google auth planned), create-account link at the
   very bottom.
3. Light/dark **theme slider** available at the login gate — a beautiful
   slider control.
4. **Animated transition from the login card to the dashboard** —
   continuous, not a hard cut.
5. The logo appears as a subtle **animated habit** somewhere persistent —
   e.g. the corner of the menu.

## Navigation (the menu)

Reference: `design/inspiration/glass-sidebar-concept.jpeg` (Netflix-style
frosted rail). Locked decisions:

- Fixed **left-edge rail**: ~72 px collapsed, ~280 px expanded. Hover
  reveal overlays the stage without pushing it. (Amendment 2026-07-24:
  an explicit **pin** keeps the rail open and the stage smoothly makes
  room — a deliberate, user-initiated layout change, not "swim.")
- **Desktop**: moving the pointer to the left edge reveals the menu with a
  fast, silky animation. Clicking can pin it open; selecting an item
  navigates immediately.
- **Tablet/touch**: first tap opens the menu; second tap selects.
- Smart Solutions logo at the top with a restrained red animated
  highlight; clicking it always returns to the Dashboard.
- Profile appears only at the bottom of the menu — never duplicated in
  the upper-right corner.
- Icons large, labels readable, rows at least 48–52 px high.

## Edge-emerging surfaces

Reference: `design/inspiration/hardware-side-button-concept.jpeg`
(buttons that emerge from the device edge). Locked decisions:

- A separate **curved utility shelf emerges from the right edge**
  holding app shortcuts: Spotify, Instagram, Facebook, Gmail.
  (Amendment 2026-07-24: available on every signed-in view, not just the
  Dashboard — same behavior everywhere beats a per-view surprise.)
- At rest only a subtle edge handle / underglow is visible. Moving the
  pointer toward it reveals a compact glass capsule with the app buttons.
- Icons stay monochrome until hovered; brand colors soften in on hover.
- Every button performs a real action — open the service, deep-link to a
  configured destination, or offer a connection screen. **Never a dead
  click.**
- Only optional utilities and secondary actions may hide at the edges.
  Essential controls (search, alerts, incomplete work orders, critical
  stock warnings, Save, Close) stay visible.

## Motion

- Every interaction transition animated, **nonlinear** easing, fast and
  snappy — approximately **180–260 ms** — giving the feel of
  instantaneous response. (Clarification 2026-07-24: the band governs
  interaction feedback. Entrances are separately specified: splash
  ~800 ms, gate hand-off ~340 ms, dashboard deal ≤620 ms.)
- Transform and opacity only; no layout-shift animation; no excessive
  bouncing. Immediate and physical.
- Keyboard focus and an explicit touch handle provide the same reveal
  functionality without hover.
- **Reduced-motion mode removes spatial animation.**

## Quality bar

- Test every functionality; wherever weakness or old/new UI mixing is
  found, redesign immediately.
- Bulletproof alignment; consistent color palette anchored on the logo
  red; light and dark parity for every screen.
- Suggestions that further automate and ease the user experience are
  welcome and expected.
