// Curated links between each Safe-D-Lock price-list model and Brady SKUs.
// level 1 = same product (identical type AND size/spec)   level 2 = equivalent (same type, differs in a stated way)
// level 3 = comparable (same job, different design)        no entry / no match = Safe-D-Lock only.
// exact: Brady SKUs at the stated level; conc: every Brady SKU of these product types gets `lvl` (same type, other size/colour/pack).
// gate: for sized colour families: SKUs with the same size → red = level 1, other colours = level 2.
export const LINKS = {
  "VH-25": {
    lvl: 2,
    exact: ["133161", "65375"],
    diff: "Vinyl-coated small hasp vs Brady 1 in.-jaw steel hasp (family not labelled in catalogue text); sold single or 12-pack",
    unverified: true,
  },
  "VH-39": {
    lvl: 2,
    exact: ["133162", "65376"],
    diff: "Vinyl-coated premier hasp vs Brady 1.5 in.-jaw steel hasp; sold single or 12-pack",
    unverified: true,
  },
  "VH-N33": {
    lvl: 2,
    exact: ["99668"],
    diff: "Nylon hasp; Brady lists 6 locks / 0.375 in. holes only, no 3 mm / 6 mm shackle variants",
  },
  "VH-N36": {
    lvl: 2,
    exact: ["99668"],
    diff: "Nylon hasp; Brady lists 6 locks / 0.375 in. holes only, no 3 mm / 6 mm shackle variants",
  },
  "VH-E25": {
    lvl: 2,
    exact: ["T218", "105720"],
    diff: "Electroplated 25 vs Brady plated steel hasp 1 in. jaws (family not labelled)",
    unverified: true,
  },
  "VH-E39": {
    lvl: 2,
    exact: ["T220", "105721"],
    diff: "Electroplated 39 vs Brady plated steel hasp 1.5 in. jaws (family not labelled)",
    unverified: true,
  },
  "VH-SSH": {
    lvl: 2,
    exact: ["871239"],
    diff: "Stainless steel hasp; Brady sells a 24-pack",
  },
  "VH-AL10": {
    lvl: 2,
    conc: ["grp-hasp-labeled"],
    diff: "Aluminium labelling hasp; Brady sells 5-packs in 6 colour sets / 4 label styles",
  },
  "TAG-T01": {
    lvl: 2,
    conc: ["tag-standard"],
    diff: "Safe-D-Lock pack of 10 vs Brady pack of 25; Brady has 10 designs x 3 materials x 3 reverse legends",
  },
  "TAG-T02": {
    lvl: 2,
    conc: ["tag-standard"],
    diff: "Safe-D-Lock pack of 10 vs Brady pack of 25; Brady has 10 designs x 3 materials x 3 reverse legends",
  },
  "LSP-KD+M": {
    lvl: 3,
    exact: ["SDPL-RED-38ST-KD", "SDAL-RED-38ST-KD"],
    diff: "Master-keyed padlock set (1 master per 5 locks): Brady offers master keying only as a custom quote, no catalogue SKU",
  },
  "V-PLSP-KD": {
    lvl: 2,
    exact: ["SDPL-RED-38ST-KD", "SDAL-RED-38ST-KD"],
    diff: "Red keyed-different padlock; body material (nylon / aluminium) of the Safe-D-Lock lock is not stated",
  },
  "V-NPL-KD": {
    lvl: 2,
    exact: ["SDPL-RED-38PL-KD"],
    diff: "Non-conductive padlock vs Brady nylon body + nylon shackle",
  },
  "V-PRS-3A": {
    lvl: 2,
    exact: ["SDPL-RED-38ST-KA6", "SDAL-RED-38ST-KA6"],
    diff: "Safe-D-Lock set of 3 same key vs Brady keyed-alike pack of 6",
  },
  "V-02-GVL": {
    lvl: 1,
    gate: "1–2.5 in.",
    diff: "Gate valve 1–2.5 in. (red is the same product; other colours are colour variants)",
  },
  "V-04-GVL": { lvl: 1, gate: "2.5–5 in.", diff: "Gate valve 2.5–5 in." },
  "V-06-GVL": { lvl: 1, gate: "5–6.5 in.", diff: "Gate valve 5–6.5 in." },
  "V-08-GVL": { lvl: 1, gate: "6.5–10 in.", diff: "Gate valve 6.5–10 in." },
  "V-10-GVL": { lvl: 1, gate: "10–13 in.", diff: "Gate valve 10–13 in." },
  "V-AGV": {
    lvl: 1,
    exact: ["64057"],
    diff: "Adjustable gate valve lockout 1–6.5 in.",
  },
  "V-BV 01": {
    lvl: 2,
    exact: ["65666", "65692", "BS07A-RD", "BS07A-YW", "BS07A-BU", "BS07A-GN"],
    diff: "Ball valve 3/8–1.5 in.: Brady covers 0.25–1 in. (one-piece) and 0.5–2.5 in. (4-legged); handle limits differ",
  },
  "V-BV 02": {
    lvl: 2,
    exact: ["65669", "65693", "BS07A-RD", "BS07A-YW", "BS07A-BU", "BS07A-GN"],
    diff: "Ball valve 1.5–2.5 in.: Brady covers 1.25–3 in. (one-piece) and 0.5–2.5 in. (4-legged)",
  },
  "V-BV 03": {
    lvl: 1,
    gate: "2–8 in.",
    gateConcept: "vlv-ball-4leg",
    diff: "Ball valve 2–8 in. = Brady 4-legged large (red is the same product; other colours are colour variants)",
  },
  "V-UVL": {
    lvl: 2,
    exact: ["51394", "51390", "51392", "51388", "50921"],
    diff: "Universal valve / cable lockout; Brady sells small / large, nylon / steel cable, and as parts",
  },
  "V-UML": {
    lvl: 2,
    exact: ["50941", "50943", "50944", "170378", "170377"],
    diff: "Universal multi cable lockout vs Brady all-purpose cable lockout (cable type / colour)",
  },
  "V-CL6": {
    lvl: 2,
    exact: ["65318", "45191", "45192", "CABLO"],
    diff: "Multipurpose cable lockout with 6 ft cable",
  },
  "V-BFV": {
    lvl: 2,
    exact: ["49303", "121504", "121505", "170220"],
    diff: "Butterfly valve lockout; Brady has small / large lever and pull-handle types",
  },
  "V-CLO-E": {
    lvl: 2,
    exact: ["65674", "65675", "PLO23"],
    diff: "Electrical plug lockout; Brady has 110 V small, 220/500 V large and 3-in-1",
  },
  "V-SPLO": {
    lvl: 2,
    exact: ["PLO27E", "65674", "64221"],
    diff: "Plug / pneumatic lockout, small",
  },
  "V-LPLO": {
    lvl: 2,
    exact: ["PLO27E", "65675"],
    diff: "Plug / pneumatic lockout, big",
  },
  "V-UBL-SN": {
    lvl: 2,
    exact: ["66321", "66320", "148702", "148697", "148695"],
    diff: "Universal breaker lockout with adjustable nut vs Brady universal multi-pole breaker lockout (single / 6 / 50)",
  },
  "CBL SET": {
    lvl: 3,
    exact: ["149514", "90844", "90847", "90850", "90853"],
    diff: "Set of 3 different miniature breaker lockouts: Brady sells them singly or in 6-packs, never as a mixed set",
  },
  "PIN IN CBL": {
    lvl: 2,
    exact: ["90847", "90848"],
    diff: "Pin-in miniature breaker lockout; Safe-D-Lock pack of 3 vs Brady 1 or 6",
  },
  "PIN OUT CBL": {
    lvl: 2,
    exact: ["90844", "90845"],
    diff: "Pin-out miniature breaker lockout; Safe-D-Lock pack of 3 vs Brady 1 or 6",
  },
  "V-LB12": {
    lvl: 2,
    exact: ["65329", "65321", "148692", "148691", "148685"],
    diff: "Large (oversized 480/600 V) breaker lockout",
  },
  "V-CBF-COMBO": {
    lvl: 3,
    exact: ["149514", "90844", "90847", "90850", "90853"],
    diff: "5-piece miniature breaker combo: no mixed combo in Brady",
  },
  "CS-CBF": {
    lvl: 2,
    exact: ["149514"],
    diff: "Single-size miniature breaker lockout vs Brady universal-fit",
  },
  "V-CIR-45": {
    lvl: 3,
    exact: ["130821", "139796", "PBL6", "PBL2"],
    diff: "Round 45 mm panel lockout: Brady covers stop at 30 mm",
  },
  "V-CIR-22": {
    lvl: 2,
    exact: ["PBL8", "130820", "139795"],
    diff: "Push button lockout 22 mm vs Brady IEC 22.5 mm",
  },
  "V-WSL": {
    lvl: 1,
    exact: ["65392"],
    diff: "Wall switch lockout (red); Brady also sells a 6-pack (65696)",
    also2: ["65696"],
  },
  "V-MPB": {
    lvl: 2,
    exact: ["PBL2", "PBL4", "104602", "104603"],
    diff: "Mushroom push button / emergency stop cover",
  },
  "V-RP15": {
    lvl: 3,
    near: ["plg-heavy", "plg-iec"],
    diff: "Pin & sleeve plug lockout (yellow): Brady has heavy-duty plug lockouts, not pin & sleeve specific",
  },
  "V-HPL": {
    lvl: 2,
    exact: ["150587", "151252"],
    diff: "Hoist controller lockout vs Brady pendant control safety cover (two sizes)",
  },
  "V-PS6": {
    lvl: 2,
    exact: ["50989"],
    diff: "6-lock padlock station; Brady is an acrylic board, material of Safe-D-Lock station not stated",
  },
  "V-PS12": {
    lvl: 2,
    exact: ["50990"],
    diff: "12-lock padlock station; Brady is an acrylic board",
  },
  "V-GB13": {
    lvl: 3,
    exact: ["65699", "45190", "65672", "65040", "51171"],
    diff: "Metal group lockout box for 13 locks: Brady boxes hold 40 / 75 locks",
  },
  "V-LSP-B": {
    lvl: 3,
    exact: ["105942", "105932", "50997", "170397"],
    diff: "PVC LOTO station: Brady stations are polypropylene (different sizes)",
  },
  "V-LSS16": {
    lvl: 1,
    exact: ["LC252M"],
    diff: "Steel lockout cabinet 16 x 14 x 6 in.",
  },
  "PVC-V-LS10": {
    lvl: 3,
    exact: ["170397"],
    diff: "PVC station, 5–10 locks, hinged cover vs Brady 12-lock station",
  },
  "PVC-V-LS20": {
    lvl: 3,
    exact: ["105932", "50991", "LC584E"],
    diff: "PVC station, 10–20 locks vs closest Brady stations / cabinet",
  },
  "V-VLK": {
    lvl: 2,
    exact: ["153671"],
    diff: "Valve lockout kit; contents differ (Brady: 3 aluminium padlocks, toolbox, gate / ball / cable / universal devices)",
  },
  "V-ELK": {
    lvl: 2,
    exact: ["153670", "153672"],
    diff: "Electrical lockout kit; contents differ",
  },
  "V-P2-R": {
    lvl: 2,
    exact: ["153669"],
    diff: "Personal electrical lockout pouch vs Brady breaker lockout pouch kit",
  },
};
// No entry for: V-CIR-55, V-SQS, V-SQB, V-RS14 - M, V-RS14 - B  → Safe-D-Lock only.

