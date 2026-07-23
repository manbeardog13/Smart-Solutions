// ============================================================================
// views/warehouse.js — inventory: search, low-stock alerts, receive/issue,
// and the reorder flow (supplier comes from the item / QR payload).
// ============================================================================
import * as db from "../db.js";
import { isLowStock, reorderProposal } from "../domain.js";
import { esc, icon, toast } from "../ui.js";

let query = "";

export function render(main, ctx) {
  const { session } = ctx;
  const items = db.listItems().filter((it) =>
    !query || (it.name + it.sku + it.id + it.supplier).toLowerCase().includes(query.toLowerCase()));

  main.innerHTML = `
    <div class="searchbar">
      <input id="wh-q" placeholder="Traži artikl, šifru, dobavljača…" value="${esc(query)}"
             autocomplete="off">
    </div>
    <div class="panel">
      <div class="ph">${icon("box")}<h2>Skladište</h2>
        <span class="meta" style="margin-left:auto">${items.length} artikala</span></div>
      ${items.map((it) => `
        <div class="row">
          <img src="${esc(it.img)}" alt="" loading="lazy">
          <span class="b"><span class="n">${esc(it.name)}</span>
            <span class="a">${esc(it.id)} · ${esc(it.sku)} · ${esc(it.loc)} · ${esc(it.supplier)}</span></span>
          ${isLowStock(it) ? '<span class="badge-low">Nisko</span>' : ""}
          <span class="rt"><span class="big">${esc(String(it.qty))}</span>
            <span class="ag">min ${esc(String(it.min))}</span></span>
          <span class="rt" style="display:flex;gap:6px">
            <button class="btn btn-ghost" style="width:auto;padding:9px 13px" data-recv="${esc(it.id)}"
                    aria-label="Zaprimi">+</button>
            <button class="btn btn-ghost" style="width:auto;padding:9px 13px" data-issue="${esc(it.id)}"
                    aria-label="Izdaj">−</button>
            ${isLowStock(it) ? `<button class="btn btn-red" style="width:auto;padding:9px 13px"
                    data-reorder="${esc(it.id)}">Naruči</button>` : ""}
          </span>
        </div>`).join("")}
    </div>`;

  const input = main.querySelector("#wh-q");
  input.oninput = () => { query = input.value; render(main, ctx);
    const q = main.querySelector("#wh-q"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); };

  main.querySelectorAll("[data-recv]").forEach((b) => b.onclick = () => {
    db.adjustQty(b.dataset.recv, +1, session.name); render(main, ctx);
  });
  main.querySelectorAll("[data-issue]").forEach((b) => b.onclick = () => {
    db.adjustQty(b.dataset.issue, -1, session.name); render(main, ctx);
  });
  main.querySelectorAll("[data-reorder]").forEach((b) => b.onclick = () => {
    const item = db.getItem(b.dataset.reorder);
    const proposal = reorderProposal(item);
    confirmReorder(main, ctx, item, proposal);
  });
}

function confirmReorder(main, ctx, item, proposal) {
  const scrim = document.createElement("div");
  scrim.className = "scrim";
  scrim.innerHTML = `
    <div class="modal" role="dialog" aria-label="Narudžba">
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
  scrim.querySelector("[data-cancel]").onclick = () => scrim.remove();
  scrim.addEventListener("click", (e) => { if (e.target === scrim) scrim.remove(); });
  scrim.querySelector("[data-place]").onclick = () => {
    db.placeReorder(item.id);
    scrim.remove();
    toast(`Narudžba poslana: ${item.name} × ${proposal.quantity} (${proposal.supplier})`);
    render(main, ctx);
  };
}
