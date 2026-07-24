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
    <div class="panel">
      <div class="ph">${icon("order")}<h2>Radni nalozi</h2>
        <span class="meta" style="margin-left:auto">${hrCount(orders.length, ["otvoren", "otvorena", "otvorenih"])}</span></div>
      ${orders.map((o) => `
        <div class="row">
          <span class="b"><span class="n">${esc(o.client)} — ${esc(o.task)}</span>
            <span class="a">${esc(o.id)} · ${esc(o.loc)} · dodijeljeno: ${esc(o.tech)}</span></span>
          <span class="rt"><span class="big" style="font-size:12.5px">${esc(o.when)}</span>
            <span class="ag">${esc(o.status)}</span></span>
        </div>`).join("")}
    </div>
    <div class="panel">
      <div class="ph">${icon("box")}<h2>Narudžbe dijelova</h2></div>
      ${placed.length === 0
        ? `<div class="row"><div class="b"><div class="n">Nema aktivnih narudžbi.</div>
             <div class="a">Narudžba se predlaže automatski kad artikl padne ispod minimuma.</div></div></div>`
        : placed.map((p) => {
            const item = items.get(p.itemId);
            return `
            <div class="row">
              ${item ? thumb(item) : ""}
              <span class="b"><span class="n">${esc(item ? item.name : p.itemId)}</span>
                <span class="a">${esc(p.id)} · dobavljač: ${esc(p.supplier)}</span></span>
              <span class="rt"><span class="big">${esc(String(p.quantity))}</span>
                <span class="ag">kom</span></span>
            </div>`;
          }).join("")}
    </div>`;
}
