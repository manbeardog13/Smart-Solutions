import { test } from "node:test";
import assert from "node:assert/strict";

// store.js touches localStorage only through the injectable `storage`
// parameter; a Map-backed stub keeps the module import side-effect free.
function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _dump: () => Object.fromEntries(map),
  };
}

const { signIn, signOut, loadSession, clearProtectedData } = await import("../js/store.js");

const vido = { id: "u-vido", name: "Vido", role: "vlasnik", title: "Vlasnik" };
const ana = { id: "u-ana", name: "Ana", role: "skladistar", title: "Skladištar" };

test("session persists across reloads", () => {
  const s = fakeStorage();
  signIn(vido, s);
  assert.equal(loadSession(s).userId, "u-vido");
});

test("logout clears the session AND all protected data (incl. Gemini cache)", () => {
  const s = fakeStorage({
    "ss.protected.notes": "x",
    "ss.gemini.context": "chat history",
    "ss.theme": "true",
  });
  signIn(vido, s);
  signOut(s);
  assert.equal(loadSession(s), null);
  const left = s._dump();
  assert.equal(left["ss.gemini.context"], undefined);
  assert.equal(left["ss.protected.notes"], undefined);
  assert.equal(left["ss.theme"], "true"); // non-protected prefs survive
});

test("a different user signing in wipes the previous user's protected data", () => {
  const s = fakeStorage();
  signIn(vido, s);
  s.setItem("ss.gemini.context", "vido's assistant history");
  signIn(ana, s);
  assert.equal(s.getItem("ss.gemini.context"), null);
  assert.equal(loadSession(s).userId, "u-ana");
});

test("the same user signing in again keeps their protected data", () => {
  const s = fakeStorage();
  signIn(vido, s);
  s.setItem("ss.gemini.context", "history");
  signIn(vido, s);
  assert.equal(s.getItem("ss.gemini.context"), "history");
});

test("clearProtectedData reports how many keys it removed", () => {
  const s = fakeStorage({ "ss.protected.a": "1", "ss.gemini.b": "2", "other": "3" });
  assert.equal(clearProtectedData(s), 2);
});

test("tampered or schema-drifted session blobs are rejected and removed", () => {
  for (const bad of ['"just a string"', "[1,2]", "42", "{}",
    '{"userId":"u","name":"","role":"x","title":"y"}',
    '{"name":"Vido","role":"vlasnik","title":"Vlasnik"}']) {
    const s = fakeStorage({ "ss.session": bad });
    assert.equal(loadSession(s), null, `accepted: ${bad}`);
    assert.equal(s.getItem("ss.session"), null, `not removed: ${bad}`);
  }
});

test("a well-formed persisted session still loads", () => {
  const s = fakeStorage();
  signIn(vido, s);
  const raw = s.getItem("ss.session");
  const fresh = fakeStorage({ "ss.session": raw });
  assert.equal(loadSession(fresh).userId, "u-vido");
});
