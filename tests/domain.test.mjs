import { test } from "node:test";
import assert from "node:assert/strict";
import {
  viewsForRole, canSee, isFieldRole, DEFAULT_VISIBILITY,
  isLowStock, reorderProposal, lowStockItems,
  qrPayload, parseQrPayload, deviceClass, dealDelays,
} from "../js/domain.js";

// ---- roles ------------------------------------------------------------------
test("owner always sees every view, even with a restrictive override", () => {
  const override = { vlasnik: ["dashboard"], majstor: [], skladistar: [] };
  assert.deepEqual(viewsForRole("vlasnik", override), DEFAULT_VISIBILITY.vlasnik);
});

test("majstor default view set matches the field brief", () => {
  assert.deepEqual(viewsForRole("majstor"), ["dashboard", "warehouse", "orders", "scan"]);
  assert.equal(canSee("majstor", "admin"), false);
  assert.equal(canSee("majstor", "scan"), true);
});

test("admin override changes what a role can see", () => {
  const override = { ...DEFAULT_VISIBILITY, majstor: ["dashboard", "scan"] };
  assert.equal(canSee("majstor", "warehouse", override), false);
  assert.equal(canSee("majstor", "scan", override), true);
});

test("an empty or invalid override can never lock a role out", () => {
  assert.deepEqual(viewsForRole("majstor", { majstor: [] }), DEFAULT_VISIBILITY.majstor);
  assert.deepEqual(viewsForRole("skladistar", { skladistar: "corrupt" }), DEFAULT_VISIBILITY.skladistar);
  assert.deepEqual(viewsForRole("majstor", {}), DEFAULT_VISIBILITY.majstor);
});

test("the dashboard is always reachable even if unticked", () => {
  const views = viewsForRole("majstor", { majstor: ["scan"] });
  assert.ok(views.includes("dashboard"));
  assert.ok(views.includes("scan"));
});

test("only majstor is a field role (big-controls UI)", () => {
  assert.equal(isFieldRole("majstor"), true);
  assert.equal(isFieldRole("vlasnik"), false);
  assert.equal(isFieldRole("skladistar"), false);
});

// ---- stock ------------------------------------------------------------------
const item = { id: "SS-0003", name: "Bakrena cijev", supplier: "Metal d.o.o.", qty: 34, min: 50, batch: 100 };

test("stock at or below minimum is low", () => {
  assert.equal(isLowStock({ ...item, qty: 50 }), true);
  assert.equal(isLowStock({ ...item, qty: 51 }), false);
  assert.equal(isLowStock(item), true);
});

test("reorder proposal restores minimum plus one batch, via the item's supplier", () => {
  const p = reorderProposal(item);
  assert.equal(p.supplier, "Metal d.o.o.");
  assert.equal(p.quantity, (50 - 34) + 100);
  assert.equal(reorderProposal({ ...item, qty: 200 }), null);
});

test("batch defaults to min when absent", () => {
  const p = reorderProposal({ ...item, batch: undefined });
  assert.equal(p.quantity, (50 - 34) + 50);
});

test("lowStockItems filters correctly", () => {
  const items = [item, { ...item, id: "x", qty: 999 }];
  assert.deepEqual(lowStockItems(items).map((i) => i.id), ["SS-0003"]);
});

// ---- QR ---------------------------------------------------------------------
test("QR payload is a URL carrying item id and supplier; parse round-trips", () => {
  const url = qrPayload(item, "https://example.com/app/");
  assert.equal(url, "https://example.com/app/#/item/SS-0003?s=Metal%20d.o.o.");
  const parsed = parseQrPayload(url);
  assert.deepEqual(parsed, { itemId: "SS-0003", supplier: "Metal d.o.o." });
});

test("parse tolerates payloads without supplier and rejects garbage", () => {
  assert.deepEqual(parseQrPayload("https://x/#/item/AB-1"), { itemId: "AB-1", supplier: null });
  assert.equal(parseQrPayload("hello world"), null);
});

test("hostile QR input with malformed percent-encoding returns null, never throws", () => {
  assert.equal(parseQrPayload("https://x/#/item/%"), null);
  assert.equal(parseQrPayload("https://x/#/item/AB-1?s=%E0%A4%A"), null);
});

// ---- device classes ---------------------------------------------------------
test("device classes: phone, tablet, desktop, ultrawide", () => {
  assert.equal(deviceClass(390), "phone");
  assert.equal(deviceClass(834), "tablet");
  assert.equal(deviceClass(1440), "desktop");
  assert.equal(deviceClass(3440), "ultrawide");
});

test("device-class boundaries agree with the CSS media queries", () => {
  assert.equal(deviceClass(700), "phone");     // css: max-width:700px
  assert.equal(deviceClass(701), "tablet");
  assert.equal(deviceClass(1100), "tablet");   // css: max-width:1100px
  assert.equal(deviceClass(1101), "desktop");
  assert.equal(deviceClass(1799), "desktop");
  assert.equal(deviceClass(1800), "ultrawide");
});

// ---- dashboard deal ---------------------------------------------------------
test("deal delays: pairs land together, everything settles within 620 ms", () => {
  const delays = dealDelays(4);
  assert.equal(delays.length, 4);
  assert.equal(delays[0], delays[1]);       // a pair shares its moment
  assert.equal(delays[2], delays[3]);
  const settle = Math.max(...delays) + 260; // last card animates 260 ms
  assert.ok(settle <= 620, `settled in ${settle} ms`);
  assert.ok(delays[2] > delays[0], "later pairs must actually stagger, not land at 0");
});

test("deal delays handle a single card", () => {
  assert.deepEqual(dealDelays(1), [0]);
});
