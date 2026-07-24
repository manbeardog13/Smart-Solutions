// ============================================================================
// app.js — boot, splash → auth gate → shell, router, theme, device classes.
// Views live in js/views/* and export render(main, ctx). Business rules are
// in domain.js; data in db.js; state in store.js. (ASC platform pattern.)
// ============================================================================

import { getState, setState, loadSession, signIn, signOut, on } from "./store.js";
import { viewsForRole, isFieldRole, deviceClass, VIEW_LABELS } from "./domain.js";
import * as db from "./db.js";
import { esc, icon, go, toast, setThemeColor } from "./ui.js";

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
function renderGate() {
  const first = !renderGate._shown; // startup gets the full entrance sequence
  renderGate._shown = true;
  root.innerHTML = `
    <div class="gate ${first ? "enter" : ""}">
      <div class="gate-bg"></div>
      <div class="login" role="dialog" aria-label="Prijava">
        <div class="login-top">
          <span class="logo-fx logo-full-fx ${first ? "shine-once" : ""} login-logo">
            <img src="brand/logo-full.png" alt="smart solutions"></span>
          ${themeButton()}
        </div>
        <h1 class="hello">Dobrodošli natrag</h1>
        <p class="hello-sub">Operativa · Dubrovnik</p>
        <button class="btn btn-google" data-google>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2.1 3.7-5.1 3.7-8.6z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5.1L1.3 17.2C3.3 21.2 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.3a7.5 7.5 0 0 1 0-4.6L1.3 6.8a12 12 0 0 0 0 10.4l3.9-2.9z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l2.7-2.7C16.9 1.3 14.2 0 12 0 7.3 0 3.3 2.8 1.3 6.8l3.9 2.9c.9-3 3.6-5 6.8-5z"/></svg>
          Nastavi s Google
        </button>
        <div class="or">ili email</div>
        <form id="login-form">
          <div class="field">
            <svg class="f-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 6.5 9 6.5 9-6.5"/></svg>
            <input id="lg-user" autocomplete="username" placeholder="ime@smart-solutions.hr"
                   aria-label="Email">
          </div>
          <div class="field">
            <svg class="f-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10.5" width="16" height="10" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg>
            <input id="lg-pass" type="password" autocomplete="current-password" placeholder="Lozinka"
                   aria-label="Lozinka">
            <button type="button" class="f-eye" data-eye aria-label="Prikaži lozinku" aria-pressed="false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.7"/></svg>
            </button>
          </div>
          <div class="aux"><span></span>
            <button type="button" data-forgot>Zaboravljena lozinka?</button></div>
          <button class="btn btn-red btn-cta" type="submit">Prijavi se
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </form>
        <div class="create">Prvi put? <button data-create>Napravi račun</button></div>
      </div>
    </div>`;

  // eye toggle: show/hide the password
  const pass = root.querySelector("#lg-pass");
  const eye = root.querySelector("[data-eye]");
  eye.onclick = () => {
    const show = pass.type === "password";
    pass.type = show ? "text" : "password";
    eye.setAttribute("aria-pressed", String(show));
    eye.setAttribute("aria-label", show ? "Sakrij lozinku" : "Prikaži lozinku");
  };

  syncThemeControls();
  const soon = () => toast("Dostupno s produkcijskim backendom (Supabase).");
  root.querySelector("[data-google]").onclick = soon;
  root.querySelector("[data-forgot]").onclick = soon;
  root.querySelector("[data-create]").onclick = soon;
  // Demo mode: Prijava signs straight in. The typed name can pick a role
  // (marko -> field tech, ana -> warehouse); anything else is the owner.
  root.querySelector("#login-form").onsubmit = (e) => {
    e.preventDefault();
    if (root.querySelector(".gate.out")) return; // hand-off already running
    const typed = (root.querySelector("#lg-user").value || "").toLowerCase();
    const users = db.demoUsers();
    const user = users.find((u) => typed.includes(u.name.toLowerCase())) ||
                 users.find((u) => u.role === "vlasnik");
    signIn(user);
    // Continuous transition, not a hard cut: the gate glides out, the
    // dashboard deals in. Reduced motion goes straight to the shell.
    const gate = root.querySelector(".gate");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !gate) { renderShell(true); return; }
    gate.classList.add("out");
    let done = false;
    const finish = () => { if (!done) { done = true; renderShell(true); } };
    gate.addEventListener("animationend", (e2) => { if (e2.target === gate) finish(); });
    setTimeout(finish, 380); // safety: never strand the user on the gate
  };
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
        <button class="handle" data-shelf-toggle aria-expanded="false"
                aria-label="Brze aplikacije"></button>
        <div class="capsule">
          ${SHELF_APPS.map((a) => `
            <a href="${a.url}" target="_blank" rel="noopener" aria-label="${esc(a.name)}"
               style="--brand:${a.brand}">${a.svg}</a>`).join("")}
        </div>
      </div>
    </div>`;

  currentMain = document.getElementById("main");
  syncThemeControls();
  const logout = () => {
    closeScrims();
    signOut();
    document.body.classList.remove("field-mode");
    const t = document.getElementById("toast");
    if (t) t.classList.remove("on"); // previous user's last action must not linger
    try { history.replaceState(null, "", location.pathname + location.search); } catch { /* file:// */ }
    renderGate();
    const card = root.querySelector(".login");
    if (card) { card.setAttribute("tabindex", "-1"); card.focus({ preventScroll: true }); }
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
  document.querySelectorAll(".nl[data-route]").forEach((b) =>
    b.classList.toggle("on", b.dataset.route === def.route));
  const title = document.getElementById("page-title");
  if (title) title.textContent = def.label;
  let mod;
  try {
    mod = await def.load();
  } catch {
    if (seq === routeSeq) toast("Učitavanje nije uspjelo — provjeri vezu i pokušaj ponovno.");
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
  if (matchMedia("(hover: none)").matches) {
    document.addEventListener("pointerdown", railOutsideCloser, { passive: true });
  }
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
  if (getState().session) renderShell(); else renderGate();
}

boot();
