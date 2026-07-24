// ============================================================================
// views/warehouse.js — inventory: search, low-stock alerts, receive/issue,
// the reorder flow, and the QR deep-link item detail (#/item/<id>) — a
// scanned sticker must show the exact product before any action.
// ============================================================================
import * as db from "../db.js";
import { isLowStock, reorderProposal, parseQrPayload } from "../domain.js";
import { esc, icon, toast, hrCount, thumb, announce } from "../ui.js";

let query = "";
let queryOwner = null; // one user's search never leaks to the next
let openDetail = null; // { itemId, hash } while a scanned item is on screen

export function render(main, ctx) {
  const { session } = ctx;
  if (queryOwner !== session.userId) { query = ""; queryOwner = session.userId; }

  main.innerHTML = `
    <div id="wh-detail"></div>
    <div class="searchbar">
      <input id="wh-q" placeholder="Traži artikl, šifru, dobavljača…" value="${esc(query)}"
             autocomplete="off" aria-label="Pretraga skladišta">
    </div>
    <div class="panel">
      <div class="ph">${icon("box")}<h2>Skladište</h2>
        <span class="meta" style="margin-left:auto" id="wh-count"></span></div>
      <div id="wh-list"></div>
    </div>`;

  openDetail = ctx.itemId ? { itemId: ctx.itemId, hash: ctx.hash } : null;
  if (openDetail) renderDetail(main, ctx);

  // Search re-renders ONLY the list, so the input (and its caret) is never
  // touched — no full-view teardown per keystroke.
  const input = main.querySelector("#wh-q");
  input.oninput = () => {
    query = input.value;
    renderList(main, ctx);
    announce(main.querySelector("#wh-count").textContent);
  };
  renderList(main, ctx);
}

function renderList(main, ctx) {
  const items = db.listItems().filter((it) =>
    !query || (it.name + it.sku + it.id + it.supplier).toLowerCase().includes(query.toLowerCase()));
  main.querySelector("#wh-count").textContent = hrCount(items.length, ["artikl", "artikla", "artikala"]);
  const list = main.querySelector("#wh-list");
  list.innerHTML = items.length === 0
    ? `<div class="row"><span class="b"><span class="n">Nema rezultata.</span></span></div>`
    : items.map((it) => rowHTML(it)).join("");
  wireRowActions(list, main, ctx);
}

// Every data change repaints the list AND the open detail — one item, one
// truth on screen. Keyboard focus survives the innerHTML swap by re-finding
// the equivalent control.
function refresh(main, ctx) {
  const active = document.activeElement;
  const focusKey = active && active.dataset
    ? ["recv", "issue", "reorder", "dRecv", "dIssue", "dOrder"].find((k) => active.dataset[k] !== undefined)
    : null;
  const focusVal = focusKey ? active.dataset[focusKey] : null;
  renderList(main, ctx);
  if (openDetail) renderDetail(main, ctx);
  if (focusKey) {
    const attr = "data-" + focusKey.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
    const again = main.querySelector(`[${attr}${focusVal ? `="${CSS.escape(focusVal)}"` : ""}]`);
    // The acted button may be gone (e.g. Naruči became Naručeno) — land on
    // the search field rather than dropping keyboard users onto <body>.
    (again || main.querySelector("#wh-q"))?.focus({ preventScroll: true });
  }
}

function act(main, ctx, fn, itemId) {
  try {
    fn();
    if (itemId) {
      const it = db.getItem(itemId);
      if (it) announce(`${it.name}: stanje ${it.qty}`);
    }
  } catch (err) { toast(err.message); }
  refresh(main, ctx);
}

function rowHTML(it) {
  const ordered = db.openReorderFor(it.id);
  return `
    <div class="row">
      ${thumb(it)}
      <span class="b"><span class="n">${esc(it.name)}</span>
        <span class="a">${esc(it.id)} · ${esc(it.sku)} · ${esc(it.loc)} · ${esc(it.supplier)}</span></span>
      ${isLowStock(it) ? '<span class="badge-low">Nisko</span>' : ""}
      <span class="rt"><span class="big">${esc(String(it.qty))}</span>
        <span class="ag">min ${esc(String(it.min))}</span></span>
      <span class="rt acts-inline">
        <button class="btn btn-ghost btn-sq" data-recv="${esc(it.id)}" aria-label="Zaprimi ${esc(it.name)}">+</button>
        <button class="btn btn-ghost btn-sq" data-issue="${esc(it.id)}" aria-label="Izdaj ${esc(it.name)}">−</button>
        ${isLowStock(it) ? (ordered
          ? `<button class="btn btn-ghost btn-sq wide" disabled>Naručeno</button>`
          : `<button class="btn btn-red btn-sq wide" data-reorder="${esc(it.id)}">Naruči</button>`) : ""}
      </span>
    </div>`;
}

function wireRowActions(scope, main, ctx) {
  scope.querySelectorAll("[data-recv]").forEach((b) => b.onclick = () =>
    act(main, ctx, () => db.adjustQty(b.dataset.recv, +1, ctx.session.name), b.dataset.recv));
  scope.querySelectorAll("[data-issue]").forEach((b) => b.onclick = () =>
    act(main, ctx, () => db.adjustQty(b.dataset.issue, -1, ctx.session.name), b.dataset.issue));
  scope.querySelectorAll("[data-reorder]").forEach((b) => b.onclick = () => {
    // The row may be stale (another tab or the detail panel changed stock).
    const item = db.getItem(b.dataset.reorder);
    const proposal = item ? reorderProposal(item) : null;
    if (!proposal || db.openReorderFor(item.id)) {
      toast("Stanje se promijenilo — narudžba više nije potrebna.");
      refresh(main, ctx);
      return;
    }
    confirmReorder(main, ctx, item, proposal);
  });
}

