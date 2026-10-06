// Builds ../LOTO/Handyman_Catalog_Brady_vs_SafeDLock.xlsx: every Brady SKU, graded against the Safe-D-Lock price list,
// with Odoo cross-references and the effect of the Safe-D-Lock-only models on the catalogue categories.
// Usage: node scripts/catalog/make-catalog.mjs [sourceDir=../LOTO]   (internal tool: contains producer names, do not publish)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bradyItem, standardTags } from '../loto/rules-brady.mjs';
import { odooItem } from '../loto/rules-handyman.mjs';
import { CONCEPT_BY_ID } from '../loto/concepts.mjs';
import { LINKS, PLACEMENT, EXTRA_BRADY, ODOO_BRADY_REFS, ODOO_ALIAS } from './overlap-map.mjs';
import { writeXlsx } from './xlsx.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = path.resolve(root, process.argv[2] ?? '../LOTO');
const read = file => fs.readFileSync(path.join(src, file), 'utf8').replace(/^﻿/, '');
function parseCsv(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c; }
    else if (c === '"') quoted = true; else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); field = ''; if (row.length > 1 || row[0] !== '') rows.push(row); row = []; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

// ---- families (same grouping as LOTO_Full_Catalog.xlsx) ----
const FAMILY = [
  [/^Padlock Labels/, 'Padlock Labels'], [/Standard Body/, 'Safety Padlocks (Standard Body)'], [/Compact Body/, 'Compact & Cable Padlocks'],
  [/^Permit/, 'Permit Control Stations'], [/Group Lock Box|Lock Storage \/ Group|Metal Group|Metal Wall|SlimView/, 'Group Lock Boxes'], [/Hasps/, 'Group Lockout Hasps'],
  [/^Lockout Tagout Kits/, 'LOTO Kits'], [/\(filled\)/, 'Filled Stations (Board / Cabinet)'], [/^Lockout & Padlock Storage/, 'Storage (Bags, Boxes, Cabinets)'], [/^Unfilled/, 'LOTO Stations, Boards & Padlock Stations'],
  [/Panel Cable|Breaker Blocker|EZ Paneloc/, 'Panel & Switch Lockouts'], [/BatteryBlock|EV Charging|Gladhand|Steering/, 'Vehicle & Battery Lockouts'],
  [/Cable Lockout|Spin Lockout/, 'Cable Lockouts'], [/Gate Valve/, 'Gate Valve Lockouts'], [/Ball Valve/, 'Ball Valve Lockouts'], [/Butterfly/, 'Butterfly Valve Lockouts'], [/Universal Valve/, 'Universal Valve Lockouts'],
  [/Plug Valve|Blind Flange|No-Handle/, 'Other Valve Lockouts'], [/Panel Cable|Breaker Blocker|EZ Paneloc/, 'Panel & Switch Lockouts'], [/^Miniature/, 'Miniature Circuit Breaker Lockouts'],
  [/Breaker|TAGLOCK|Cleats/, 'Circuit Breaker Lockouts'], [/Pendant|Push Button|Wall Switch/, 'Push Button, E-Stop, Pendant & Wall Switch Covers'], [/Pneumatic Quick|Gas Cylinder|Regulator/, 'Pneumatic, Gas Cylinder & Regulator Lockouts'],
  [/^Fuse|Universal Fuse/, 'Fuse & Terminal Lockouts'], [/Plug|Plugout|IEC/, 'Plug Lockouts'], [/BatteryBlock|EV Charging|Gladhand|Steering/, 'Vehicle & Battery Lockouts'],
  [/^Covers & Signs/, 'Confined Space Covers & Signs'], [/^Standard Lockout Tags/, 'Standard Lockout Tags'], [/^Padlock Tags/, 'Padlock & Hasp Tags'], [/Tags|Tag/, 'Specialized & Energy Source Tags'],
];
const familyOf = sub => FAMILY.find(([re]) => re.test(sub))?.[1] ?? 'UNMAPPED';

