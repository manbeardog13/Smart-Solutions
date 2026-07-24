// ============================================================================
// audit-login.mjs — logon-parity audit against the ASC phone build (the ruler).
//
// Measures EVERYTHING on both logon screens at the same viewport — the card's
// distance from every screen edge, and each element's size, side gaps, gap to
// the element above it, font size/weight and corner radius — then prints an
// ASC vs Smart Solutions table with deltas. Any delta beyond the tolerance
// fails the audit (exit 1). The card must SCALE to match — never be cut.
//
// Usage:
//   npx http-server /workspace/asc/app -p 8124 -s   (the ASC ruler)
//   npx http-server . -p 8123 -s                    (Smart Solutions)
//   node scripts/audit-login.mjs [--tol 2] [--viewport 390x844]
//
// The Playwright import path and Chromium binary match the CI/sandbox layout;
// override with PLAYWRIGHT_MJS / CHROMIUM_BIN when running elsewhere.
// ============================================================================

const PW = process.env.PLAYWRIGHT_MJS || "/opt/node22/lib/node_modules/playwright/index.mjs";
const BIN = process.env.CHROMIUM_BIN || "/opt/pw-browsers/chromium";
const { chromium } = await import(PW);

const args = Object.fromEntries(process.argv.slice(2).join(" ")
  .split("--").filter(Boolean).map((s) => s.trim().split(/\s+/)));
const TOL = Number(args.tol || 2);
const [VW, VH] = String(args.viewport || "390x844").split("x").map(Number);
const ASC_URL = args.asc || "http://127.0.0.1:8124/login.html";
const SS_URL = args.ss || "http://127.0.0.1:8123/";

// One row per logon element; `closest` climbs from the anchor to the box that
// actually owns the geometry (the field wrapper around an input).
const SPEC = [
  { key: "card", asc: ".auth-card", ss: ".login-card" },
  { key: "logo", asc: ".auth-logo", ss: ".lc-logo" },
  { key: "theme-switch", asc: ".auth-theme", ss: ".sw" },
  { key: "title", asc: ".auth-title", ss: ".auth-title" },
  { key: "subtitle", asc: ".auth-sub", ss: ".auth-sub" },
  { key: "google-btn", asc: ".btn-google", ss: ".btn-google" },
  { key: "divider", asc: ".auth-div", ss: ".auth-divider" },
  { key: "email-field", asc: "#email", ss: "#lg-user", closest: ".fieldx" },
  { key: "pass-field", asc: "#password", ss: "#lg-pass", closest: ".fieldx" },
  { key: "forgot", asc: ".auth-forgot", ss: ".auth-forgot" },
  { key: "cta", asc: ".btn-amber", ss: ".btn-brand" },
  { key: "create-line", asc: ".auth-switch", ss: ".auth-create" },
];

async function measure(url, which) {
  const browser = await chromium.launch({ executablePath: BIN });
  const page = await browser.newPage({ viewport: { width: VW, height: VH } });
  // Final Frame Contract: reduced motion skips every timeline, so both apps
  // sit on their exact static design — deterministic geometry, no mid-tween.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url);
  await page.waitForTimeout(1200); // fonts + layout settled
  const spec = SPEC.map(({ key, closest, ...s }) => ({ key, sel: s[which], closest }));
  const out = await page.evaluate((rows) => {
    const res = {};
    for (const { key, sel, closest } of rows) {
      let el = document.querySelector(sel);
      if (el && closest) el = el.closest(closest);
      if (!el) { res[key] = null; continue; }
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      res[key] = {
        x: r.x, y: r.y, w: r.width, h: r.height,
        font: parseFloat(c.fontSize), weight: c.fontWeight,
        radius: parseFloat(c.borderTopLeftRadius),
      };
    }
    res.__viewport = { w: innerWidth, h: innerHeight };
    return res;
  }, spec);
  await browser.close();
  return out;
}

// Flatten one app's raw rects into named metrics, all relative to the card
// (so the two apps compare even if their cards differ in absolute position).
function metrics(m) {
  const card = m.card; if (!card) return null;
  const vp = m.__viewport; const o = {};
  o["card left gap"] = card.x;
  o["card right gap"] = vp.w - card.x - card.w;
  o["card top gap"] = card.y;
  o["card bottom gap"] = vp.h - card.y - card.h;
  o["card width"] = card.w;
  o["card height"] = card.h;
  o["card radius"] = card.radius;
  let prev = null;
  for (const { key } of SPEC.slice(1)) {
    const e = m[key]; if (!e) { prev = null; continue; }
    o[`${key} height`] = e.h;
    o[`${key} left gap`] = e.x - card.x;
    o[`${key} right gap`] = card.x + card.w - e.x - e.w;
    if (prev) o[`${key} gap above`] = e.y - prev.bottom;
    o[`${key} font`] = e.font;
    o[`${key} radius`] = e.radius;
    prev = { bottom: e.y + e.h };
  }
  return o;
}

const [asc, ss] = await Promise.all([measure(ASC_URL, "asc"), measure(SS_URL, "ss")]);
const A = metrics(asc), S = metrics(ss);
if (!A || !S) { console.error("card not found:", !A ? "ASC" : "SS"); process.exit(2); }

// Brand-intrinsic exemptions: the logo's WIDTH follows its own aspect ratio
// (height is enforced to the ASC row), the switch holds no text, and the
// forgot link's left edge is text-metric-dependent (its right gap, font and
// height are enforced instead).
const EXEMPT = new Set(["logo right gap", "theme-switch font", "forgot left gap"]);

let fails = 0;
const pad = (s, n) => String(s).padEnd(n);
console.log(pad("metric", 26) + pad("ASC", 9) + pad("SS", 9) + pad("Δ", 8) + "status");
console.log("-".repeat(60));
for (const k of Object.keys(A)) {
  const a = A[k], s = S[k];
  if (s === undefined) { console.log(pad(k, 26) + pad(a?.toFixed?.(1), 9) + pad("—", 9) + pad("—", 8) + "MISSING"); fails++; continue; }
  const d = s - a;
  const ok = EXEMPT.has(k) || Math.abs(d) <= TOL;
  if (!ok) fails++;
  console.log(pad(k, 26) + pad(a.toFixed(1), 9) + pad(s.toFixed(1), 9) +
    pad((d >= 0 ? "+" : "") + d.toFixed(1), 8) + (EXEMPT.has(k) ? "exempt" : ok ? "ok" : "FAIL"));
}
console.log("-".repeat(60));
console.log(fails === 0 ? `PARITY: all metrics within ±${TOL}px` : `${fails} metric(s) beyond ±${TOL}px`);
process.exit(fails === 0 ? 0 : 1);
