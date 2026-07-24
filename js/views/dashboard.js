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
    { meta: "Spremno", v: String(items.length - low.length), alarm: false, goto: "/warehouse" },
    { meta: "Ispod minimuma", v: String(low.length), alarm: low.length > 0, goto: "/warehouse" },
    { meta: "Nalozi", v: String(orders.length), alarm: false, goto: "/orders" },
    { meta: "Kretanja", v: String(movements.length), alarm: false, goto: "/movements" },
  ];

  // Deal from the center out: order pairs [1,2] then [0,3] etc. On a 4-card
  // row the two middle cards land first, edges follow — all inside 620 ms.
  const delays = dealDelays(cards.length);
  const mid = (cards.length - 1) / 2;
  const order = cards.map((c, i) => ({ ...c, i, dist: Math.abs(i - mid) }))
    .sort((a, b) => a.dist - b.dist)
    .map((c, rank) => ({ ...c, delay: delays[rank] }));

  // Hero stage — the ASC dashboard stage in Operativa terms: eyebrow, greeting,
  // one big honest number, a capacity meter, catalogue imagery, corner tab.
  const h = new Date().getHours();
  const hi = h < 10 ? "Dobro jutro" : h < 18 ? "Dobar dan" : "Dobra večer";
  const ready = items.length - low.length;
  const pct = items.length ? Math.round((ready / items.length) * 100) : 100;
  const status = low.length === 0 ? "sve pod kontrolom"
    : hrCount(low.length, ["ispod minimuma", "ispod minimuma", "ispod minimuma"]);

  main.innerHTML = `
    <section class="hero">
      <div class="hero-img" aria-hidden="true"
           style="background-image:url('catalogue/images/aquarea-lifestyle.jpg')"></div>
      <span class="scrim" aria-hidden="true"></span>
      <span class="k">Operativa · Smart Solutions · Dubrovnik</span>
      <h1 class="greet-line">${esc(hi)}, ${esc((ctx.session && ctx.session.name) || "")}.</h1>
      <button class="hero-num" data-goto="/warehouse" aria-label="Otvori skladište">${esc(String(ready))}<em>${esc(hrCount(ready, ["pozicija spremna", "pozicije spremne", "pozicija spremno"]).replace(/^\d+\s*/, ""))}</em></button>
      <div class="cap">${esc(String(items.length))} artikala na stanju · ${esc(status)}</div>
      <div class="meter"><i style="width:${pct}%"></i></div>
      <span class="tab-corner">danas · Dubrovnik</span>
    </section>
    <div class="cards deal">
      ${order.sort((a, b) => a.i - b.i).map((c) => `
        <button class="card ${c.alarm ? "alarm" : ""} ${c.i <= mid ? "from-right" : "from-left"}"
             style="--deal-delay:${c.delay}ms" data-goto="${esc(c.goto)}">
          <div class="meta">${esc(c.meta)}</div><div class="v">${esc(c.v)}</div>
        </button>`).join("")}
    </div>
    <div class="panel tabbed">
      <h2 class="tab-tl">Traži pažnju</h2>
      ${low.length === 0 ? `<div class="row"><div class="b"><div class="n">Sve je pod kontrolom.</div></div></div>`
        : low.map((it) => canWarehouse ? `
        <button class="row" data-goto-item="${esc(it.id)}">
          ${thumb(it)}
          <span class="b"><span class="n">${esc(it.name)}</span>
            <span class="a">${esc(it.loc)}</span></span>
          <span class="badge-low">Nisko</span>
          <span class="rt"><span class="big">${esc(String(it.qty))}</span>
            <span class="ag">min ${esc(String(it.min))}</span></span>
        </button>` : `
        <div class="row">
          ${thumb(it)}
          <span class="b"><span class="n">${esc(it.name)}</span>
            <span class="a">${esc(it.loc)}</span></span>
          <span class="badge-low">Nisko</span>
          <span class="rt"><span class="big">${esc(String(it.qty))}</span>
            <span class="ag">min ${esc(String(it.min))}</span></span>
        </div>`).join("")}
    </div>
    ${canOrders ? `
    <div class="panel tabbed">
      <img class="p-img" src="catalogue/thumbs/catalogue-cover.webp" alt="">
      <h2 class="tab-tl">Nalozi</h2>
      ${orders.map((o) => `
        <button class="row" data-goto="/orders">
          <span class="b"><span class="n">${esc(o.client)} — ${esc(o.task)}</span>
            <span class="a">${esc(o.loc)}</span></span>
          <span class="rt"><span class="big" style="font-size:12px">${esc(o.when)}</span></span>
        </button>`).join("")}
    </div>` : ""}`;

  // Attention rows deep-link to the exact item, same as a scanned sticker —
  // only for roles that can actually open the warehouse.
  main.querySelectorAll("[data-goto-item]").forEach((b) => {
    b.onclick = () => { location.hash = "#/item/" + encodeURIComponent(b.dataset.gotoItem); };
  });
  // everything on the board is a real destination
  main.querySelectorAll("[data-goto]").forEach((b) => {
    b.onclick = () => { location.hash = "#" + b.dataset.goto; };
  });
}
