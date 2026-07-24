// ============================================================================
// views/dashboard.js — KPI cards (dealt center-out on entry) + attention list.
// ============================================================================
import * as db from "../db.js";
import { lowStockItems, dealDelays } from "../domain.js";
import { esc, icon, thumb, hrCount } from "../ui.js";

export function render(main, ctx) {
  const views = ctx.views || [];
  const canWarehouse = views.includes("warehouse");
  const canOrders = views.includes("orders");
  const items = db.listItems();
  const low = lowStockItems(items);
  const orders = db.listOrders();
  const movements = db.listMovements();

  const cards = [
    { meta: "Spremne pozicije", v: String(items.length - low.length), alarm: false },
    { meta: "Ispod minimuma", v: String(low.length), alarm: low.length > 0 },
    { meta: "Otvoreni nalozi", v: String(orders.length), alarm: false },
    { meta: "Nedavna kretanja", v: String(movements.length), alarm: false },
  ];

  // Deal from the center out: order pairs [1,2] then [0,3] etc. On a 4-card
  // row the two middle cards land first, edges follow — all inside 620 ms.
  const delays = dealDelays(cards.length);
  const mid = (cards.length - 1) / 2;
  const order = cards.map((c, i) => ({ ...c, i, dist: Math.abs(i - mid) }))
    .sort((a, b) => a.dist - b.dist)
    .map((c, rank) => ({ ...c, delay: delays[rank] }));

  // Hero stage: the logon stage language inside the app — dark panel, short
  // two-tone greeting, one honest status line, catalogue imagery, notch tab.
  const h = new Date().getHours();
  const hi = h < 10 ? "Dobro jutro" : h < 18 ? "Dobar dan" : "Dobra večer";
  const status = low.length === 0 ? "Sve je pod kontrolom."
    : hrCount(low.length, ["pozicija traži pažnju.", "pozicije traže pažnju.", "pozicija traži pažnju."]);

  main.innerHTML = `
    <section class="hero">
      <div class="hero-img" aria-hidden="true"
           style="background-image:url('catalogue/images/aquarea-lifestyle.jpg')"></div>
      <h1 class="stage-title">${esc(hi)}, ${esc((ctx.session && ctx.session.name) || "")}.<br>
        <span>${esc(status)}</span></h1>
      <span class="notch">Ploča · danas</span>
    </section>
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
        : low.map((it) => canWarehouse ? `
        <button class="row" data-goto-item="${esc(it.id)}">
          ${thumb(it)}
          <span class="b"><span class="n">${esc(it.name)}</span>
            <span class="a">${esc(it.loc)} · ${esc(it.supplier)}</span></span>
          <span class="badge-low">Nisko</span>
          <span class="rt"><span class="big">${esc(String(it.qty))}</span>
            <span class="ag">min ${esc(String(it.min))}</span></span>
        </button>` : `
        <div class="row">
          ${thumb(it)}
          <span class="b"><span class="n">${esc(it.name)}</span>
            <span class="a">${esc(it.loc)} · ${esc(it.supplier)}</span></span>
          <span class="badge-low">Nisko</span>
          <span class="rt"><span class="big">${esc(String(it.qty))}</span>
            <span class="ag">min ${esc(String(it.min))}</span></span>
        </div>`).join("")}
    </div>
    ${canOrders ? `
    <div class="panel">
      <div class="ph">${icon("order")}<h2>Radni nalozi</h2></div>
      ${orders.map((o) => `
        <div class="row">
          <span class="b"><span class="n">${esc(o.client)} — ${esc(o.task)}</span>
            <span class="a">${esc(o.id)} · ${esc(o.loc)} · ${esc(o.tech)}</span></span>
          <span class="rt"><span class="big" style="font-size:12px">${esc(o.when)}</span></span>
        </div>`).join("")}
    </div>` : ""}`;

  // Attention rows deep-link to the exact item, same as a scanned sticker —
  // only for roles that can actually open the warehouse.
  main.querySelectorAll("[data-goto-item]").forEach((b) => {
    b.onclick = () => { location.hash = "#/item/" + encodeURIComponent(b.dataset.gotoItem); };
  });
}
