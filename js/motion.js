// ============================================================================
// motion.js — the platform's motion system (GSAP timelines, vendored core).
// Two set pieces live here: the startup cinematic (backdrop → glass card →
// logo assembly → brand reveal → form) and the login → dashboard hand-off
// (the logo becomes the transition: bars stretch into rails, the mark flies
// to the top-bar brand button, the dashboard deals in beneath it).
//
// Ground rules (platform standard): GPU transforms + opacity only (filter
// once, on the card materialization), literal eases, will-change applied for
// the duration of a move and removed after, and the Final Frame Contract —
// every timeline's end state is exactly the static design, so reduced motion
// (or a missing GSAP) simply starts there.
// ============================================================================

const g = () => window.gsap || null;

export const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

// The four diagonal bands of the mark (parallel to its "/" bars), used both
// for the assembly slices and for the rail positions on the way out.
export const MARK_BANDS = [
  "polygon(0% 0%, 52% 0%, 0% 52%)",
  "polygon(52% 0%, 100% 0%, 100% 2%, 2% 100%, 0% 100%, 0% 52%)",
  "polygon(100% 2%, 100% 52%, 52% 100%, 2% 100%)",
  "polygon(100% 52%, 100% 100%, 52% 100%)",
];

// ---- startup cinematic ------------------------------------------------------
// ~2.2 s: 0.00 backdrop · 0.20 card · 0.35 assembly · 0.90 highlight ·
// 1.20 smart · 1.35 solutions · 1.55 form · 2.2 interactive. Returns the
// timeline, or null when motion is off (static final frame, nothing hidden).
export function gateIntro(gateEl) {
  const G = g();
  if (!G || reducedMotion()) return null;

  const q = (s) => gateEl.querySelector(s);
  const qa = (s) => [...gateEl.querySelectorAll(s)];
  const photo = q(".auth-photo");
  const card = q(".login-card");
  const lcAsm = q(".lc-asm");
  const bars = qa(".asm-mark .bar");
  const sheen = q(".asm-sheen");
  const words = qa(".asm-word .w-clip img");
  const form = qa("[data-cine]");
  if (!card || !lcAsm) return null;

  // The logo plays its assembly LARGE, centered over the card, then lands
  // into its top-left slot — one element the whole way, so the landing is
  // pixel-continuous (a pure FLIP: measure the resting box, start scaled).
  // The MARK alone is what centers during assembly; when the wordmark rises
  // the whole lockup glides to optical center, then flies home.
  const r = lcAsm.getBoundingClientRect();
  const rm = q(".asm-mark").getBoundingClientRect();
  const bigW = Math.min(innerWidth * 0.78, 460);
  const s = bigW / r.width;
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const mcx = rm.left + rm.width / 2, mcy = rm.top + rm.height / 2;
  // scaling happens about the lockup center; the mark center maps to
  // C + s·(M − C), and we aim that at the stage point
  const sx = innerWidth / 2, sy = innerHeight * 0.44;
  const dxMark = sx - (cx + s * (mcx - cx));
  const dyMark = sy - (cy + s * (mcy - cy));
  const dxFull = sx - cx, dyFull = sy - cy;

  // expo.out is core GSAP's take on the premium cubic-bezier(.16,1,.3,1)
  const tl = G.timeline({ defaults: { ease: "expo.out" } });

  // Everything hidden from JS only — if this file never runs, nothing hides.
  G.set(card, { autoAlpha: 0, y: 14, scale: 0.965, filter: "blur(10px)", willChange: "transform,opacity,filter" });
  if (photo) G.set(photo, { autoAlpha: 0, scale: 1.06, willChange: "transform,opacity" });
  G.set(lcAsm, { x: dxMark, y: dyMark, scale: s, transformOrigin: "50% 50%", willChange: "transform" });
  G.set(bars, { autoAlpha: 0 });
  bars.forEach((b, i) => G.set(b, i % 2 ? { x: -14, y: 14 } : { x: 14, y: -14 }));
  G.set(words, { yPercent: 120 });
  G.set(form, { autoAlpha: 0, y: 8 });

  // 01 · ambient appearance
  if (photo) tl.to(photo, { autoAlpha: 1, scale: 1, duration: 1.15, ease: "power2.out" }, 0);
  // 01 · the glass card materializes beneath the stage, blur clearing early
  tl.to(card, { autoAlpha: 1, y: 0, scale: 1, duration: 0.75 }, 0.2)
    .to(card, { filter: "blur(0px)", duration: 0.45, ease: "power2.out" }, 0.2)
    // 02 · logo assembly — machined parts sliding in along the diagonal
    .to(bars, {
      autoAlpha: 1, x: 0, y: 0, duration: 0.5,
      ease: "back.out(1.5)", stagger: 0.07,
    }, 0.35)
    // 03 · a single travelling specular pass, masked to the mark
    .fromTo(sheen, { autoAlpha: 1, backgroundPosition: "140% 0%" },
      { backgroundPosition: "-40% 0%", duration: 0.7, ease: "power2.inOut" }, 0.9)
    .set(sheen, { autoAlpha: 0 }, 1.62)
    // 04 · brand reveal: smart, then solutions, each rising out of its mask,
    // while the lockup glides to optical center to make room for the words
    .to(lcAsm, { x: dxFull, y: dyFull, duration: 0.55, ease: "power3.out" }, 1.2)
    .to(words[0], { yPercent: 0, duration: 0.45, ease: "power3.out" }, 1.2)
    .to(words[1], { yPercent: 0, duration: 0.45, ease: "power3.out" }, 1.35)
    // 06 · the logo flies home to its slot; the form settles in beneath it
    .to(lcAsm, { x: 0, y: 0, scale: 1, duration: 0.65, ease: "power3.inOut" }, 1.8)
    .to(form, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.045, ease: "power2.out" }, 2.25)
    // release the GPU hints; begin the 1% breathing idle
    .add(() => {
      G.set([card, photo].filter(Boolean), { clearProps: "willChange,filter" });
      G.set(lcAsm, { clearProps: "willChange" });
      const mark = q(".asm-mark");
      if (mark) G.to(mark, { scale: 1.008, duration: 2.6, ease: "sine.inOut", repeat: -1, yoyo: true });
    }, 2.75);

  // an eager tap or keypress lands on the finished frame instantly
  const skip = () => { if (tl.progress() < 1) tl.progress(1); };
  gateEl.addEventListener("pointerdown", skip, { once: true, capture: true });
  document.addEventListener("keydown", skip, { once: true });
  return tl;
}

