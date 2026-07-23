// ============================================================================
// views/admin.js — role visibility matrix. Administrators decide how much of
// the platform each role sees; the owner always sees everything.
// ============================================================================
import * as db from "../db.js";
import { ROLES, DEFAULT_VISIBILITY } from "../domain.js";
import { esc, icon, toast } from "../ui.js";

const VIEW_LABELS = {
  dashboard: "Ploča", warehouse: "Skladište", movements: "Kretanja",
  orders: "Radni nalozi", scan: "Skeniranje", admin: "Upravljanje",
};

export function render(main) {
  const visibility = db.getVisibilityOverride() || structuredClone(DEFAULT_VISIBILITY);
  const editableRoles = ROLES.filter((r) => r !== "vlasnik");
  const allViews = DEFAULT_VISIBILITY.vlasnik;

  main.innerHTML = `
    <div class="panel">
      <div class="ph">${icon("admin")}<h2>Vidljivost po ulozi</h2>
        <span class="meta" style="margin-left:auto">vlasnik uvijek vidi sve</span></div>
      ${editableRoles.map((role) => `
        <div class="row" style="align-items:flex-start">
          <span class="b"><span class="n" style="text-transform:capitalize">${esc(role)}</span>
            <span class="a">odaberi dostupne dijelove platforme</span>
            <span style="display:flex;flex-wrap:wrap;gap:7px;margin-top:9px">
            ${allViews.filter((v) => v !== "admin").map((v) => `
              <button class="btn ${visibility[role]?.includes(v) ? "btn-red" : "btn-ghost"}"
                      style="width:auto;padding:9px 13px;font-size:12px"
                      data-role="${esc(role)}" data-view="${esc(v)}">${esc(VIEW_LABELS[v])}</button>`).join("")}
            </span>
          </span>
        </div>`).join("")}
      <div class="row" style="gap:8px">
        <button class="btn btn-ghost" data-reset-demo>Resetiraj demo podatke</button>
      </div>
    </div>`;

  main.querySelectorAll("[data-role]").forEach((b) => {
    b.onclick = () => {
      const { role, view } = b.dataset;
      const set = new Set(visibility[role] || []);
      if (set.has(view)) set.delete(view); else set.add(view);
      visibility[role] = [...set];
      db.setVisibilityOverride(visibility);
      toast("Spremljeno. Vrijedi kod sljedeće prijave te uloge.");
      render(main);
    };
  });
  main.querySelector("[data-reset-demo]").onclick = () => {
    db.resetDemo();
    toast("Demo podaci vraćeni na početno stanje.");
    render(main);
  };
}
