// ============================================================================
// app.js — boot, splash → auth gate → shell, router, theme, device classes.
// Views live in js/views/* and export render(main, ctx). Business rules are
// in domain.js; data in db.js; state in store.js. (ASC platform pattern.)
// ============================================================================

import { getState, setState, loadSession, signIn, signOut, on } from "./store.js";
import { viewsForRole, isFieldRole, deviceClass, VIEW_LABELS } from "./domain.js";
import * as db from "./db.js";
import { esc, icon, go, setThemeColor } from "./ui.js";

const VIEW_DEFS = [
  { key: "dashboard", route: "/", ic: "dash", load: () => import("./views/dashboard.js") },
  { key: "warehouse", route: "/warehouse", ic: "box", load: () => import("./views/warehouse.js") },
  { key: "movements", route: "/movements", ic: "move", load: () => import("./views/movements.js") },
  { key: "orders", route: "/orders", ic: "order", load: () => import("./views/orders.js") },
  { key: "scan", route: "/scan", ic: "scan", load: () => import("./views/scan.js") },
  { key: "admin", route: "/admin", ic: "admin", load: () => import("./views/admin.js") },
].map((v) => ({ ...v, label: VIEW_LABELS[v.key] }));

// The real logo artwork (brand/, background removed). logo-fx adds the
// masked sheen sweep + lift on hover; logo-idle breathes a soft red glow.
const MARK_IMG = `<span class="logo-fx logo-mark-fx logo-idle"><img src="brand/logo-mark.png" alt=""></span>`;
const WORD_IMG = `<span class="logo-fx logo-word-fx"><img src="brand/logo-word.png" alt="smart solutions"></span>`;

