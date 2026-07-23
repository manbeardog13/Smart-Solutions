// ============================================================================
// store.js — centralized state + tiny observer pattern (ASC pattern).
// Also owns session persistence and the protected-data cleanup rule:
// when the signed-in user changes (or logs out), every protected key —
// including any cached assistant/Gemini context — is wiped.
// ============================================================================

const SESSION_KEY = "ss.session";
// Protected namespaces cleared on logout or user switch.
export const PROTECTED_PREFIXES = ["ss.protected.", "ss.gemini."];

const state = {
  session: null,      // { userId, name, role, title }
  route: "/",
  theme: null,        // "light" | "dark"
  device: "desktop",  // phone | tablet | desktop | ultrawide
  navPinned: false,
  refreshView: null,
};

const listeners = new Map();

export function getState() { return state; }

export function setState(patch) {
  Object.assign(state, patch);
  emit("change", state);
}

export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => listeners.get(event)?.delete(fn);
}

export function emit(event, payload) {
  listeners.get(event)?.forEach((fn) => {
    try { fn(payload); } catch (err) { console.error(`store listener "${event}" failed`, err); }
  });
}

export function setViewRefresh(fn) { state.refreshView = fn; }
export function refreshActiveView() {
  if (typeof state.refreshView === "function") state.refreshView();
}

// ---- Session persistence + protected-data hygiene ---------------------------

export function loadSession(storage = localStorage) {
  try {
    state.session = JSON.parse(storage.getItem(SESSION_KEY)) ?? null;
  } catch { state.session = null; }
  return state.session;
}

export function clearProtectedData(storage = localStorage) {
  const doomed = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (PROTECTED_PREFIXES.some((p) => key && key.startsWith(p))) doomed.push(key);
  }
  doomed.forEach((k) => storage.removeItem(k));
  return doomed.length;
}

export function signIn(user, storage = localStorage) {
  const previous = loadSession(storage);
  // A different person on the same device must never inherit cached data.
  if (previous && previous.userId !== user.id) clearProtectedData(storage);
  state.session = { userId: user.id, name: user.name, role: user.role, title: user.title };
  try { storage.setItem(SESSION_KEY, JSON.stringify(state.session)); } catch { /* full */ }
  emit("auth", state.session);
  return state.session;
}

export function signOut(storage = localStorage) {
  state.session = null;
  try { storage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  clearProtectedData(storage);
  emit("auth", null);
}
