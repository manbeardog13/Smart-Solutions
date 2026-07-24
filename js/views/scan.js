// ============================================================================
// views/scan.js — QR stickers and scanning.
// Every sticker encodes a URL (plain phone-camera scannable, the ASC pattern)
// identifying the item AND its supplier. The simulated scan navigates through
// the real deep link (#/item/<id>?s=…), exercising exactly the path a
// physical sticker takes; the live build adds html5-qrcode + photo fallback +
// the Gemini photo-to-QR flow (docs/REQUIREMENTS.md).
// ============================================================================
import * as db from "../db.js";
import { qrPayload } from "../domain.js";
import { appBaseUrl } from "../config.js";
import { esc, icon, toast, thumb } from "../ui.js";

export function render(main, ctx) {
  const canWarehouse = (ctx.views || []).includes("warehouse");
  const items = db.listItems();
  const base = appBaseUrl();
  main.innerHTML = `
    <div class="panel">
      <div class="ph">${icon("scan")}<h2>Skeniranje</h2></div>
      <div class="row"><span class="b">
        <span class="n">Skeniraj naljepnicu kamerom telefona</span>
        <span class="a">QR je URL — otvara točan artikl i nosi dobavljača.
          ${canWarehouse ? "Demo: odaberi artikl za simulaciju skena."
            : "Tvoja uloga nema pristup skladištu — sken prikazuje samo naljepnicu."}</span></span></div>
      ${items.map((it) => canWarehouse ? `
        <button class="row" data-scan="${esc(it.id)}" data-supplier="${esc(it.supplier)}">
          ${thumb(it)}
          <span class="b"><span class="n">${esc(it.name)}</span>
            <span class="a mono" style="text-transform:none">${esc(qrPayload(it, base))}</span></span>
          <span class="rt"><span class="ag">simuliraj sken</span></span>
        </button>` : `
        <div class="row">
          ${thumb(it)}
          <span class="b"><span class="n">${esc(it.name)}</span>
            <span class="a mono" style="text-transform:none">${esc(qrPayload(it, base))}</span></span>
        </div>`).join("")}
    </div>
    <div class="panel">
      <div class="ph">${icon("box")}<h2>Nova naljepnica — veliki dijelovi</h2></div>
      <div class="row"><span class="b">
        <span class="n">Slikaj pločicu uređaja</span>
        <span class="a">Gemini očita serijski broj sa slike i kreira QR naljepnicu.
          Ako nije 100% siguran u znak, traži bolju sliku. (Aktivno s produkcijskim backendom.)</span></span>
        <span class="rt"><button class="btn btn-ghost" style="width:auto;padding:12px 18px" data-photo>
          Slikaj</button></span></div>
    </div>`;

  main.querySelector("[data-photo]").onclick = () =>
    toast("Gemini očitavanje aktivno je s produkcijskim backendom.");

  // A simulated scan takes the same route a real camera scan does.
  main.querySelectorAll("[data-scan]").forEach((b) => {
    b.onclick = () => {
      location.hash = `#/item/${encodeURIComponent(b.dataset.scan)}?s=${encodeURIComponent(b.dataset.supplier)}`;
    };
  });
}
