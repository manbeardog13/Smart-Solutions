# Smart Solutions · Operativa — deployed-build snapshot

This directory is a byte-for-byte snapshot of the live deployment at
https://smart-solutions-operations.manbeardog.chatgpt.site/ taken on
2026-07-23.

## What this is (and is not)

- These are the **compiled build artifacts** the site serves: `index.html`,
  minified JS bundles, one compiled CSS bundle, brand images, and the Geist
  font files. Every asset referenced by `index.html` is present, so the
  snapshot is self-contained and can be served locally
  (e.g. `python3 -m http.server` from this directory).
- This is **not the original source code**. The site was built with a
  Vite-based toolchain and deployed without source maps (all `.map`
  requests return 404), so the original components, tests, and build
  configuration cannot be reconstructed from the deployment. They live in
  the ChatGPT workspace where the app was authored.
- The deployed demo runs client-side: dashboard data (inventory, work
  orders, movements) is in-memory demo data, consistent with the "Demo"
  badge in the UI. The application bundle does embed a Supabase client
  (auth/rest/realtime URL construction), so the build is backend-capable —
  no live endpoint was configured in the deployed demo.

## Inventory

| Path | Role |
| --- | --- |
| `index.html` | Entry page (server-rendered shell + inline bootstrap) |
| `assets/smart-solutions-app-QcY_6y-j.js` | Application bundle (~403 KB) |
| `assets/framework-CXnKph_e.js` | Framework runtime (~185 KB) |
| `assets/index-DE2cOLAw.js` | Entry/bootstrap bundle (~79 KB) |
| `assets/rolldown-runtime-S-ySWqyJ.js`, `assets/layout-segment-context-2HSsJses.js` | Small runtime helpers |
| `assets/index-DxmPwGjo.css` | Compiled stylesheet (~99 KB) |
| `assets/_vinext_fonts/` | Geist and Geist Mono webfonts (11 files) |
| `brand/` | Logo and app icon |
| `favicon.png` | Favicon |

## Why this snapshot exists

The three project repositories contained no platform code; the only live
artifact was the hosted deployment. This snapshot puts the deployed state
under version control so future claims about the platform can be checked
against a concrete, dated reference. The next step for real development is
exporting the actual source from the authoring workspace into this
repository.
