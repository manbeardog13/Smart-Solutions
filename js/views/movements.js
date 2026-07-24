// ============================================================================
// views/movements.js — the movement log (receipts, field issues, returns).
// ============================================================================
import * as db from "../db.js";
import { esc, icon, thumb } from "../ui.js";

export function render(main) {
  const movements = db.listMovements();
  const items = new Map(db.listItems().map((i) => [i.id, i]));
  main.innerHTML = `
    <div class="panel tabbed">
      <h2 class="tab-tl">Kretanja</h2>
      ${movements.length === 0 ? `
        <div class="row"><span class="b"><span class="n">Nema zabilježenih kretanja.</span>
          <span class="a">Zaprimanja i izdavanja bilježe se ovdje.</span></span></div>` : ""}
      ${movements.map((m) => {
        const item = items.get(m.item);
        return `
        <button class="row" data-goto-item="${esc(m.item)}">
          ${item ? thumb(item) : ""}
          <span class="b"><span class="n">${esc(item ? item.name : m.item)}</span>
            <span class="a">${esc(m.what)} · ${esc(m.ts)}</span></span>
          <span class="rt"><span class="big" style="color:${m.qty >= 0 ? "inherit" : "var(--red-text)"}">
            ${m.qty >= 0 ? "+" : ""}${esc(String(m.qty))}</span></span>
        </button>`;
      }).join("")}
    </div>`;

  // every movement leads back to its item
  main.querySelectorAll("[data-goto-item]").forEach((b) => {
    b.onclick = () => { location.hash = "#/item/" + encodeURIComponent(b.dataset.gotoItem); };
  });
}
