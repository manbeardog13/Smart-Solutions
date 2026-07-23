// ============================================================================
// views/scan.js — QR stickers and scanning.
// Every sticker encodes a URL (works with the plain phone camera, the ASC
// pattern) that identifies the item AND its supplier — reordering depends on
// the supplier. Demo mode simulates the camera; the live build wires
// html5-qrcode + photo fallback + the Gemini photo-to-QR flow exactly as the
// ASC platform does (see docs/REQUIREMENTS.md).
// ============================================================================
import * as db from "../db.js";
import { qrPayload, parseQrPayload, isLowStock, reorderProposal } from "../domain.js";
import { config } from "../config.js";
import { esc, icon, toast } from "../ui.js";

export function render(main, ctx) {
  const items = db.listItems();
  main.innerHTML = `
    <div class="panel">
      <div class="ph">${icon("scan")}<h2>Skeniranje</h2></div>
      <div class="row"><span class="b">
        <span class="n">Skeniraj naljepnicu kamerom telefona</span>
        <span class="a">QR je URL — otvara točan artikl i nosi dobavljača.
          Demo: odaberi artikl za simulaciju skena.</span></span></div>
      ${items.map((it) => `
        <button class="row" data-scan="${esc(it.id)}">
          <img src="${esc(it.img)}" alt="" loading="lazy">
          <span class="b"><span class="n">${esc(it.name)}</span>
            <span class="a mono" style="text-transform:none">${esc(qrPayload(it, config.APP_BASE_URL))}</span></span>
          <span class="rt"><span class="ag">simuliraj sken</span></span>
        </button>`).join("")}
    </div>
    <div class="panel">
      <div class="ph">${icon("box")}<h2>Nova naljepnica — veliki dijelovi</h2></div>
      <div class="row"><span class="b">
        <span class="n">Slikaj pločicu uređaja</span>
        <span class="a">Gemini očita serijski broj sa slike i kreira QR naljepnicu.
          Ako nije 100% siguran u znak, traži bolju sliku. (Aktivno s produkcijskim backendom.)</span></span>
        <span class="rt"><button class="btn btn-ghost" style="width:auto;padding:10px 16px" data-photo>
          Slikaj</button></span></div>
    </div>
    <div id="scan-result"></div>`;

  main.querySelector("[data-photo]").onclick = () =>
    toast("Gemini očitavanje aktivno je s produkcijskim backendom.");

  main.querySelectorAll("[data-scan]").forEach((b) => {
    b.onclick = () => {
      const item = db.getItem(b.dataset.scan);
      const parsed = parseQrPayload(qrPayload(item, config.APP_BASE_URL));
      showResult(main, ctx, item, parsed);
    };
  });
}

// Scan confirmation: the exact product, its image, and the low-stock offer —
// the employee sees what they hold before any action (docs/REQUIREMENTS.md).
function showResult(main, ctx, item, parsed) {
  const target = main.querySelector("#scan-result");
  const low = isLowStock(item);
  const proposal = low ? reorderProposal(item) : null;
  target.innerHTML = `
    <div class="panel">
      <div class="ph">${icon("scan")}<h2>Rezultat skena</h2>
        <span class="meta" style="margin-left:auto mono">${esc(parsed.itemId)}</span></div>
      <div class="row">
        <img src="${esc(item.img)}" alt="" style="width:64px;height:64px;flex-basis:64px">
        <span class="b"><span class="n">${esc(item.name)}</span>
          <span class="a">${esc(item.sku)} · lokacija ${esc(item.loc)} · dobavljač
            ${esc(parsed.supplier || item.supplier)}</span></span>
        ${low ? '<span class="badge-low">Nisko</span>' : ""}
        <span class="rt"><span class="big">${esc(String(item.qty))}</span>
          <span class="ag">na stanju</span></span>
      </div>
      <div class="row" style="gap:8px">
        <button class="btn btn-ghost" data-r-recv>Zaprimi +1</button>
        <button class="btn btn-ghost" data-r-issue>Izdaj −1</button>
        ${low ? `<button class="btn btn-red" data-r-order>Naruči ${esc(String(proposal.quantity))} kom</button>` : ""}
      </div>
    </div>`;
  target.querySelector("[data-r-recv]").onclick = () => {
    db.adjustQty(item.id, +1, ctx.session.name); toast("Zaprimljeno +1");
    showResult(main, ctx, db.getItem(item.id), parsed);
  };
  target.querySelector("[data-r-issue]").onclick = () => {
    db.adjustQty(item.id, -1, ctx.session.name); toast("Izdano −1");
    showResult(main, ctx, db.getItem(item.id), parsed);
  };
  const orderBtn = target.querySelector("[data-r-order]");
  if (orderBtn) orderBtn.onclick = () => {
    db.placeReorder(item.id);
    toast(`Narudžba poslana (${item.supplier})`);
    showResult(main, ctx, db.getItem(item.id), parsed);
  };
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}