// ---- load ----
const brady = parseCsv(read('Brady_Catalog_All_SKUs.csv')).map(r => ({ cat: r['Brady Category'], sub: r.Subcategory, sku: r['Brady SKU / Catalog #'], desc: r['Description / Notes'] }));
const sdl = parseCsv(read('Handyman_vs_Brady_Comparison.csv'));
const odooBrady = parseCsv(read('reports/odoo_brady_products.csv'));
const odooAll = parseCsv(read('Odoo_all_merged.csv'));
const tags = standardTags(brady);

const items = []; // one per Brady SKU line
const seenSku = new Set();
for (const row of brady) {
  if (row.sku === 'USSC2') continue; // heading row
  if (seenSku.has(row.sku + '|' + row.sub)) continue;
  let tuple = row.sub === 'Standard Lockout Tags' ? tags.get(row.sku) : bradyItem(row);
  if (tuple?.skip) tuple = { concept: null, fam: { en: '' }, dim: { en: '' }, ed: { en: '' }, qty: 1, skipped: tuple.skip };
  if (!tuple) tuple = { concept: null, fam: { en: '' }, dim: { en: '' }, ed: { en: '' }, qty: 1 };
  seenSku.add(row.sku + '|' + row.sub);
  items.push({ sku: row.sku, cat: row.cat, family: familyOf(row.sub), sub: row.sub, desc: row.desc, tuple, extra: false });
}
for (const e of EXTRA_BRADY) items.push({ sku: e.sku, cat: e.cat, family: e.fam, sub: e.sub, desc: e.desc, tuple: { concept: e.concept, fam: { en: 'Standard' }, dim: { en: e.dim }, ed: { en: e.ed }, qty: 1 }, extra: true, odooOnly: e.odooOnly });
const CAT_NAME = { 'Lockout Padlocks': 'Lockout Padlocks' };

// ---- link table → per SKU matches ----
const skuIndex = new Map(); // sku -> items (a SKU can appear twice, e.g. 177595)
for (const it of items) { if (!skuIndex.has(it.sku)) skuIndex.set(it.sku, []); skuIndex.get(it.sku).push(it); }
const conceptItems = new Map();
for (const it of items) if (it.tuple.concept) { if (!conceptItems.has(it.tuple.concept)) conceptItems.set(it.tuple.concept, []); conceptItems.get(it.tuple.concept).push(it); }
for (const it of items) it.matches = [];
const link = (it, model, level, why) => { const have = it.matches.find(m => m.model === model); if (have) { have.level = Math.min(have.level, level); return; } it.matches.push({ model, level, why }); };
const unknownSkus = [];
for (const [model, def] of Object.entries(LINKS)) {
  for (const sku of def.exact ?? []) { const list = skuIndex.get(sku); if (!list) { unknownSkus.push(`${model}: ${sku}`); continue; } list.forEach(it => link(it, model, def.lvl, def.diff)); }
  for (const sku of def.also2 ?? []) skuIndex.get(sku)?.forEach(it => link(it, model, 2, 'Pack variant of the same product'));
  for (const c of def.conc ?? []) (conceptItems.get(c) ?? []).forEach(it => link(it, model, Math.max(def.lvl, 2), def.diff));
  for (const c of def.near ?? []) (conceptItems.get(c) ?? []).forEach(it => link(it, model, 3, def.diff));
  if (def.gate) {
    const concept = def.gateConcept ?? 'vlv-gate';
    for (const it of conceptItems.get(concept) ?? []) {
      const sameSize = it.tuple.dim.en === def.gate || (concept === 'vlv-ball-4leg' && it.tuple.dim.en.startsWith('Large') && def.gate === '2–8 in.');
      if (sameSize) link(it, model, /^Red$/.test(it.tuple.fam.en) ? 1 : 2, /^Red$/.test(it.tuple.fam.en) ? def.diff : 'Same size, other colour');
    }
  }
}
// ---- grade: only lines at level 1 may be merged ----
for (const it of items) { it.matches.sort((a, b) => a.level - b.level || a.model.localeCompare(b.model)); it.level = it.matches[0]?.level ?? 0; }

