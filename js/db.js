// ============================================================================
// db.js — every data operation. In demo mode (config placeholders intact)
// data lives in localStorage, seeded from data.js. When Supabase is
// configured, these functions are the single place to swap implementations —
// the ASC platform's db.js is the reference for that wiring.
// ============================================================================

import { isConfigured } from "./config.js";
import { DEMO_ITEMS, DEMO_ORDERS, DEMO_MOVEMENTS, DEMO_USERS } from "./data.js";
import { reorderProposal } from "./domain.js";

const DB_KEY = "ss.demo.db";
// Bump whenever seed shape or content changes: stale blobs from older
// installs re-seed instead of crashing views that expect the new shape.
const DB_VERSION = 4; // v4: items carry imgFull (catalogue panel backdrops)

// Same-millisecond writes must still get unique ids.
let idSeq = 0;
function nextId(prefix) {
  return `${prefix}${Date.now().toString(36)}${(++idSeq).toString(36)}`;
}

// structuredClone is missing on older warehouse handhelds — degrade politely.
export function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function seed() {
  return {
    v: DB_VERSION,
    items: clone(DEMO_ITEMS),
    orders: clone(DEMO_ORDERS),
    movements: clone(DEMO_MOVEMENTS),
    placedOrders: [],
    visibility: null, // admin override of DEFAULT_VISIBILITY
  };
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(DB_KEY));
    if (raw && raw.v === DB_VERSION &&
        Array.isArray(raw.items) && Array.isArray(raw.orders) &&
        Array.isArray(raw.movements) && Array.isArray(raw.placedOrders)) {
      return raw;
    }
  } catch { /* re-seed */ }
  const fresh = seed();
  try { save(fresh); } catch { /* boot must survive a full storage; run in-memory */ }
  return fresh;
}

// Persist or say so: a failed write must never let the UI report success.
function save(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    throw new Error("Spremanje nije uspjelo — pohrana uređaja je puna.");
  }
}

export function demoUsers() { return DEMO_USERS; }

export function listItems() { return load().items; }
export function getItem(id) { return load().items.find((i) => i.id === id) || null; }
export function listOrders() { return load().orders; }
export function listMovements() { return load().movements; }
export function listPlacedOrders() { return load().placedOrders; }
export function getVisibilityOverride() { return load().visibility; }

export function setVisibilityOverride(visibility) {
  const db = load();
  db.visibility = visibility;
  save(db);
}

export function adjustQty(itemId, delta, who) {
  const db = load();
  const item = db.items.find((i) => i.id === itemId);
  if (!item) throw new Error("Artikl nije pronađen.");
  const before = Number(item.qty);
  item.qty = Math.max(0, before + Number(delta));
  const applied = item.qty - before;
  // Only movements that actually happened get logged.
  if (applied === 0) {
    if (delta < 0) throw new Error("Nema zaliha za izdati.");
    return item;
  }
  db.movements.unshift({
    id: nextId("m"),
    ts: new Date().toLocaleString("hr-HR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
    who: who || "—",
    what: applied >= 0 ? "Zaprimljeno" : "Izdano na teren",
    item: itemId,
    qty: applied,
  });
  // Receiving stock back above the minimum closes the item's open reorder —
  // the delivery arrived, so the next shortage can order again.
  if (applied > 0 && item.qty > Number(item.min)) {
    db.placedOrders = db.placedOrders.filter((o) => o.itemId !== itemId);
  }
  save(db);
  return item;
}

// Is there already an open (placed) order for this item?
export function openReorderFor(itemId) {
  return load().placedOrders.find((o) => o.itemId === itemId) || null;
}

// Place a reorder for a low-stock item. Requires the supplier (which is why
// supplier identity travels in every QR payload). One open order per item —
// clicking twice must not order twice.
export function placeReorder(itemId) {
  const db = load();
  const item = db.items.find((i) => i.id === itemId);
  if (!item) throw new Error("Artikl nije pronađen.");
  const existing = db.placedOrders.find((o) => o.itemId === itemId);
  if (existing) return existing;
  const proposal = reorderProposal(item);
  if (!proposal) throw new Error("Artikl nije ispod minimuma.");
  const order = { ...proposal, id: nextId("N-"), placedAt: new Date().toISOString() };
  db.placedOrders.unshift(order);
  save(db);
  return order;
}

export function resetDemo() {
  save(seed());
}

// Live-backend flag for UI copy ("Demo" badge).
export function isLive() { return isConfigured(); }