/** Where Safe-D-Lock-only (and level-3) models go: the new-catalog family, and whether that family is new. */
export const PLACEMENT = {
  "V-CIR-55": {
    cat: "Devices - Electrical",
    fam: "Panel Lockouts - Round & Square (new)",
    isNew: true,
  },
  "V-CIR-45": {
    cat: "Devices - Electrical",
    fam: "Panel Lockouts - Round & Square (new)",
    isNew: true,
  },
  "V-SQS": {
    cat: "Devices - Electrical",
    fam: "Panel Lockouts - Round & Square (new)",
    isNew: true,
  },
  "V-SQB": {
    cat: "Devices - Electrical",
    fam: "Panel Lockouts - Round & Square (new)",
    isNew: true,
  },
  "V-RS14 - M": {
    cat: "Devices - Plug & Vehicle",
    fam: "Pin & Sleeve Lockouts (new)",
    isNew: true,
  },
  "V-RS14 - B": {
    cat: "Devices - Plug & Vehicle",
    fam: "Pin & Sleeve Lockouts (new)",
    isNew: true,
  },
  "V-RP15": {
    cat: "Devices - Plug & Vehicle",
    fam: "Pin & Sleeve Lockouts (new)",
    isNew: true,
  },
  "CBL SET": {
    cat: "Devices - Electrical",
    fam: "Breaker Lockout Sets (new)",
    isNew: true,
  },
  "V-CBF-COMBO": {
    cat: "Devices - Electrical",
    fam: "Breaker Lockout Sets (new)",
    isNew: true,
  },
  "LSP-KD+M": {
    cat: "Lockout Padlocks",
    fam: "Safety Padlocks (Standard Body)",
    isNew: false,
  },
  "V-GB13": { cat: "Group Lockout", fam: "Group Lock Boxes", isNew: false },
  "V-LSP-B": {
    cat: "Kits & Stations",
    fam: "LOTO Stations, Boards & Padlock Stations",
    isNew: false,
  },
  "PVC-V-LS10": {
    cat: "Kits & Stations",
    fam: "LOTO Stations, Boards & Padlock Stations",
    isNew: false,
  },
  "PVC-V-LS20": {
    cat: "Kits & Stations",
    fam: "LOTO Stations, Boards & Padlock Stations",
    isNew: false,
  },
};