// ---- Odoo ----
const odooByRef = new Map(odooBrady.map(r => [r['Internal Reference'], r]));
const odooHandyman = new Map(); // concept -> refs (GS / Handyman-own items, excluding Brady-numbered ones)
const odooSeen = new Set();
for (const r of odooAll) {
  const ref = r['Internal Reference']; if (odooSeen.has(ref)) continue; odooSeen.add(ref);
  const t = odooItem(ref); if (!t) continue;
  if (!odooHandyman.has(t.concept)) odooHandyman.set(t.concept, []);
  odooHandyman.get(t.concept).push({ ref, price: Number(r['Sales Price']) });
}
const odooBradyList = odooBrady.map(r => ({ ref: r['Internal Reference'], name: r.Name, price: Number(r['Sales Price']), producer: r.Producer }));
for (const it of items) {
  const refs = odooBradyList.filter(o => o.ref === it.sku || o.ref === `Brandy.${it.sku}` || o.ref === `HANDYMAN.${it.sku}` || ODOO_ALIAS[o.ref.replace(/^Brandy\./, '')] === it.sku);
  it.odoo = refs;
}
const missingOdoo = ODOO_BRADY_REFS.filter(ref => !items.some(it => it.odoo.some(o => o.ref.replace(/^(Brandy|HANDYMAN)\./, '') === ref)));

// ---- text ----
const LEVEL = { 1: '1 Same product', 2: '2 Equivalent', 3: '3 Comparable', 0: '– Brady only' };
const sdlPrice = new Map(sdl.map(r => [r['Handyman Model'], Number(r.Price)]));
const handling = it => {
  const best = it.matches[0];
  const od = it.odoo.length ? ` Already sold in Odoo as Brady ${it.sku} (${it.odoo.map(o => `${o.ref} ${o.price.toLocaleString('en-US')} VND`).join('; ')}): use the Odoo product.` : '';
  if (it.skipped) return `Not a stock item: ${it.skipped}.`;
  if (!best) return `Brady-only line: keep as its own catalogue line.${od}`;
  const models = it.matches.filter(m => m.level === best.level).map(m => m.model).join(', ');
  if (best.level === 1) return `MERGE into one line with Safe-D-Lock ${models}: the Safe-D-Lock model is the sellable item, the Brady SKU stays as cross-reference.${od}`;
  if (best.level === 2) return `KEEP the Brady line and LINK Safe-D-Lock ${models} as the equivalent. Do not merge (differs: ${best.why}).${od}`;
  return `KEEP the Brady line; Safe-D-Lock ${models} is comparable only (${best.why}).${od}`;
};
const clip = (list, n = 6) => list.length > n ? `${list.slice(0, n).join(', ')} … (+${list.length - n})` : list.join(', ');

// ---- sheets ----
const catOrder = ['Lockout Padlocks', 'Group Lockout', 'Kits & Stations', 'Devices - Cable', 'Devices - Valve', 'Devices - Electrical', 'Devices - Covers & Gas/Air', 'Devices - Fuse & Terminal', 'Devices - Plug & Vehicle', 'Confined Space Covers', 'Lockout Tags'];
items.sort((a, b) => catOrder.indexOf(a.cat) - catOrder.indexOf(b.cat));
const catalogRows = items.map(it => {
  const concept = it.tuple.concept ? CONCEPT_BY_ID.get(it.tuple.concept) : null;
  const best = it.matches[0];
  const same = it.matches.filter(m => m.level === it.level);
  const odooHm = concept ? (odooHandyman.get(it.tuple.concept) ?? []).map(o => o.ref) : [];
  return [
    it.cat, it.family, it.sub, it.sku, it.desc, concept?.en ?? '', [it.tuple.fam.en !== 'Standard' ? it.tuple.fam.en : '', it.tuple.dim.en !== 'Standard' ? it.tuple.dim.en : '', it.tuple.ed.en].filter(Boolean).join(' · '),
    LEVEL[it.level], same.map(m => m.model).join(', '), same.length ? sdlPrice.get(same[0].model) : '', best?.why ?? '',
    it.odoo.length ? it.odoo.map(o => o.ref).join(', ') : '', it.odoo.length ? it.odoo[0].price : '', clip(odooHm), handling(it),
    it.extra ? (it.odooOnly ? 'In Odoo only (not in catalogue PDF)' : 'Referenced in kit contents') : '',
  ];
});

