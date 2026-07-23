// ============================================================================
// views/dashboard.js — KPI cards (dealt center-out on entry) + attention list.
// ============================================================================
import * as db from "../db.js";
import { lowStockItems, dealDelays } from "../domain.js";
import { esc, icon, go } from "../ui.js";

export function render(main, ctx) {
  const items = db.listItems();
  const low = lowStockItems(items);
  const orders = db.listOrders();
  const movements = db.listMovements();

  const cards = [
    { meta: "Pozicija spremno", v: String(items.length - low.length), alarm: false },
    { meta: "Ispod minimuma", v: String(low.length), alarm: low.length > 0 },
    { meta: "Otvoreni nalozi", v: String(orders.length), alarm: false },
    { meta: "Kretanja danas", v: String(movements.length), alarm: false },
  ];

  // Deal from the center out: order pairs [1,2] then [0,3] etc. On a 4-card
  // row the two middle cards land first, edges follow — all inside 620 ms.
  const delays = dealDelays(cards.length);
  const mid = (cards.length - 1) / 2;
  const order = cards.map((c, i) => ({ ...c, i, dist: Math.abs(i - mid) }))
    .sort((a, b) => a.dist - b.dist)
    .map((c, rank) => ({ ...c, delay: delays[rank] }));

  main.innerHTML = `
    <div class="cards deal">
      ${order.sort((a, b) => a.i - b.i).map((c) => `
        <div class="card ${c.alarm ? "alarm" : ""} ${c.i <= mid ? "from-right" : "from-left"}"
             style="--deal-delay:${c.delay}ms">
          <div class="meta">${esc(c.meta)}</div><div class="v">${esc(c.v)}</div>
        </div>`).join("")}
    </div>
    <div class="panel">
      <div class="ph">${icon("alert")}<h2>Traži pažnju</h2></div>
      ${low.length === 0 ? `<div class="row"><div class="b"><div class="n">Sve je pod kontrolom.</div></div></div>`
        : low.map((it) => `
        <button class="row" data-goto-item="${esc(it.id)}">
          <img src="${esc(it.img)}" alt="" loading="lazy">
          <span class="b"><span class="n">${esc(it.name)}</span>
            <span class="a">${esc(it.loc)} · ${esc(it.supplier)}</span></span>
          <span class="badge-low">Nisko</span>
          <span class="rt"><span class="big">${esc(String(it.qty))}</span>
            <span class="ag">min ${esc(String(it.min))}</span></span>
        </button>`).join("")}
    </div>
    <div class="panel">
      <div class="ph">${icon("order")}<h2>Radni nalozi</h2></div>
      ${db.listOrders().map((o) => `
        <div class="row">
          <span class="b"><span class="n">${esc(o.client)} — ${esc(o.task)}</span>
            <span class="a">${esc(o.id)} · ${esc(o.loc)} · ${esc(o.tech)}</span></span>
          <span class="rt"><span class="big" style="font-size:12px">${esc(o.when)}</span></span>
        </div>`).join("")}
    </div>`;

  main.querySelectorAll("[data-goto-item]").forEach((b) => {
    b.onclick = () => go("/warehouse");
  });
}
