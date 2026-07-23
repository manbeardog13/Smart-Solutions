// ============================================================================
// domain.js — business rules only. No DOM, no storage, no network, so every
// rule here is exercised directly by tests/domain.test.mjs.
// ============================================================================

// ---- Roles ------------------------------------------------------------------
// Administrators decide how much of the platform each role sees. The owner
// (vlasnik) always sees everything; the matrix below is the default and can be
// overridden per deployment via saved settings.
export const ROLES = ["vlasnik", "majstor", "skladistar"];

export const DEFAULT_VISIBILITY = {
  vlasnik: ["dashboard", "warehouse", "movements", "orders", "scan", "admin"],
  majstor: ["dashboard", "warehouse", "orders", "scan"],
  skladistar: ["dashboard", "warehouse", "movements", "scan"],
};

export function viewsForRole(role, visibility = DEFAULT_VISIBILITY) {
  if (role === "vlasnik") return DEFAULT_VISIBILITY.vlasnik.slice();
  return (visibility[role] || []).slice();
}

export function canSee(role, view, visibility = DEFAULT_VISIBILITY) {
  return viewsForRole(role, visibility).includes(view);
}

// Field technicians get the big-controls treatment: large buttons, large
// numbers, large letters — fewer mistakes with gloves on in daylight.
export function isFieldRole(role) {
  return role === "majstor";
}

// ---- Stock ------------------------------------------------------------------
// Every part has a minimum. At or below the minimum the platform must offer
// to reorder — and to order you need the supplier, which is why supplier
// identity is part of every QR payload.
export function isLowStock(item) {
  return Number(item.qty) <= Number(item.min);
}

export function reorderProposal(item) {
  if (!isLowStock(item)) return null;
  const deficit = Math.max(0, Number(item.min) - Number(item.qty));
  return {
    itemId: item.id,
    supplier: item.supplier,
    // order back up to min, plus one reorder batch so the next low-stock
    // moment isn't immediate
    quantity: deficit + Number(item.batch ?? item.min),
  };
}

export function lowStockItems(items) {
  return items.filter(isLowStock);
}

// ---- QR payloads ------------------------------------------------------------
// QR stickers are printed and glued to physical parts. A scan must identify
// the item AND its supplier (reordering depends on it). Payload is a compact
// URL so a plain phone camera opens the right record.
export function qrPayload(item, baseUrl) {
  const base = (baseUrl || "").replace(/\/+$/, "");
  return `${base}/#/item/${encodeURIComponent(item.id)}?s=${encodeURIComponent(item.supplier)}`;
}

export function parseQrPayload(text) {
  const m = String(text).match(/#\/item\/([^?]+)(?:\?s=([^&]+))?/);
  if (!m) return null;
  return {
    itemId: decodeURIComponent(m[1]),
    supplier: m[2] ? decodeURIComponent(m[2]) : null,
  };
}

// ---- Device classes ---------------------------------------------------------
// The application always knows what device it is on. Ultrawide gets the
// 80dvw stage; everything else fills the viewport edge to edge.
export function deviceClass(width) {
  if (width < 700) return "phone";
  if (width < 1100) return "tablet";
  if (width < 1800) return "desktop";
  return "ultrawide";
}

// ---- Dashboard entrance -----------------------------------------------------
// Cards deal from the center out, paired left and right, everything settled
// within ~620 ms. Returns per-card delay in ms for n cards.
export function dealDelays(n, totalMs = 620, perCardMs = 260) {
  const delays = [];
  const pairs = Math.ceil(n / 2);
  const step = pairs > 1 ? (totalMs - perCardMs) / (pairs - 1) : 0;
  for (let i = 0; i < n; i++) {
    const pair = Math.floor(i / 2);
    delays.push(Math.round(pair * step));
  }
  return delays;
}
