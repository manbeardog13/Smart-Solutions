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

function seed() {
  return {
    items: structuredClone(DEMO_ITEMS),
    orders: structuredClone(DEMO_ORDERS),
    movements: structuredClone(DEMO_MOVEMENTS),
    placedOrders: [],
    visibility: null, // admin override of DEFAULT_VISIBILITY
  };
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(DB_KEY));
    if (raw && raw.items) return raw;
  } catch { /* re-seed */ }
  const fresh = seed();
  save(fresh);
  return fresh;
}

function save(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* full */ }
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
  item.qty = Math.max(0, Number(item.qty) + Number(delta));
  db.movements.unshift({
    id: "m" + Date.now(),
    ts: new Date().toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" }),
    who: who || "—",
    what: delta >= 0 ? "Zaprimljeno" : "Izdano na teren",
    item: itemId,
    qty: Number(delta),
  });
  save(db);
  return item;
}

// Place a reorder for a low-stock item. Requires the supplier (which is why
// supplier identity travels in every QR payload).
export function placeReorder(itemId) {
  const db = load();
  const item = db.items.find((i) => i.id === itemId);
  if (!item) throw new Error("Artikl nije pronađen.");
  const proposal = reorderProposal(item);
  if (!proposal) throw new Error("Artikl nije ispod minimuma.");
  const order = { ...proposal, id: "N-" + Date.now(), placedAt: new Date().toISOString() };
  db.placedOrders.unshift(order);
  save(db);
  return order;
}

export function resetDemo() {
  save(seed());
}

// Live-backend flag for UI copy ("Demo" badge).
export function isLive() { return isConfigured(); }
