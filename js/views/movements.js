// ============================================================================
// views/movements.js — the movement log (receipts, field issues, returns).
// ============================================================================
import * as db from "../db.js";
import { esc, icon } from "../ui.js";

export function render(main) {
  const movements = db.listMovements();
  const items = new Map(db.listItems().map((i) => [i.id, i]));
  main.innerHTML = `
    <div class="panel">
      <div class="ph">${icon("move")}<h2>Kretanja</h2>
        <span class="meta" style="margin-left:auto">danas</span></div>
      ${movements.map((m) => {
        const item = items.get(m.item);
        return `
        <div class="row">
          ${item ? `<img src="${esc(item.img)}" alt="" loading="lazy">` : ""}
          <span class="b"><span class="n">${esc(m.what)} — ${esc(item ? item.name : m.item)}</span>
            <span class="a">${esc(m.ts)} · ${esc(m.who)}</span></span>
          <span class="rt"><span class="big" style="color:${m.qty >= 0 ? "inherit" : "var(--red)"}">
            ${m.qty >= 0 ? "+" : ""}${esc(String(m.qty))}</span></span>
        </div>`;
      }).join("")}
    </div>`;
}