// Utility shelf targets: real destinations, never a dead click.
const SHELF_APPS = [
  { name: "Spotify", url: "https://open.spotify.com", brand: "#1DB954",
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.5a.62.62 0 0 1-.86.2c-2.36-1.44-5.33-1.77-8.82-.97a.62.62 0 1 1-.28-1.21c3.82-.88 7.1-.5 9.75 1.12.3.18.39.57.21.86zm1.23-2.72a.78.78 0 0 1-1.07.26c-2.7-1.66-6.82-2.14-10-1.17a.78.78 0 1 1-.46-1.5c3.65-1.1 8.18-.57 11.28 1.34.36.23.48.7.25 1.07zm.1-2.83C14.7 9.03 9.4 8.85 6.32 9.79a.94.94 0 1 1-.55-1.8c3.55-1.08 9.4-.87 13.12 1.34a.94.94 0 0 1-.96 1.62z"/></svg>' },
  { name: "Instagram", url: "https://instagram.com", brand: "#E4405F",
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" stroke="none"/></svg>' },
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
    const lbl = el.querySelector(".lbl");
    if (lbl) lbl.textContent = dark ? "Tamno" : "Svijetlo";
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
     <span class="tr"><i></i></span><span class="lbl">Svijetlo</span></button>`;

// ---- Device awareness -------------------------------------------------------
function applyDevice() {
  const cls = deviceClass(innerWidth);
  document.body.classList.remove("phone", "tablet", "desktop", "ultrawide");
  document.body.classList.add(cls);
  setState({ device: cls });
}

// ---- Login gate -------------------------------------------------------------
function renderGate() {
  const users = db.demoUsers();
  root.innerHTML = `
    <div class="gate">
      <div class="gate-bg"></div>
      ${themeButton()}
      <div class="login" role="dialog" aria-label="Prijava">
        <div class="mark logo-fx logo-mark-fx logo-idle"><img src="brand/logo-mark.png" alt=""></div>
        <div class="word">${WORD_IMG}</div>
        <p class="sub">Operativa · nadzor i upravljanje</p>
        <form id="login-form">
          <label for="lg-user">Korisničko ime</label>
          <input id="lg-user" autocomplete="username" placeholder="ime@smart-solutions.hr">
          <label for="lg-pass">Lozinka</label>
          <input id="lg-pass" type="password" autocomplete="current-password" placeholder="••••••••">
          <div class="aux">
            <span></span><button type="button" data-forgot>Zaboravljena lozinka?</button>
          </div>
          <button class="btn btn-red" type="submit">Prijava</button>
        </form>
        <div class="or">ili</div>
        <button class="btn btn-ghost" data-google>
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2.1 3.7-5.1 3.7-8.6z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5.1L1.3 17.2C3.3 21.2 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.3a7.5 7.5 0 0 1 0-4.6L1.3 6.8a12 12 0 0 0 0 10.4l3.9-2.9z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l2.7-2.7C16.9 1.3 14.2 0 12 0 7.3 0 3.3 2.8 1.3 6.8l3.9 2.9c.9-3 3.6-5 6.8-5z"/></svg>
          Prijava Google računom
        </button>
        <div class="meta" style="margin:18px 2px 6px;text-align:center">Demo računi</div>
        <div class="demo-users">
          ${users.map((u) => `
            <button class="demo-user" data-user="${esc(u.id)}">
              <span class="av">${esc(u.name[0])}</span>
              <span><b>${esc(u.name)}</b><span>${esc(u.title)}</span></span>
            </button>`).join("")}
        </div>
        <div class="create">Nemate račun? <button data-create>Registracija</button></div>
      </div>
    </div>`;

  syncThemeControls();
  const soon = () => import("./ui.js").then(({ toast }) =>
    toast("Dostupno s produkcijskim backendom (Supabase)."));
  root.querySelector("[data-google]").onclick = soon;
  root.querySelector("[data-forgot]").onclick = soon;
  root.querySelector("[data-create]").onclick = soon;
  root.querySelector("#login-form").onsubmit = (e) => { e.preventDefault(); soon(); };
  root.querySelectorAll("[data-user]").forEach((btn) => {
    btn.onclick = () => {
      if (root.querySelector(".gate.out")) return; // hand-off already running
      const user = db.demoUsers().find((u) => u.id === btn.dataset.user);
      signIn(user);
      // Continuous transition, not a hard cut: the gate glides out, the
      // dashboard deals in. Reduced motion goes straight to the shell.
      const gate = root.querySelector(".gate");
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || !gate) { renderShell(true); return; }
      gate.classList.add("out");
      let done = false;
      const finish = () => { if (!done) { done = true; renderShell(true); } };
      gate.addEventListener("animationend", finish, { once: true });
      setTimeout(finish, 380); // safety: never strand the user on the gate
    };
  });
}

// ---- App shell --------------------------------------------------------------
let currentMain = null;

function navForSession(session) {
  const allowed = viewsForRole(session.role, db.getVisibilityOverride() || undefined);
  return VIEW_DEFS.filter((v) => allowed.includes(v.key));
}

const PIN_KEY = "ss.railPinned";

function renderShell(freshLogin = false) {
  const { session } = getState();
  if (!session) { renderGate(); return; }
  document.body.classList.toggle("field-mode", isFieldRole(session.role));
  const nav = navForSession(session);
  let pinned = false;
  try { pinned = JSON.parse(localStorage.getItem(PIN_KEY)) === true; } catch { /* default */ }
  if (document.body.classList.contains("phone")) pinned = false; // bottom bar, nothing to pin
  root.innerHTML = `
    <div class="shell ${pinned ? "pinned" : ""}">
      <div class="wash"></div>
      <aside class="rail ${pinned ? "open" : ""}" id="rail">
        <button class="brand" data-home aria-label="Na ploču">
          <span class="mark">${MARK_IMG}</span><span class="wm-img">${WORD_IMG}</span>
        </button>
        <button class="nl pin" data-pin aria-pressed="${pinned}" title="Zakvači izbornik">
          ${icon("pin")}<span class="txt">Zakvači izbornik</span>
        </button>
        <nav>
          ${nav.map((v) => `
            <button class="nl" data-route="${esc(v.route)}" data-key="${esc(v.key)}">
              ${icon(v.ic)}<span class="txt">${esc(v.label)}</span>
            </button>`).join("")}
        </nav>
        <div class="foot">
          ${themeButton()}
          <button class="nl" data-logout>${icon("logout")}<span class="txt">Odjava</span></button>
          <div class="acct"><span class="av">${esc(session.name[0])}</span>
            <span><b>${esc(session.name)}</b><span>${esc(session.title)}</span></span></div>
        </div>
      </aside>
      <main>
        <div class="top">
          <h1 id="page-title" tabindex="-1">Ploča</h1>
          ${db.isLive() ? "" : '<span class="demo-badge">Demo</span>'}
          <div class="right">
            <span class="top-mini">${themeButton()}</span>
            <button class="top-mini top-logout" data-logout-top aria-label="Odjava">${icon("logout")}</button>
          </div>
        </div>
        <div class="stage" id="main"></div>
      </main>
      <div class="shelf" id="shelf">
        <div class="capsule">
          ${SHELF_APPS.map((a) => `
            <a href="${a.url}" target="_blank" rel="noopener" aria-label="${esc(a.name)}"
               style="--brand:${a.brand}">${a.svg}</a>`).join("")}
        </div>
        <button class="handle" data-shelf-toggle aria-expanded="false"
                aria-label="Brze aplikacije"></button>
      </div>
    </div>`;

  currentMain = document.getElementById("main");
  syncThemeControls();
  const logout = () => {
    closeScrims();
    signOut();
    document.body.classList.remove("field-mode");
    try { history.replaceState(null, "", location.pathname + location.search); } catch { /* file:// */ }
    renderGate();
  };
  root.querySelector("[data-home]").onclick = () => go("/");
  root.querySelector("[data-logout]").onclick = logout;
  root.querySelector("[data-logout-top]").onclick = logout;

  // Pin: clicking keeps the rail open and the stage makes room (spec).
  const rail = document.getElementById("rail");
  const shellEl = root.querySelector(".shell");
  root.querySelector("[data-pin]").onclick = (e) => {
    const now = !shellEl.classList.contains("pinned");
    shellEl.classList.toggle("pinned", now);
    rail.classList.toggle("open", now);
    e.currentTarget.setAttribute("aria-pressed", String(now));
    try { localStorage.setItem(PIN_KEY, JSON.stringify(now)); } catch { /* fine */ }
  };

  // Nav. On touch (no hover) the first tap opens the menu, the second selects.
  const touchOnly = matchMedia("(hover: none)").matches;
  root.querySelectorAll("[data-route]").forEach((btn) => {
    btn.onclick = () => {
      const phone = document.body.classList.contains("phone");
      if (touchOnly && !phone && !rail.classList.contains("open")) {
        rail.classList.add("open");
        return;
      }
      if (touchOnly && !shellEl.classList.contains("pinned")) rail.classList.remove("open");
      go(btn.dataset.route);
    };
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

// One document-level closer for the touch rail — bound once at boot, reads
// the live DOM, so re-renders never stack listeners.
function railOutsideCloser(e) {
  const rail = document.getElementById("rail");
  const shell = document.querySelector(".shell");
  if (!rail || !shell) return;
  if (!rail.contains(e.target) && !shell.classList.contains("pinned")) {
    rail.classList.remove("open");
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
    if (itemMatch && !wh) {
      import("./ui.js").then(({ toast }) => toast("Nemate pristup skladištu za ovu naljepnicu."));
    }
  }
  setState({ route: def.route });
  document.querySelectorAll(".nl[data-route]").forEach((b) =>
    b.classList.toggle("on", b.dataset.route === def.route));
  const title = document.getElementById("page-title");
  if (title) title.textContent = def.label;
  const mod = await def.load();
  if (seq !== routeSeq || getState().session !== session) return; // superseded
  currentMain.innerHTML = "";
  mod.render(currentMain, {
    session, hash, freshLogin,
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
  if (matchMedia("(hover: none)").matches) {
    document.addEventListener("pointerdown", railOutsideCloser, { passive: true });
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest && e.target.closest("[data-theme-toggle]");
    if (t) toggleTheme();
  });
  on("auth", () => { /* future: realtime (re)subscribe here */ });

  loadSession();
  const splash = document.getElementById("splash");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const showApp = () => (getState().session ? renderShell() : renderGate());
  if (reduce) {
    splash.remove();
    showApp();
  } else {
    setTimeout(() => {
      splash.classList.add("out");
      splash.addEventListener("animationend", () => splash.remove(), { once: true });
      showApp();
    }, 850);
  }
}

boot();
