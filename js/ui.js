// ============================================================================
// ui.js — small shared primitives: escaping, icons, navigation, toasts.
// ============================================================================

export function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export function go(route) {
  location.hash = "#" + route;
}

const ICONS = {
  dash: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z"/>',
  box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5zM3.3 8L12 12.8 20.7 8M12 22V12.8"/>',
  move: '<path d="M7 8l-4 4 4 4M17 8l4 4-4 4M3 12h18"/>',
  order: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
  admin: '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  pin: '<path d="M12 17v5M5 9l2-6h10l2 6M5 9h14M5 9l3 8h8l3-8"/>',
  alert: '<path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
};

export function icon(name, size = 18) {
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

// Croatian count phrases: 1 artikl, 2-4 artikla, 5+ artikala (with 11-14 rule).
export function hrCount(n, [one, few, many]) {
  const mod10 = n % 10, mod100 = n % 100;
  const word = (mod10 === 1 && mod100 !== 11) ? one
    : (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) ? few : many;
  return `${n} ${word}`;
}

// Product thumbnail with an honest fallback: items without catalogue
// photography get a neutral initial tile, never a wrong product photo
// (docs/REQUIREMENTS.md: no invented substitutes).
export function thumb(item, cls = "") {
  if (item.img) {
    return `<img src="${esc(item.img)}" alt="" loading="lazy" class="${esc(cls)}">`;
  }
  return `<span class="thumb-ph ${esc(cls)}" aria-hidden="true">${esc((item.name || "?")[0])}</span>`;
}

let toastTimer = null;
export function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("on"), 2600);
}

export function setThemeColor(dark) {
  const meta = document.querySelector("meta[name=theme-color]");
  if (meta) meta.setAttribute("content", dark ? "#0D0D0D" : "#F7F7F6");
}