const sdlRows = sdl.map(r => {
  const model = r['Handyman Model'], def = LINKS[model];
  const matched = items.filter(it => it.matches.some(m => m.model === model));
  const levels = [...new Set(matched.map(it => it.matches.find(m => m.model === model).level))].sort();
  const lvl = def?.lvl ?? 0;
  const place = PLACEMENT[model];
  const effect = lvl === 1 ? 'None: merged into the Brady family' : lvl === 2 ? 'None: linked to the Brady family' : place ? (place.isNew ? `NEW family: ${place.fam}` : `Added as its own line in ${place.fam}`) : 'Added as its own line';
  const modeFam = list => { const c = {}; list.forEach(x => c[x] = (c[x] ?? 0) + 1); return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0]; };
  const fam = (lvl >= 3 || !lvl) && place ? place.fam : modeFam(matched.map(it => it.family)) ?? place?.fam ?? '';
  return [model, r['Handyman Description'], Number(r.Price), r['Handyman Category'], lvl ? LEVEL[lvl] : '– Safe-D-Lock only', matched.length, clip(matched.map(it => it.sku), 10), def?.diff ?? r.Notes ?? 'No Brady equivalent', fam, effect, def?.unverified ? 'Brady family not labelled in catalogue text: confirm' : ''];
});

// category impact
const famRows = []; const famKeys = new Set(items.map(it => it.cat + '|' + it.family));
for (const key of famKeys) {
  const [cat, fam] = key.split('|');
  const its = items.filter(it => it.cat === cat && it.family === fam);
  const count = l => its.filter(it => it.level === l).length;
  const models = new Set(its.flatMap(it => it.matches.map(m => m.model)));
  const addedHere = Object.entries(PLACEMENT).filter(([, p]) => !p.isNew && p.fam === fam).map(([m]) => m);
  famRows.push([cat, fam, its.length, count(1), count(2), count(3), count(0), clip([...models], 12), clip(addedHere, 6), 'Existing Brady family']);
}
const newFams = new Map();
for (const [model, p] of Object.entries(PLACEMENT)) if (p.isNew) { const k = p.cat + '|' + p.fam; if (!newFams.has(k)) newFams.set(k, []); newFams.get(k).push(model); }
for (const [k, models] of newFams) { const [cat, fam] = k.split('|'); famRows.push([cat, fam, 0, 0, 0, 0, 0, '', clip(models), 'NEW family created by Safe-D-Lock-only models']); }
famRows.sort((a, b) => catOrder.indexOf(a[0]) - catOrder.indexOf(b[0]) || a[1].localeCompare(b[1]));

// Handyman (Odoo) product types and where they sit in the catalogue. null family = no Brady counterpart.
const ODOO_TYPES = {
  'ball valve lockout': ['Ball Valve Lockouts', 'equivalent'], 'ele-breaker-hm': ['Circuit Breaker Lockouts', 'equivalent'], 'cab-handyman': ['Cable Lockouts', 'equivalent'],
  'tag-handyman': ['Standard Lockout Tags', 'equivalent'], 'vlv-ball': ['Ball Valve Lockouts', 'equivalent'], 'pad-cable': ['Compact & Cable Padlocks', 'comparable (Brady cable-shackle padlocks, 200 / 400 mm)'],
  'pad-jacket': ['Safety Padlocks (Standard Body)', 'comparable (insulated jacket padlocks; Brady has none)'], 'grp-box-key': ['Group Lock Boxes', 'comparable (key boxes of 4 / 8 / 24 keys)'],
  'sga-cylinder': ['Pneumatic, Gas Cylinder & Regulator Lockouts', 'comparable (cylinder lockouts)'], 'tag-hasp': ['Padlock & Hasp Tags', 'comparable'], 'tag-custom': ['Specialized & Energy Source Tags', 'comparable (customised tags)'],
  'plg-powercord': ['Plug Lockouts', 'comparable (computer power cord lockout)'], 'ele-panel': ['Panel Lockouts - Round & Square (new)', 'NEW family (shared with the Safe-D-Lock round / square models)'],
  'ele-breaker-set': ['Breaker Lockout Sets (new)', 'NEW family (shared with the Safe-D-Lock breaker sets)'],
  'vlv-ball-arm': [null, 'NEW: Valve Lockout Sets & Accessories (arm for settable ball valve lockout)'], 'vlv-combo': [null, 'NEW: Valve Lockout Sets & Accessories (cable + butterfly set)'],
  'vlv-cylinder': [null, 'NEW: Valve Lockout Sets & Accessories (gate valve cylinder lockout)'], 'ele-fire': [null, 'NEW family: Fire Alarm Circuit Lockout (Electrical)'],
};
const odooOnlyRows = [];
for (const [concept, list] of odooHandyman) {
  const c = CONCEPT_BY_ID.get(concept); let m = ODOO_TYPES[concept];
  if (!m && conceptItems.has(concept)) { const fams = {}; conceptItems.get(concept).forEach(i => fams[i.family] = (fams[i.family] ?? 0) + 1); m = [Object.entries(fams).sort((a, b) => b[1] - a[1])[0][0], 'equivalent']; }
  if (!m) { console.log('Odoo type not mapped:', concept); continue; }
  odooOnlyRows.push([c?.en ?? concept, list.length, clip(list.map(o => o.ref), 8), m[0] ?? '(none)', m[1], m[1].startsWith('NEW') ? 'Changes categories' : m[1] === 'equivalent' ? 'Linked to the Brady family' : 'Own line next to the Brady family']);
}
odooOnlyRows.sort((a, b) => b[5].localeCompare(a[5]) || a[0].localeCompare(b[0]));

