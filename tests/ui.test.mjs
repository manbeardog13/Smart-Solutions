import { test } from "node:test";
import assert from "node:assert/strict";
import { esc, hrCount } from "../js/ui.js";

test("esc neutralizes every HTML-active character", () => {
  assert.equal(esc('<img src=x onerror="a&b\'c">'),
    "&lt;img src=x onerror=&quot;a&amp;b&#39;c&quot;&gt;");
  assert.equal(esc(null), "");
  assert.equal(esc(0), "0");
});

test("hrCount declines Croatian counts correctly", () => {
  const w = (n) => hrCount(n, ["artikl", "artikla", "artikala"]);
  assert.equal(w(1), "1 artikl");
  assert.equal(w(2), "2 artikla");
  assert.equal(w(4), "4 artikla");
  assert.equal(w(5), "5 artikala");
  assert.equal(w(11), "11 artikala");   // 11-14 are always "many"
  assert.equal(w(12), "12 artikala");
  assert.equal(w(21), "21 artikl");
  assert.equal(w(22), "22 artikla");
  assert.equal(w(112), "112 artikala");
});
