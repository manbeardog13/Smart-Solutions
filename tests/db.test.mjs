import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

// db.js talks to global localStorage; give Node one before importing it.
function installFakeStorage() {
  const map = new Map();
  globalThis.localStorage = {
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  };
}
installFakeStorage();
const db = await import("../js/db.js");

beforeEach(() => {
  localStorage.clear();
  db.resetDemo();
});

test("placeReorder is idempotent — clicking twice never orders twice", () => {
  const first = db.placeReorder("SS-0003");
  const second = db.placeReorder("SS-0003");
  assert.equal(first.id, second.id);
  assert.equal(db.listPlacedOrders().filter((o) => o.itemId === "SS-0003").length, 1);
});

test("placeReorder refuses items that are not low on stock", () => {
  assert.throws(() => db.placeReorder("SS-0004"), /minimuma/);
});

test("issuing at zero stock throws and records no movement", () => {
  const before = db.listMovements().length;
  let item = db.getItem("SS-0002"); // qty 2
  db.adjustQty("SS-0002", -1, "Test");
  db.adjustQty("SS-0002", -1, "Test");
  item = db.getItem("SS-0002");
  assert.equal(item.qty, 0);
  assert.throws(() => db.adjustQty("SS-0002", -1, "Test"), /Nema zaliha/);
  const moves = db.listMovements().length;
  assert.equal(moves, before + 2); // exactly the two real issues, no phantom third
});

test("receiving stock above the minimum closes the open reorder", () => {
  db.placeReorder("SS-0005"); // qty 8, min 10
  assert.ok(db.openReorderFor("SS-0005"));
  db.adjustQty("SS-0005", +3, "Ana"); // 11 > min 10 → delivery arrived
  assert.equal(db.openReorderFor("SS-0005"), null);
  // and the next shortage can order again
  db.adjustQty("SS-0005", -2, "Marko"); // 9 <= 10
  assert.ok(db.placeReorder("SS-0005"));
});

test("adjustQty clamps at zero and logs only what actually moved", () => {
  const item = db.adjustQty("SS-0001", +2, "Ana");
  assert.equal(item.qty, 6);
  const last = db.listMovements()[0];
  assert.equal(last.qty, 2);
  assert.equal(last.what, "Zaprimljeno");
  // The clamp itself: a partial issue applies only what exists.
  const clamped = db.adjustQty("SS-0001", -100, "Marko");
  assert.equal(clamped.qty, 0);
  assert.equal(db.listMovements()[0].qty, -6); // applied, not requested
});

test("receipt landing exactly AT the minimum keeps the reorder open", () => {
  db.placeReorder("SS-0005"); // qty 8, min 10
  db.adjustQty("SS-0005", +2, "Ana"); // 10 == min → delivery not sufficient yet
  assert.ok(db.openReorderFor("SS-0005"), "order must stay open at qty == min");
});

test("ids are unique even for same-millisecond writes", () => {
  db.adjustQty("SS-0004", +1, "Ana");
  db.adjustQty("SS-0004", +1, "Ana");
  db.adjustQty("SS-0004", +1, "Ana");
  const ids = db.listMovements().map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("stale or partial persisted blobs re-seed instead of crashing", () => {
  localStorage.setItem("ss.demo.db", JSON.stringify({ items: [{ id: "x" }] }));
  const items = db.listItems(); // old shape (no version) → fresh seed
  assert.ok(items.length >= 7);
  assert.ok(Array.isArray(db.listPlacedOrders()));
  localStorage.setItem("ss.demo.db", "not json at all");
  assert.ok(db.listItems().length >= 7);
});