// ---- login → dashboard ------------------------------------------------------
// The logo IS the transition: capture the mark, render the shell beneath a
// fixed overlay, stretch the four bands into full-width rails, fly the mark
// onto the top-bar brand button, then melt the overlay as the dashboard
// deals its cards center-out. renderShell() is called synchronously either
// way — motion is layered on top, never in the way.
export function gateToShell(renderShell) {
  const G = g();
  const gate = document.querySelector(".gate");
  const mark = gate && gate.querySelector(".asm-mark");
  if (!G || reducedMotion() || !mark) { renderShell(true); return; }

  const from = mark.getBoundingClientRect();
  const veilBg = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim() || "#EEF0F1";

  // Overlay lives on <body>, so it survives the root swap renderShell does.
  const ov = document.createElement("div");
  ov.className = "handoff";
  ov.innerHTML = `
    <i class="ho-veil" style="background:${veilBg}"></i>
    ${MARK_BANDS.map(() => `<i class="ho-rail"></i>`).join("")}
    <img class="ho-mark" src="brand/logo-mark.png" alt="">`;
  document.body.appendChild(ov);

  const flyer = ov.querySelector(".ho-mark");
  const rails = [...ov.querySelectorAll(".ho-rail")];
  const veil = ov.querySelector(".ho-veil");
  G.set(flyer, { left: from.left, top: from.top, width: from.width, height: from.height });
  rails.forEach((r, i) => G.set(r, {
    left: from.left + from.width / 2,
    top: from.top + from.height * ((i + 0.5) / 4),
    xPercent: -50, scaleX: 0,
  }));

  renderShell(true); // the dashboard is already dealing in underneath

  // The freshly rendered .brand-mark image has no reliable layout yet, so
  // aim at its 44×44 button (a stable box) and the mark's known 26px height.
  const btn = document.querySelector(".brand-btn");
  const target = document.querySelector(".brand-mark");
  if (target) target.classList.add("await"); // hidden until the flyer lands

  const done = () => { ov.remove(); if (target) target.classList.remove("await"); };
  const tl = G.timeline({ defaults: { ease: "expo.out" }, onComplete: done });

  // bars → rails: stretch across the viewport, carry the eye, let go
  tl.to(veil, { autoAlpha: 0.0, duration: 0.5, ease: "power1.out" }, 0.15)
    .to(rails, { scaleX: 1, duration: 0.55, stagger: 0.045, ease: "power3.out" }, 0)
    .to(rails, { autoAlpha: 0, duration: 0.3, ease: "power1.out", stagger: 0.03 }, 0.5);
  // the mark flies home to the top-left brand button — transforms only
  if (btn) {
    const bt = btn.getBoundingClientRect();
    const toH = 26, toW = toH * (409 / 412);
    G.set(flyer, { transformOrigin: "0 0" });
    tl.to(flyer, {
      x: (bt.left + (bt.width - toW) / 2) - from.left,
      y: (bt.top + (bt.height - toH) / 2) - from.top,
      scale: toH / from.height,
      duration: 0.62, ease: "power3.out",
    }, 0.08)
      .to(flyer, { autoAlpha: 0, duration: 0.18 }, 0.72);
  } else {
    tl.to(flyer, { autoAlpha: 0, duration: 0.3 }, 0.4);
  }
  setTimeout(done, 1400); // safety: the overlay must never strand the user
}