/** Brady SKUs referenced in kit contents / the compatibility guide, or sold by Handyman, that the catalogue tables do not list. */
export const EXTRA_BRADY = [
  {
    sku: "65396",
    cat: "Devices - Electrical",
    fam: "Circuit Breaker Lockouts",
    sub: "Clamp-on breaker lockout (kit component)",
    desc: "Clamp-On Circuit Breaker Lockout 120/277 V (referenced in kits and the breaker compatibility guide)",
    concept: "ele-clamp",
    dim: "120/277 V",
    ed: "Single",
  },
  {
    sku: "65397",
    cat: "Devices - Electrical",
    fam: "Circuit Breaker Lockouts",
    sub: "Clamp-on breaker lockout (kit component)",
    desc: "Clamp-On Circuit Breaker Lockout 480/600 V (referenced in kits and the breaker compatibility guide)",
    concept: "ele-clamp",
    dim: "480/600 V",
    ed: "Single",
  },
  {
    sku: "50921",
    cat: "Devices - Valve",
    fam: "Universal Valve Lockouts",
    sub: "Universal valve lockout with blocking arm (kit component)",
    desc: "Universal Valve Lockout with blocking arm (referenced in valve kits)",
    concept: "vlv-universal",
    dim: "Standard",
    ed: "Single",
  },
  {
    sku: "102723",
    cat: "Devices - Fuse & Terminal",
    fam: "Fuse & Terminal Lockouts",
    sub: "Fuse lockout (in Odoo only)",
    desc: "Small Fuse Lockout (listed in Odoo as Brady 102723; not in the catalogue PDF)",
    concept: "fus-lockout",
    dim: "Small",
    ed: "Single",
    odooOnly: true,
  },
  {
    sku: "102724",
    cat: "Devices - Fuse & Terminal",
    fam: "Fuse & Terminal Lockouts",
    sub: "Fuse lockout (in Odoo only)",
    desc: "Large Fuse Lockout, single (listed in Odoo as Brady 102724; not in the catalogue PDF)",
    concept: "fus-lockout",
    dim: "Large",
    ed: "Single",
    odooOnly: true,
  },
];

/** Brady SKUs already sold by Handyman in Odoo under the Brady number (from "Odoo-export Brady's products.xlsx"). */
export const ODOO_BRADY_REFS = [
  "153452",
  "65387",
  "65396",
  "65397",
  "102724",
  "50940",
  "65392",
  "102723",
  "66321",
  "65564",
];
export const ODOO_ALIAS = { 153452: "SDPL-RED-38ST-KD" }; // Odoo ref Brandy.153452 = this catalogue code