// ---- QR deep link: the exact product, front and center ----------------------
function renderDetail(main, ctx) {
  const { itemId, hash } = openDetail;
  const target = main.querySelector("#wh-detail");
  const item = db.getItem(itemId);
  if (!item) {
    target.innerHTML = `
      <div class="panel"><div class="ph">${icon("alert")}<h2>Nepoznata naljepnica</h2></div>
        <div class="row"><span class="b"><span class="n">Artikl "${esc(itemId)}" ne postoji.</span>
          <span class="a">Provjeri naljepnicu ili potraži artikl pretragom.</span></span></div>
      </div>`;
    return;
  }
  // The sticker also carries a supplier — the database is the authority, but
  // a mismatch is worth a warning (swapped or stale sticker).
  const parsed = parseQrPayload("#" + (hash || ""));
  const stickerSupplier = parsed ? parsed.supplier : null;
  const mismatch = stickerSupplier && stickerSupplier !== item.supplier;
  const low = isLowStock(item);
  const ordered = db.openReorderFor(item.id);
  const proposal = low && !ordered ? reorderProposal(item) : null;

  target.innerHTML = `
    <div class="panel">
      ${item.imgFull ? `<img class="p-img" src="${esc(item.imgFull)}" alt="">` : ""}
      <div class="ph">${icon("scan")}<h2>Skenirani artikl</h2>
        <span class="meta mono" style="margin-left:auto">${esc(item.id)}</span></div>
      <div class="row">
        ${thumb(item, "detail-img")}
        <span class="b"><span class="n">${esc(item.name)}</span>
          <span class="a">${esc(item.sku)} · lokacija ${esc(item.loc)} · dobavljač ${esc(item.supplier)}</span>
          ${mismatch ? `<span class="a warn">⚠ Naljepnica navodi drugog dobavljača
            (${esc(stickerSupplier)}) — vrijedi podatak iz baze.</span>` : ""}</span>
        ${low ? '<span class="badge-low">Nisko</span>' : ""}
        <span class="rt"><span class="big">${esc(String(item.qty))}</span>
          <span class="ag">na stanju · min ${esc(String(item.min))}</span></span>
      </div>
      <div class="row" style="gap:8px">
        <button class="btn btn-ghost" data-d-recv>Zaprimi +1</button>
        <button class="btn btn-ghost" data-d-issue>Izdaj −1</button>
        ${proposal ? `<button class="btn btn-red" data-d-order>Naruči ${esc(String(proposal.quantity))} kom</button>` : ""}
        ${ordered ? `<button class="btn btn-ghost" disabled>Naručeno (${esc(String(ordered.quantity))} kom)</button>` : ""}
      </div>
    </div>`;

  target.querySelector("[data-d-recv]").onclick = () =>
    act(main, ctx, () => db.adjustQty(item.id, +1, ctx.session.name), item.id);
  target.querySelector("[data-d-issue]").onclick = () =>
    act(main, ctx, () => db.adjustQty(item.id, -1, ctx.session.name), item.id);
  const orderBtn = target.querySelector("[data-d-order]");
  // Ordering always goes through the same confirmation dialog.
  if (orderBtn) orderBtn.onclick = () => confirmReorder(main, ctx, item, proposal);
}

// ---- Reorder confirmation ---------------------------------------------------
function confirmReorder(main, ctx, item, proposal) {
  const previouslyFocused = document.activeElement;
  const scrim = document.createElement("div");
  scrim.className = "scrim";
  scrim.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="Narudžba dijelova">
      <h2>Narudžba dijelova</h2>
      <p><b>${esc(item.name)}</b> je na ${esc(String(item.qty))} kom (minimum
         ${esc(String(item.min))}). Predlažemo narudžbu <b>${esc(String(proposal.quantity))} kom</b>
         od dobavljača <b>${esc(proposal.supplier)}</b>.</p>
      <div class="acts">
        <button class="btn btn-ghost" data-cancel>Odustani</button>
        <button class="btn btn-red" data-place>Naruči</button>
      </div>
    </div>`;
  document.body.appendChild(scrim);
  const close = (restoreFocus = true) => {
    scrim.remove();
    document.removeEventListener("keydown", onKey);
    if (restoreFocus && previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus();
  };
  scrim._close = close; // router/logout cleanup goes through here (no leaks)
  const onKey = (e) => {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "Tab") {
      // Two focusables; keep Tab cycling inside the dialog.
      const focusables = [...scrim.querySelectorAll("button")];
      const idx = focusables.indexOf(document.activeElement);
      e.preventDefault();
      const next = e.shiftKey
        ? focusables[(idx - 1 + focusables.length) % focusables.length]
        : focusables[(idx + 1) % focusables.length];
      next.focus();
    }
  };
  document.addEventListener("keydown", onKey);
  scrim.querySelector("[data-cancel]").onclick = () => close();
  scrim.addEventListener("click", (e) => { if (e.target === scrim) close(); });
  scrim.querySelector("[data-place]").onclick = () => {
    try {
      const o = db.placeReorder(item.id);
      toast(`Narudžba poslana: ${item.name} × ${o.quantity} (${o.supplier})`);
    } catch (err) { toast(err.message); }
    close(false);          // the old row button is about to be replaced
    refresh(main, ctx);    // repaint list + detail; refresh() lands focus sanely
  };
  scrim.querySelector("[data-place]").focus();
}