const odooRows = odooBradyList.map(o => {
  const key = o.ref.replace(/^(Brandy|HANDYMAN)\./, '');
  const it = items.find(i => i.sku === key || ODOO_ALIAS[key] === i.sku);
  return [o.ref, o.name, o.producer, o.price, it?.sku ?? '', it?.desc ?? 'Not in the catalogue PDF tables', it ? LEVEL[it.level] : '', it?.matches.map(m => m.model).join(', ') ?? ''];
});

const count = l => items.filter(it => it.level === l).length;
const summary = [
  ['Brady SKU lines in catalogue (incl. 5 kit-component / Odoo-only SKUs)', items.length, 'Every Brady line is kept. The catalogue PDF tables give 728 rows; 3 SKUs referenced in kits and 2 Brady SKUs sold only in Odoo were added.'],
  ['Level 1: same product as a Safe-D-Lock model', count(1), 'MERGE: one catalogue line; the Safe-D-Lock model is the sellable item, the Brady SKU is a cross-reference.'],
  ['Level 2: equivalent (same type, differs in size / pack / colour / material)', count(2), 'KEEP the Brady line and LINK the Safe-D-Lock model. Never merge: the item differs.'],
  ['Level 3: comparable (same job, different design)', count(3), 'KEEP the Brady line; the Safe-D-Lock model is shown as comparable only.'],
  ['Brady only (no Safe-D-Lock equivalent)', count(0), 'Own line, no link.'],
  ['Safe-D-Lock models', sdl.length, `${sdl.filter(r => LINKS[r['Handyman Model']]?.lvl === 1).length} level 1, ${sdl.filter(r => LINKS[r['Handyman Model']]?.lvl === 2).length} level 2, ${sdl.filter(r => LINKS[r['Handyman Model']]?.lvl === 3).length} level 3, ${sdl.filter(r => !LINKS[r['Handyman Model']]).length} Safe-D-Lock only.`],
  ['Safe-D-Lock models added as their own catalogue lines (level 3 + only)', sdl.filter(r => !LINKS[r['Handyman Model']] || LINKS[r['Handyman Model']].lvl === 3).length, 'These change the catalogue: 3 new families (round / square panel lockouts, pin & sleeve lockouts, breaker lockout sets) holding 9 models, plus 5 models added as their own lines inside existing families.'],
  ['Brady SKUs already sold in Odoo under the Brady number', new Set(odooBradyList.map(o => o.ref.replace(/^(Brandy|HANDYMAN)./, ''))).size, `Sheet "Odoo Brady SKUs" (${odooBradyList.length} Odoo rows; 65564 is listed twice at different prices). ${odooBradyList.filter(o => o.producer === 'Handyman').length} rows have producer "Handyman" (Handyman-made items carrying the Brady number).`],
  ['Handyman (Odoo) product types that change the categories', odooOnlyRows.filter(r => r[5] === 'Changes categories').length, 'Sheet "Handyman Odoo types": 2 shared with the Safe-D-Lock-only families, plus Valve Lockout Sets & Accessories and Fire Alarm Circuit Lockout.'],
];
const rules = [
  ['Level 1 Same product', 'Identical type AND size / spec (e.g. gate valve 2.5–5 in. red). One catalogue line.', 'Merge. Sellable = Safe-D-Lock model + its price. Brady SKU kept as cross-reference. Other colours of the same size are level 2.'],
  ['Level 2 Equivalent', 'Same type but at least one stated difference: pack size (3 vs 6), colour, material, shackle, size range, kit contents.', 'Keep both identities. Brady line stays; Safe-D-Lock model is linked as the equivalent. Prices are not copied across.'],
  ['Level 3 Comparable', 'Same job, different design or capacity (e.g. 13-lock box vs 40-lock box).', 'Keep the Brady line. The Safe-D-Lock model becomes its own line next to it.'],
  ['– Brady only / Safe-D-Lock only', 'No counterpart.', 'Own line. A Safe-D-Lock-only model that fits no Brady family creates a NEW family.'],
  ['Odoo', 'Brady SKUs already in Odoo are used as they are (Odoo price, VND).', 'Where a Brady SKU is in Odoo AND has a Safe-D-Lock match, both are shown.'],
  ['Unverified', 'Some links rest on names only (hasp families are not labelled in the catalogue text; V-02-GVL colour, Brady hasp lines).', 'Marked in "Safe-D-Lock models" column K.'],
];

