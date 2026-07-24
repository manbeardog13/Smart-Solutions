// ============================================================================
// views/admin.js — role visibility matrix. Administrators decide how much of
// the platform each role sees; the owner always sees everything.
// ============================================================================
import * as db from "../db.js";
import { ROLES, DEFAULT_VISIBILITY, VIEW_LABELS } from "../domain.js";
import { esc, icon, toast } from "../ui.js";

export function render(main) {
  const visibility = db.getVisibilityOverride() || db.clone(DEFAULT_VISIBILITY);
  const editableRoles = ROLES.filter((r) => r !== "vlasnik");
  const allViews = DEFAULT_VISIBILITY.vlasnik;

  const ROLE_TITLES = { majstor: "Majstor", skladistar: "Skladištar" };
  main.innerHTML = `
    <div class="panel tabbed">
      <h2 class="tab-tl">Vidljivost po ulozi</h2><div class="ph" style="padding-top:0">
        <span class="meta" style="margin-left:auto">vlasnik uvijek vidi sve</span></div>
      ${editableRoles.map((role) => `
        <div class="row" style="align-items:flex-start">
          <span class="b"><span class="n">${esc(ROLE_TITLES[role] || role)}</span>
            <span class="a">odaberi dostupne dijelove platforme</span>
            <span style="display:flex;flex-wrap:wrap;gap:7px;margin-top:9px">
            ${allViews.filter((v) => v !== "admin").map((v) => {
              const on = v === "dashboard" || visibility[role]?.includes(v);
              // The dashboard can never be removed (domain.js enforces it) —
              // the matrix shows that truth instead of contradicting it.
              return `
              <button class="btn ${on ? "btn-red" : "btn-ghost"}"
                      style="width:auto;padding:9px 13px;font-size:12px"
                      role="switch" aria-checked="${on}" ${v === "dashboard" ? "disabled" : ""}
                      aria-label="${esc(VIEW_LABELS[v])} — ${esc(ROLE_TITLES[role] || role)}"
                      data-role="${esc(role)}" data-view="${esc(v)}">${esc(VIEW_LABELS[v])}</button>`;
            }).join("")}
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
      set.add("dashboard"); // matrix mirrors the domain rule
      visibility[role] = [...set];
      try {
        db.setVisibilityOverride(visibility);
        toast("Spremljeno. Primjenjuje se pri sljedećoj navigaciji te uloge.");
      } catch (err) { toast(err.message); }
      render(main);
    };
  });
  main.querySelector("[data-reset-demo]").onclick = () => {
    try {
      db.resetDemo();
      toast("Demo podaci vraćeni na početno stanje.");
    } catch (err) { toast(err.message); }
    render(main);
  };
}
