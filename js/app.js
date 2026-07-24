// ============================================================================
// app.js — boot, splash → auth gate → shell, router, theme, device classes.
// Views live in js/views/* and export render(main, ctx). Business rules are
// in domain.js; data in db.js; state in store.js. (ASC platform pattern.)
// ============================================================================

import { getState, setState, loadSession, signIn, signOut, on } from "./store.js";
import { viewsForRole, isFieldRole, deviceClass, VIEW_LABELS } from "./domain.js";
import * as db from "./db.js";
import { esc, icon, go, toast, setThemeColor } from "./ui.js";
import * as motion from "./motion.js";

const VIEW_DEFS = [
  { key: "dashboard", route: "/", ic: "dash", load: () => import("./views/dashboard.js") },
  { key: "warehouse", route: "/warehouse", ic: "box", load: () => import("./views/warehouse.js") },
  { key: "movements", route: "/movements", ic: "move", load: () => import("./views/movements.js") },
  { key: "orders", route: "/orders", ic: "order", load: () => import("./views/orders.js") },
  { key: "scan", route: "/scan", ic: "scan", load: () => import("./views/scan.js") },
  { key: "admin", route: "/admin", ic: "admin", load: () => import("./views/admin.js") },
].map((v) => ({ ...v, label: VIEW_LABELS[v.key] }));

// Utility shelf targets: real destinations, never a dead click.
const SHELF_APPS = [
  { name: "Facebook", url: "https://facebook.com", brand: "#1877F2",
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.09 0 2.23.2 2.23.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>' },
  { name: "Gmail", url: "https://mail.google.com", brand: "#EA4335",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 6 9 7 9-7"/></svg>' },
];

const root = document.getElementById("app-root");
const THEME_KEY = "ss.theme";

// ---- Theme ------------------------------------------------------------------
function isDark() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}
function applyTheme(dark) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  setThemeColor(dark);
  setState({ theme: dark ? "dark" : "light" });
  syncThemeControls();
}
// Theme switches are injected by innerHTML renders; whoever renders one calls
// this so the control always reports the live theme (aria + label).
function syncThemeControls() {
  const dark = isDark();
  document.querySelectorAll(".theme").forEach((el) => {
    el.setAttribute("aria-checked", String(dark));
    el.setAttribute("aria-label", dark ? "Tamno — prebaci na svijetlo" : "Svijetlo — prebaci na tamno");
  });
}
function initTheme() {
  let dark;
  try { dark = JSON.parse(localStorage.getItem(THEME_KEY)); } catch { dark = null; }
  if (dark === null || dark === undefined) dark = matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(dark);
}
function toggleTheme() {
  const dark = document.documentElement.getAttribute("data-theme") !== "dark";
  applyTheme(dark);
  try { localStorage.setItem(THEME_KEY, JSON.stringify(dark)); } catch { /* full */ }
}
const themeButton = () =>
  `<button class="theme" role="switch" aria-checked="false" aria-label="Tamni način" data-theme-toggle>
     <span class="tr"><i></i></span></button>`;

// ---- Device awareness -------------------------------------------------------
function applyDevice() {
  const cls = deviceClass(innerWidth);
  const prev = getState().device;
  document.body.classList.remove("phone", "tablet", "desktop", "ultrawide");
  document.body.classList.add(cls);
  setState({ device: cls });
  // Crossing the phone boundary swaps the whole nav shape — rebuild the shell.
  if (prev !== cls && (prev === "phone" || cls === "phone") &&
      getState().session && document.getElementById("main")) {
    renderShell();
  }
}

// ---- Login gate -------------------------------------------------------------
// The ASC phone-build logon, in Smart Solutions red: one compact frosted
// card (logo top-left, iOS-style theme switch top-right, icon fields,
// uppercase divider, gradient CTA with a soft glow) over a full-viewport
// Dubrovnik backdrop. First paint runs the startup cinematic (js/motion.js):
// backdrop → glass → logo assembly → brand reveal → form.

