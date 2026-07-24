// ============================================================================
// views/orders.js — work orders (radni nalozi) + placed part reorders.
// ============================================================================
import * as db from "../db.js";
import { esc, icon, thumb, hrCount } from "../ui.js";

export function render(main) {
  const orders = db.listOrders();
  const placed = db.listPlacedOrders();
  const items = new Map(db.listItems().map((i) => [i.id, i]));
  main.innerHTML = `
    <div class="panel tabbed">
      <img class="p-img" src="catalogue/thumbs/catalogue-cover.webp" alt="">
      <h2 class="tab-tl">Nalozi</h2>
      <span class="tab-corner">${hrCount(orders.length, ["otvoren", "otvorena", "otvorenih"])}</span>
      ${orders.length === 0 ? `
        <div class="row"><span class="b"><span class="n">Nema otvorenih radnih naloga.</span>
          <span class="a">Novi nalozi pojavit će se ovdje.</span></span></div>` : ""}
      ${orders.map((o) => `
        <div class="row">
          <span class="b"><span class="n">${esc(o.client)} — ${esc(o.task)}</span>
            <span class="a">${esc(o.loc)} · ${esc(o.tech)}</span></span>
          <span class="rt"><span class="big" style="font-size:12.5px">${esc(o.when)}</span></span>
        </div>`).join("")}
    </div>
    <div class="panel tabbed">
      <h2 class="tab-tl">Narudžbe</h2>
      ${placed.length === 0
        ? `<div class="row"><div class="b"><div class="n">Nema aktivnih narudžbi.</div>
             <div class="a">Narudžba se predlaže automatski kad artikl padne ispod minimuma.</div></div></div>`
        : placed.map((p) => {
            const item = items.get(p.itemId);
            return `
            <div class="row">
              ${item ? thumb(item) : ""}
              <span class="b"><span class="n">${esc(item ? item.name : p.itemId)}</span>
                <span class="a">${esc(p.supplier)}</span></span>
              <span class="rt"><span class="big">${esc(String(p.quantity))}</span>
                <span class="ag">kom</span></span>
            </div>`;
          }).join("")}
    </div>`;
}
