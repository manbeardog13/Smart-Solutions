// ============================================================================
// data.js — demo dataset (Croatian). Real deployments replace this with
// Supabase rows; the shapes stay identical. Product imagery comes from the
// company catalogue (catalogue/ — Panasonic general catalogue 2026/27).
// ============================================================================

export const DEMO_USERS = [
  { id: "u-vido", name: "Vido", role: "vlasnik", title: "Vlasnik" },
  { id: "u-marko", name: "Marko", role: "majstor", title: "Majstor · teren" },
  { id: "u-ana", name: "Ana", role: "skladistar", title: "Skladištar" },
];

export const DEMO_ITEMS = [
  { id: "SS-0001", name: "Aquarea M monoblok 9 kW", sku: "WH-MXC09J3E5", supplier: "Panasonic HR",
    qty: 4, min: 2, batch: 2, loc: "A-1-2", img: "catalogue/thumbs/aquarea-monoblock.webp",
    imgFull: "catalogue/images/aquarea-monoblock.png" },
  { id: "SS-0002", name: "Aquarea All-in-One 7 kW", sku: "WH-ADC0709J3E5", supplier: "Panasonic HR",
    qty: 2, min: 2, batch: 2, loc: "A-1-3", img: "catalogue/thumbs/aquarea-unit-allinone.webp",
    imgFull: "catalogue/images/aquarea-unit-allinone.png" },
  // Owner's rule: EVERY asset carries a real photo — catalogue first, else
  // found online and imported (sources in catalogue/images/parts/SOURCES.md).
  { id: "SS-0003", name: "Bakrena cijev 1/4\" (m)", sku: "CU-14", supplier: "Metal d.o.o.",
    qty: 34, min: 50, batch: 100, loc: "B-2-1",
    img: "catalogue/thumbs/parts/cu-pipe-14.jpg", imgFull: "catalogue/images/parts/cu-pipe-14.jpg" },
  { id: "SS-0004", name: "Bakrena cijev 3/8\" (m)", sku: "CU-38", supplier: "Metal d.o.o.",
    qty: 120, min: 50, batch: 100, loc: "B-2-2",
    img: "catalogue/thumbs/parts/cu-pipe-38.jpg", imgFull: "catalogue/images/parts/cu-pipe-38.jpg" },
  { id: "SS-0005", name: "Zidni nosač vanjske jedinice", sku: "NOS-450", supplier: "Termo-oprema",
    qty: 8, min: 10, batch: 20, loc: "C-1-1",
    img: "catalogue/thumbs/parts/wall-bracket.jpg", imgFull: "catalogue/images/parts/wall-bracket.jpg" },
  { id: "SS-0006", name: "Kondenzna pumpa mini", sku: "KP-MINI", supplier: "Termo-oprema",
    qty: 15, min: 6, batch: 12, loc: "C-1-4",
    img: "catalogue/thumbs/parts/cond-pump.jpg", imgFull: "catalogue/images/parts/cond-pump.jpg" },
  { id: "SS-0007", name: "Izolacija 9 mm (m)", sku: "IZO-9", supplier: "Izolacije Adria",
    qty: 210, min: 100, batch: 200, loc: "B-3-1",
    img: "catalogue/thumbs/parts/insulation.jpg", imgFull: "catalogue/images/parts/insulation.jpg" },
];

export const DEMO_ORDERS = [
  { id: "RN-114", client: "Hotel Stepinac", task: "Zamjena vanjske jedinice", when: "danas 14:00",
    tech: "Marko", status: "otvoren", loc: "Lapad" },
  { id: "RN-115", client: "Lučka uprava Gruž", task: "Servis + provjera tlaka", when: "sutra 09:00",
    tech: "Marko", status: "otvoren", loc: "Gruž" },
  { id: "RN-116", client: "ACI Komolac", task: "Puštanje u rad, 2× monoblok", when: "pet 08:30",
    tech: "Ivan", status: "otvoren", loc: "Komolac" },
];

export const DEMO_MOVEMENTS = [
  { id: "m1", ts: "23.07. 08:12", who: "Ana", what: "Zaprimljeno", item: "SS-0004", qty: +100 },
  { id: "m2", ts: "23.07. 09:40", who: "Marko", what: "Izdano na teren", item: "SS-0003", qty: -16 },
  { id: "m3", ts: "23.07. 11:05", who: "Ana", what: "Povrat s terena", item: "SS-0005", qty: +2 },
  { id: "m4", ts: "23.07. 12:30", who: "Marko", what: "Izdano na teren", item: "SS-0001", qty: -1 },
];
