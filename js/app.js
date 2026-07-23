// ============================================================================
// app.js — boot, splash → auth gate → shell, router, theme, device classes.
// Views live in js/views/* and export render(main, ctx). Business rules are
// in domain.js; data in db.js; state in store.js. (ASC platform pattern.)
// ============================================================================

import { getState, setState, loadSession, signIn, signOut, on } from "./store.js";
import { viewsForRole, isFieldRole, deviceClass } from "./domain.js";
import * as db from "./db.js";
import { esc, icon, go, setThemeColor } from "./ui.js";

const VIEW_DEFS = [
  { key: "dashboard", route: "/", label: "Ploča", ic: "dash", load: () => import("./views/dashboard.js") },
  { key: "warehouse", route: "/warehouse", label: "Skladište", ic: "box", load: () => import("./views/warehouse.js") },
  { key: "movements", route: "/movements", label: "Kretanja", ic: "move", load: () => import("./views/movements.js") },
  { key: "orders", route: "/orders", label: "Radni nalozi", ic: "order", load: () => import("./views/orders.js") },
  { key: "scan", route: "/scan", label: "Skeniranje", ic: "scan", load: () => import("./views/scan.js") },
  { key: "admin", route: "/admin", label: "Upravljanje", ic: "admin", load: () => import("./views/admin.js") },
];

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
function applyTheme(dark) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  setThemeColor(dark);
  setState({ theme: dark ? "dark" : "light" });
  document.querySelectorAll(".theme").forEach((el) => {
    el.setAttribute("aria-checked", String(dark));
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

  const soon = () => import("./ui.js").then(({ toast }) =>
    toast("Dostupno s produkcijskim backendom (Supabase)."));
  root.querySelector("[data-google]").onclick = soon;
  root.querySelector("[data-forgot]").onclick = soon;
  root.querySelector("[data-create]").onclick = soon;
  root.querySelector("#login-form").onsubmit = (e) => { e.preventDefault(); soon(); };
  root.querySelectorAll("[data-user]").forEach((btn) => {
    btn.onclick = () => {
      const user = db.demoUsers().find((u) => u.id === btn.dataset.user);
      signIn(user);
      renderShell(true);
    };
  });
}

// ---- App shell --------------------------------------------------------------
let currentMain = null;

function navForSession(session) {
  const allowed = viewsForRole(session.role, db.getVisibilityOverride() || undefined);
  return VIEW_DEFS.filter((v) => allowed.includes(v.key));
}

function renderShell(freshLogin = false) {
  const { session } = getState();
  if (!session) { renderGate(); return; }
  document.body.classList.toggle("field-mode", isFieldRole(session.role));
  const nav = navForSession(session);
  root.innerHTML = `
    <div class="shell">
      <div class="wash"></div>
      <aside class="rail" id="rail">
        <button class="brand" data-home aria-label="Na ploču">
          <span class="mark">${MARK_IMG}</span><span class="wm-img">${WORD_IMG}</span>
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
          <h1 id="page-title">Ploča</h1>
          ${db.isLive() ? "" : '<span class="demo-badge">Demo</span>'}
          <div class="right"></div>
        </div>
        <div class="stage" id="main"></div>
      </main>
      <div class="shelf" id="shelf" tabindex="0" aria-label="Brze aplikacije">
        <div class="capsule">
          ${SHELF_APPS.map((a) => `
            <a href="${a.url}" target="_blank" rel="noopener" aria-label="${esc(a.name)}"
               style="--brand:${a.brand}">${a.svg}</a>`).join("")}
        </div>
        <div class="handle" aria-hidden="true"></div>
      </div>
    </div>`;

  currentMain = document.getElementById("main");
  root.querySelector("[data-home]").onclick = () => go("/");
  root.querySelector("[data-logout]").onclick = () => { signOut(); renderGate(); };
  root.querySelectorAll("[data-route]").forEach((btn) => {
    btn.onclick = () => go(btn.dataset.route);
  });
  route(freshLogin);
}

// ---- Router -----------------------------------------------------------------
async function route(freshLogin = false) {
  const { session } = getState();
  if (!session) { renderGate(); return; }
  const hash = location.hash.replace(/^#/, "") || "/";
  const nav = navForSession(session);
  const def = nav.find((v) => v.route === hash) ||
              (hash.startsWith("/item/") ? nav.find((v) => v.key === "warehouse") : null) ||
              nav[0];
  setState({ route: def.route });
  document.querySelectorAll(".nl[data-route]").forEach((b) =>
    b.classList.toggle("on", b.dataset.route === def.route));
  const title = document.getElementById("page-title");
  if (title) title.textContent = def.label;
  const mod = await def.load();
  currentMain.innerHTML = "";
  mod.render(currentMain, { session, hash, freshLogin });
}

// ---- Boot -------------------------------------------------------------------
function boot() {
  initTheme();
  applyDevice();
  addEventListener("resize", applyDevice);
  addEventListener("hashchange", () => route());
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