const sheets = [
  { name: 'Summary', headers: ['Item', 'Count', 'Note'], rows: summary, widths: [64, 10, 110] },
  { name: 'Overlap rules', headers: ['Level', 'Definition', 'What the catalogue does'], rows: rules, widths: [26, 80, 90] },
  { name: 'Catalog (all Brady SKUs)', headers: ['Category', 'Product family', 'Brady sub-category', 'Brady SKU', 'Brady description', 'Product type', 'Design · size · pack', 'Overlap with Safe-D-Lock', 'Safe-D-Lock model(s)', 'Safe-D-Lock price (USD, assumed)', 'What differs', 'In Odoo as (Brady number)', 'Odoo price VND', 'Handyman (Odoo) items of the same type', 'Catalog handling', 'Note'], rows: catalogRows, widths: [24, 36, 34, 18, 60, 34, 36, 20, 24, 14, 60, 18, 14, 36, 90, 30] },
  { name: 'Safe-D-Lock models', headers: ['Model', 'Description', 'Price (USD, assumed)', 'Safe-D-Lock category', 'Overlap level', 'Brady SKUs matched', 'Brady SKUs', 'What differs', 'Catalog family', 'Effect on categories', 'Check'], rows: sdlRows, widths: [16, 50, 12, 24, 20, 12, 40, 70, 38, 44, 34] },
  { name: 'Category impact', headers: ['Category', 'Family', 'Brady SKU lines', 'Level 1', 'Level 2', 'Level 3', 'Brady only', 'Safe-D-Lock models linked', 'Safe-D-Lock models added as own lines', 'Status'], rows: famRows, widths: [24, 50, 12, 9, 9, 9, 11, 50, 40, 40] },
  { name: 'Odoo Brady SKUs', headers: ['Odoo ref', 'Odoo name', 'Producer', 'Price VND', 'Catalogue SKU', 'Catalogue description', 'Overlap with Safe-D-Lock', 'Safe-D-Lock model(s)'], rows: odooRows, widths: [20, 70, 14, 14, 20, 60, 20, 24] },
  { name: 'Handyman Odoo types', headers: ['Odoo product type', 'Odoo items', 'Odoo refs', 'Brady family', 'Relation to Brady', 'Effect'], rows: odooOnlyRows, widths: [44, 11, 60, 44, 60, 30] },
];
const out = path.join(src, 'Handyman_Catalog_Brady_vs_SafeDLock.xlsx');
writeXlsx(out, sheets);
console.log('wrote', out);
console.log({ lines: items.length, L1: count(1), L2: count(2), L3: count(3), none: count(0), unknownSkus, missingOdoo, unmapped: items.filter(i => i.family === 'UNMAPPED').length, noConcept: items.filter(i => !i.tuple.concept && !i.skipped).map(i => i.sku) });