function renderGate() {
  const first = !renderGate._shown; // startup gets the full cinematic
  renderGate._shown = true;
  // The card logo is the real artwork, pre-split for assembly: four diagonal
  // slices of the mark plus the two-line wordmark behind slide-up masks.
  // Its box is identical to the old single image (audited geometry).
  const logo = `
    <span class="lc-logo lc-asm" role="img" aria-label="smart solutions">
      <span class="asm-mark">
        ${motion.MARK_BANDS.map((p) =>
          `<img class="bar" src="brand/logo-mark.png" alt="" style="clip-path:${p}">`).join("")}
        <i class="asm-sheen" aria-hidden="true"></i>
      </span>
      <span class="asm-word" aria-hidden="true">
        <span class="w-clip w-top"><img src="brand/logo-word.png" alt=""></span>
        <span class="w-clip w-bot"><img src="brand/logo-word.png" alt=""></span>
      </span>
    </span>`;
  root.innerHTML = `
    <div class="gate">
      <div class="auth-bg" aria-hidden="true"></div>
      <div class="auth-photo" aria-hidden="true"></div>
      <div class="auth-veil" aria-hidden="true"></div>
      <img class="mbd-sig" src="brand/mbd13.png" alt="" aria-hidden="true">
      <div class="login-card" role="dialog" aria-label="Prijava">
        <div class="lc-top">
          ${logo}
          <button type="button" class="theme sw" role="switch" aria-checked="false"
                  aria-label="Tamni način" data-theme-toggle><i></i></button>
        </div>
        <h1 class="auth-title" data-cine>Dobrodošli natrag</h1>
        <p class="auth-sub" data-cine>Operativa · Dubrovnik</p>
        <form id="login-form" class="auth-form" novalidate>
          <button type="button" class="btn-google" data-google data-cine>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2.1 3.7-5.1 3.7-8.6z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5.1L1.3 17.2C3.3 21.2 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.3a7.5 7.5 0 0 1 0-4.6L1.3 6.8a12 12 0 0 0 0 10.4l3.9-2.9z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l2.7-2.7C16.9 1.3 14.2 0 12 0 7.3 0 3.3 2.8 1.3 6.8l3.9 2.9c.9-3 3.6-5 6.8-5z"/></svg>
            <span>Nastavi s Google</span>
          </button>
          <div class="auth-divider" data-cine><span>ili email</span></div>
          <label class="fieldx" data-cine>
            <span class="fx-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 6.5 9 6.5 9-6.5"/></svg></span>
            <input id="lg-user" autocomplete="username" placeholder="ime@smart-solutions.hr"
                   aria-label="Email"></label>
          <label class="fieldx" data-cine>
            <span class="fx-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10.5" width="16" height="10" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg></span>
            <input id="lg-pass" type="password" autocomplete="current-password" placeholder="Lozinka"
                   aria-label="Lozinka">
            <button type="button" class="fx-eye" data-eye aria-label="Prikaži lozinku" aria-pressed="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.7"/></svg>
            </button></label>
          <div class="auth-row auth-row--end" data-cine>
            <button type="button" class="auth-forgot" data-forgot>Zaboravljena lozinka?</button>
          </div>
          <button class="btn-brand" type="submit" data-cine>Prijavi se
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
          <p class="auth-msg" role="status" aria-live="polite"></p>
          <p class="auth-create" data-cine>Prvi put? <button type="button" class="auth-create-link" data-create>Napravi račun</button></p>
        </form>
      </div>
    </div>`;

  // First paint: the startup cinematic. Repeat visits (logout) get the quick
  // static card — the timeline's final frame IS the static design, so a
  // missing GSAP or reduced motion simply starts there.
  const gateEl = root.querySelector(".gate");
  if (first) {
    if (!motion.gateIntro(gateEl)) gateEl.classList.add("plain");
  } else {
    gateEl.classList.add("plain");
  }

  // eye toggle: show/hide the password
  const pass = root.querySelector("#lg-pass");
  const eye = root.querySelector("[data-eye]");
  eye.onclick = () => {
    const show = pass.type === "password";
    pass.type = show ? "text" : "password";
    eye.setAttribute("aria-pressed", String(show));
    eye.setAttribute("aria-label", show ? "Sakrij lozinku" : "Prikaži lozinku");
  };

  // The switch emits a short brand-red micro-glow whenever it is pressed —
  // the color is the company's, hardcoded by the platform standard.
  const sw = root.querySelector(".sw");
  if (sw) sw.addEventListener("click", () => {
    sw.classList.add("kick");
    setTimeout(() => sw.classList.remove("kick"), 450);
  });

  syncThemeControls();
  const soon = () => toast("Dostupno s produkcijskim backendom (Supabase).");
  root.querySelector("[data-google]").onclick = soon;
  root.querySelector("[data-forgot]").onclick = soon;
  root.querySelector("[data-create]").onclick = soon;
  // Demo mode: Prijava signs straight in. The typed name can pick a role
  // (marko -> field tech, ana -> warehouse); anything else is the owner.
  root.querySelector("#login-form").onsubmit = (e) => {
    e.preventDefault();
    if (renderGate._leaving) return; // hand-off already running
    renderGate._leaving = true;
    const typed = (root.querySelector("#lg-user").value || "").toLowerCase();
    const users = db.demoUsers();
    const user = users.find((u) => typed.includes(u.name.toLowerCase())) ||
                 users.find((u) => u.role === "vlasnik");
    signIn(user);
    // The logo IS the transition: bars stretch into rails, the mark flies to
    // the top-bar brand button, the dashboard deals in beneath. Reduced
    // motion (or no GSAP) goes straight to the shell.
    motion.gateToShell((fresh) => { renderGate._leaving = false; renderShell(fresh); });
  };
}

