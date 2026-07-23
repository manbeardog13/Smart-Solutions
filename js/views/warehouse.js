// ============================================================================
// views/warehouse.js — inventory: search, low-stock alerts, receive/issue,
// the reorder flow, and the QR deep-link item detail (#/item/<id>) — a
// scanned sticker must show the exact product before any action.
// ============================================================================
import * as db from "../db.js";
import { isLowStock, reorderProposal } from "../domain.js";
import { esc, icon, toast } from "../ui.js";

let query = "";
let queryOwner = null; // one user's search never leaks to the next

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

  if (ctx.itemId) renderDetail(main, ctx, ctx.itemId, ctx.hash);

  // Search re-renders ONLY the list, so the input (and its caret) is never
  // touched — no full-view teardown per keystroke.
  const input = main.querySelector("#wh-q");
  input.oninput = () => { query = input.value; renderList(main, ctx); };
  renderList(main, ctx);
}

function renderList(main, ctx) {
  const items = db.listItems().filter((it) =>
    !query || (it.name + it.sku + it.id + it.supplier).toLowerCase().includes(query.toLowerCase()));
  main.querySelector("#wh-count").textContent = `${items.length} artikala`;
  const list = main.querySelector("#wh-list");
  list.innerHTML = items.length === 0
    ? `<div class="row"><span class="b"><span class="n">Nema rezultata.</span></span></div>`
    : items.map((it) => rowHTML(it)).join("");
  wireRowActions(list, main, ctx);
}

function rowHTML(it) {
  const ordered = db.openReorderFor(it.id);
  return `
    <div class="row">
      <img src="${esc(it.img)}" alt="" loading="lazy" width="44" height="44">
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
  const act = (fn) => {
    try { fn(); } catch (err) { toast(err.message); }
    renderList(main, ctx);
  };
  scope.querySelectorAll("[data-recv]").forEach((b) => b.onclick = () =>
    act(() => db.adjustQty(b.dataset.recv, +1, ctx.session.name)));
  scope.querySelectorAll("[data-issue]").forEach((b) => b.onclick = () =>
    act(() => db.adjustQty(b.dataset.issue, -1, ctx.session.name)));
  scope.querySelectorAll("[data-reorder]").forEach((b) => b.onclick = () => {
    const item = db.getItem(b.dataset.reorder);
    confirmReorder(main, ctx, item, reorderProposal(item));
  });
}

// ---- QR deep link: the exact product, front and center ----------------------
function renderDetail(main, ctx, itemId, hash) {
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
  let stickerSupplier = null;
  const m = String(hash || "").match(/[?&]s=([^&]+)/);
  if (m) { try { stickerSupplier = decodeURIComponent(m[1]); } catch { stickerSupplier = null; } }
  const mismatch = stickerSupplier && stickerSupplier !== item.supplier;
  const low = isLowStock(item);
  const ordered = db.openReorderFor(item.id);
  const proposal = low && !ordered ? reorderProposal(item) : null;

  target.innerHTML = `
    <div class="panel detail">
      <div class="ph">${icon("scan")}<h2>Skenirani artikl</h2>
        <span class="meta mono" style="margin-left:auto">${esc(item.id)}</span></div>
      <div class="row">
        <img src="${esc(item.img)}" alt="${esc(item.name)}" class="detail-img">
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

  const redraw = () => { renderDetail(main, ctx, itemId, hash); renderList(main, ctx); };
  const act = (fn) => { try { fn(); } catch (err) { toast(err.message); } redraw(); };
  target.querySelector("[data-d-recv]").onclick = () =>
    act(() => db.adjustQty(item.id, +1, ctx.session.name));
  target.querySelector("[data-d-issue]").onclick = () =>
    act(() => db.adjustQty(item.id, -1, ctx.session.name));
  const orderBtn = target.querySelector("[data-d-order]");
  if (orderBtn) orderBtn.onclick = () => act(() => {
    const o = db.placeReorder(item.id);
    toast(`Narudžba poslana: ${item.name} × ${o.quantity} (${o.supplier})`);
  });
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
  const close = () => {
    scrim.remove();
    document.removeEventListener("keydown", onKey);
    if (previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus();
  };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  scrim.querySelector("[data-cancel]").onclick = close;
  scrim.addEventListener("click", (e) => { if (e.target === scrim) close(); });
  scrim.querySelector("[data-place]").onclick = () => {
    try {
      const o = db.placeReorder(item.id);
      toast(`Narudžba poslana: ${item.name} × ${o.quantity} (${o.supplier})`);
    } catch (err) { toast(err.message); }
    close();
    renderList(main, ctx);
  };
  scrim.querySelector("[data-place]").focus();
}
