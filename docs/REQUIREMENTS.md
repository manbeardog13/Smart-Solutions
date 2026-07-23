# Smart Solutions — Functional Requirements

Transcribed 2026-07-23 from the project owner's product conversation
(ChatGPT "Work" chat). Visual/motion rules live in
`design/DESIGN-DIRECTION.md`; this file captures what the platform must
do. Original directives were partly in Croatian; meaning preserved.

## Roles and permissions

- **Platform administrators** decide how much of the platform's content
  each role can see.
- **Vido (company owner)** sees the entire platform.
- **Majstori (field technicians)** see: warehouse state, upcoming jobs,
  current clients, QR-code scanning, and similar operational views.
- **Warehouse employees** (receive goods daily, stack them, take them to
  the field at end of day) have their own place on the platform.
- Technicians are mostly in the field and short on time. Their interface
  is adapted to minimize errors and maximize efficiency: **big buttons,
  big numbers, big letters** (see `design/inspiration/` references).

## Product catalogue

The company catalogue of full-resolution product photos is the
**authoritative visual library** for every product. Its images appear in:

- Warehouse inventory, search results, and product details.
- QR-scan confirmation — show the exact product before any action.
- Receiving, issuing, returning, and work-order material selection.
- Low-stock alerts and procurement recommendations.
- Large, zoomable product previews to reduce employee mistakes.

Original full-resolution files are preserved; optimized WebP/AVIF
thumbnails load in lists. No generic stock photos or invented
substitutes. Imagery sits inside clean glass cards without compromising
minimalism.

## Inventory, QR codes, and suppliers

- QR codes are printed as **stickers** placed on physical parts — the
  design must be compact (current ones beautiful but too big).
- A scanned QR must identify **which supplier the product comes from**.
- The platform tracks a **stock counter** per part. When stock reaches a
  minimum threshold (e.g. 10), the platform offers to **order** those
  parts — which requires the supplier from the QR data.
- For bigger parts: the user can **upload or take a picture**, and Gemini
  automatically extracts the information (serial code etc.) and creates a
  QR code for that machine. If Gemini is not 100% sure of a character, it
  asks the user for a better picture.

## Splash, device adaptation, and dashboard entrance

- On launch: splash screen with the logo, then the logon card, with a
  picture behind (catalogue photography).
- The application must always know what device it is on: mobile adjusts
  for mobile, tablet for tablet.
- Desktop must know the monitor dimensions and use the whole browser
  viewport — no centered middle-column strip.
- On wide screens, the splash → login → dashboard transition covers ~80%
  of the monitor width, **sequentially animated: cards dealt to the left
  and right from the middle**, stylized but not overwhelming.
- Critical stock and work-order information stays visible during motion.

## Branding

- The logo is to be **refined, not redesigned**: symmetrical, reasoned
  spacing, textured, three-dimensional, animated, background removed.
  The logo is what it is — it just needs to be well made.
- A subtle animated logo habit lives somewhere persistent (e.g. corner of
  the menu).

## MBD Premium Platform DNA (permanent standard)

Locked as the default starting standard for every future MBD product:

- Minimal, role-focused interfaces with strong hierarchy.
- Silky surfaces, subtle texture and atmospheric underglow.
- Premium translucent glass cards with controlled blur.
- Soft, carefully rounded edges and refined bevels.
- Fast nonlinear animations that feel physical and instantaneous.
- Smooth transitions, immediate feedback and no dead controls.
- Progressive disclosure instead of crowded screens.
- Consistent refinement across desktop, tablet and mobile.
- Accessibility, reduced-motion support and performance fallbacks.
- Full visual, functional and multi-agent review before release.

Craftsmanship and methodology stay consistent; each client gets its own
branding, colors, information density and workflows. Glass, blur or
animation are never used where they reduce readability, speed or
operational accuracy.

## Verification policy

Claims of completed work ("build passes", "N tests green",
"implemented and fully reviewed") are treated as unverified until they
are reproducible from this repository. Evidence lives in version
control: code, tests, and CI output — not chat transcripts. The release
command ("Da, objavi.") is only actionable after independent
verification against this repo.