// ---- App shell --------------------------------------------------------------
let currentMain = null;

function navForSession(session) {
  const allowed = viewsForRole(session.role, db.getVisibilityOverride() || undefined);
  return VIEW_DEFS.filter((v) => allowed.includes(v.key));
}

const SIDE_KEY = "ss.side";

function renderShell(freshLogin = false) {
  const { session } = getState();
  if (!session) { renderGate(); return; }
  document.body.classList.toggle("field-mode", isFieldRole(session.role));
  const nav = navForSession(session);
  const html = document.documentElement;
  let railMode = false;
  try { railMode = localStorage.getItem(SIDE_KEY) === "rail"; } catch { /* default */ }
  html.setAttribute("data-side", railMode ? "rail" : "full");
  html.classList.remove("side-open");
  root.innerHTML = `
    <div class="wash"></div>
    <div class="grain" aria-hidden="true"></div>
    <img class="mbd-sig" src="brand/mbd13.png" alt="" aria-hidden="true">
    <aside class="side ${freshLogin ? "enter" : ""}" id="side" aria-label="Glavni izbornik">
      <div class="sb-head">
        <span class="sb-eyebrow">Izbornik</span>
        <button class="sb-collapse" data-collapse aria-label="Suzi izbornik">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
        </button>
      </div>
      <nav class="sb-nav">
        ${nav.map((v) => `
          <button class="sb-item" data-m="${esc(v.key)}" data-route="${esc(v.route)}"
                  aria-label="${esc(v.label)}">
            ${icon(v.ic)}<span class="t">${esc(v.label)}</span>
          </button>`).join("")}
      </nav>
      <div class="sb-foot">
        <button class="sb-item theme" role="switch" aria-checked="false" data-theme-toggle>
          <span class="md" aria-hidden="true"><i></i></span><span class="t">Tema</span>
        </button>
        <div class="sb-user">
          <span class="sb-ava">${esc(session.name[0])}<span class="dot"></span></span>
          <span class="sb-uid"><b>${esc(session.name)}</b><span>${esc(session.title)}</span></span>
          <button class="sb-logout" data-logout aria-label="Odjava">${icon("logout")}</button>
        </div>
      </div>
    </aside>
    <div class="side-scrim" data-scrim aria-hidden="true"></div>
    <div class="appwrap">
      <main class="shell">
        <header class="top">
          <button class="brand-btn" data-burger aria-label="Izbornik" aria-expanded="false">
            <img class="brand-mark" src="brand/logo-mark.png" alt="">
          </button>
          <img class="top-word" src="brand/logo-word.png" alt="smart solutions">
          <h1 id="page-title" class="pgt" tabindex="-1">Ploča</h1>
          ${db.isLive() ? "" : '<span class="demo-badge">Demo</span>'}
        </header>
        <div class="stage" id="main"></div>
      </main>
    </div>
    <div class="shelf" id="shelf">
      <button class="handle" data-shelf-toggle aria-expanded="false"
              aria-label="Brze aplikacije"></button>
      <div class="capsule">
        ${SHELF_APPS.map((a) => `
          <a href="${a.url}" target="_blank" rel="noopener" aria-label="${esc(a.name)}"
             style="--brand:${a.brand}">${a.svg}</a>`).join("")}
      </div>
    </div>`;

  currentMain = document.getElementById("main");
  syncThemeControls();
  const logout = () => {
    closeScrims();
    html.classList.remove("side-open");
    signOut();
    document.body.classList.remove("field-mode");
    const t = document.getElementById("toast");
    if (t) t.classList.remove("on"); // previous user's last action must not linger
    try { history.replaceState(null, "", location.pathname + location.search); } catch { /* file:// */ }
    renderGate();
    const card = root.querySelector(".login-card");
    if (card) { card.setAttribute("tabindex", "-1"); card.focus({ preventScroll: true }); }
  };
  root.querySelector("[data-logout]").onclick = logout;

  // Collapse to the 72px icon rail (persisted) — desktop only, CSS hides it on
  // phones where the same sidebar slides in as an overlay instead.
  root.querySelector("[data-collapse]").onclick = () => {
    const now = html.getAttribute("data-side") === "rail" ? "full" : "rail";
    html.setAttribute("data-side", now);
    try { localStorage.setItem(SIDE_KEY, now); } catch { /* fine */ }
  };

  // The SS mark is the menu control: phone opens the left overlay, desktop
  // toggles the icon rail. Every press gets the spring kick animation.
  const burger = root.querySelector("[data-burger]");
  const kick = () => {
    burger.classList.remove("kick");
    void burger.offsetWidth; // restart the animation on rapid presses
    burger.classList.add("kick");
  };
  const setSide = (open) => {
    const was = html.classList.contains("side-open");
    html.classList.toggle("side-open", open);
    burger.setAttribute("aria-expanded", String(open));
    // keyboard/AT: focus follows the overlay in, and back out to the burger
    if (open && !was) {
      const firstItem = root.querySelector(".sb-item");
      if (firstItem) setTimeout(() => firstItem.focus({ preventScroll: true }), 340);
    } else if (!open && was && document.activeElement &&
               document.activeElement.closest && document.activeElement.closest(".side")) {
      burger.focus({ preventScroll: true });
    }
  };
  burger.onclick = () => {
    kick();
    if (matchMedia("(max-width: 1020px)").matches) {
      setSide(!html.classList.contains("side-open"));
    } else {
      const now = html.getAttribute("data-side") === "rail" ? "full" : "rail";
      html.setAttribute("data-side", now);
      try { localStorage.setItem(SIDE_KEY, now); } catch { /* fine */ }
    }
  };
  root.querySelector("[data-scrim]").onclick = () => setSide(false);

  root.querySelectorAll(".sb-item[data-route]").forEach((btn) => {
    btn.onclick = () => { setSide(false); go(btn.dataset.route); };
  });

  // Shelf: the handle is a real button, so touch and keyboard both work.
  const shelf = document.getElementById("shelf");
  const handle = root.querySelector("[data-shelf-toggle]");
  handle.onclick = () => {
    const open = shelf.classList.toggle("open");
    handle.setAttribute("aria-expanded", String(open));
  };

  route(freshLogin);
}

// Escape closes the phone sidebar overlay — bound once at boot. Goes through
// the same state as every other close path: burger aria stays true to reality
// and focus returns to the burger instead of stranding on a hidden item.
function sideEscCloser(e) {
  if (e.key !== "Escape") return;
  const html = document.documentElement;
  if (!html.classList.contains("side-open")) return;
  html.classList.remove("side-open");
  const burger = document.querySelector("[data-burger]");
  if (burger) {
    burger.setAttribute("aria-expanded", "false");
    burger.focus({ preventScroll: true });
  }
}

// Body-level overlays (reorder scrims) must never outlive the view or the
// session that opened them.
function closeScrims() {
  document.querySelectorAll(".scrim").forEach((s) => {
    if (typeof s._close === "function") s._close(); else s.remove();
  });
}

// ---- Router -----------------------------------------------------------------
// routeSeq guards against the async race: two rapid hash changes both await
// their dynamic imports, and without the token the slower (stale) view would
// win the innerHTML write. Only the newest sequence may render.
let routeSeq = 0;

async function route(freshLogin = false) {
  const { session } = getState();
  if (!session) {
    // Never rebuild an already-visible gate (it would wipe typed input).
    if (!root.querySelector(".gate")) renderGate();
    return;
  }
  // A hashchange can arrive while the splash still covers a not-yet-built
  // shell — build it first; renderShell() re-enters route() itself.
  if (!currentMain || !document.getElementById("main")) { renderShell(freshLogin); return; }
  closeScrims();
  const seq = ++routeSeq;
  const hash = location.hash.replace(/^#/, "") || "/";
  const nav = navForSession(session);
  const itemMatch = hash.match(/^\/item\/([^/?]+)/);
  const wh = itemMatch ? nav.find((v) => v.key === "warehouse") : null;
  const def = nav.find((v) => v.route === hash) || wh || nav[0];
  // Normalize unknown or disallowed hashes so the URL never lies about the
  // view — including item deep links a role cannot open.
  if (hash !== def.route && !(itemMatch && wh)) {
    try { history.replaceState(null, "", "#" + def.route); } catch { /* file:// */ }
    if (itemMatch && !wh) toast("Nemate pristup skladištu za ovu naljepnicu.");
  }
  setState({ route: def.route });
  document.querySelectorAll(".sb-item[data-route]").forEach((b) => {
    const on = b.dataset.route === def.route;
    b.classList.toggle("on", on);
    if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  const title = document.getElementById("page-title");
  if (title) title.textContent = def.label;
  let mod;
  try {
    mod = await def.load();
  } catch {
    if (seq === routeSeq && currentMain) {
      currentMain.innerHTML = `
        <div class="panel"><div class="row"><span class="b">
          <span class="n">Učitavanje nije uspjelo.</span>
          <span class="a">Provjeri vezu i pokušaj ponovno.</span></span>
          <button class="btn btn-ghost" data-retry>Pokušaj ponovno</button></div></div>`;
      const r = currentMain.querySelector("[data-retry]");
      if (r) r.onclick = () => route();
    }
    return;
  }
  if (seq !== routeSeq || getState().session !== session) return; // superseded
  currentMain.innerHTML = "";
  mod.render(currentMain, {
    session, hash, freshLogin,
    views: nav.map((v) => v.key),
    itemId: itemMatch && wh ? decodeSafe(itemMatch[1]) : null,
  });
  // Keyboard/screen-reader users land on the new view's title, not in limbo —
  // including right after login, where the old gate button no longer exists.
  if (title) title.focus({ preventScroll: true });
}

function decodeSafe(part) {
  try { return decodeURIComponent(part); } catch { return part; }
}

// ---- Boot -------------------------------------------------------------------
function boot() {
  initTheme();
  applyDevice();
  addEventListener("resize", applyDevice);
  addEventListener("hashchange", () => route());
  document.addEventListener("keydown", sideEscCloser);
  // Another tab changed the shared demo DB or the session — reflect it here.
  addEventListener("storage", (e) => {
    if (e.key === "ss.demo.db" && getState().session) route();
    if (e.key === "ss.session" && !e.newValue && getState().session) {
      signOut(); renderGate();
    }
  });
  // Follow OS theme changes live unless the user chose a theme explicitly.
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", (e) => {
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(THEME_KEY)); } catch { /* none */ }
    if (stored === null || stored === undefined) applyTheme(e.matches);
  });
  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest("[data-theme-toggle]");
    if (t) toggleTheme();
  });
  on("auth", () => { /* future: realtime (re)subscribe here */ });

  loadSession();
  if (getState().session) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      renderShell();
    } else {
      // the standard's launch sequence applies to warm sessions too:
      // brand mark -> (already authenticated) -> role dashboard
      root.innerHTML = `
        <div class="splash" aria-hidden="true">
          <div class="sp-core">
            <img class="sp-mark" src="brand/logo-mark.png" alt="">
            <i class="sp-rule"></i>
          </div>
        </div>`;
      const sp = root.querySelector(".splash");
      const goShell = () => { if (sp.isConnected) renderShell(); };
      sp.addEventListener("click", goShell);
      setTimeout(goShell, 900);
    }
  } else {
    renderGate();
  }
}

boot();
