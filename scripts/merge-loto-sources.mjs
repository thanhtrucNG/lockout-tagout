// Merges Handyman's Odoo exports, the Handyman price-list PDF and the Brady-range catalogue extract into
// data-source/loto.json (one neutral Handyman product list). Usage: node scripts/merge-loto-sources.mjs
// Handyman products win over equivalent range items; producer names and part codes never leave data-source/raw.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, CONCEPTS, CONCEPT_BY_ID, CATEGORY_CODE } from './loto/concepts.mjs';
import { STD } from './loto/labels.mjs';
import { bradyItem, standardTags } from './loto/rules-brady.mjs';
import { odooItem, pdfItem, PDF_DUPLICATES, BRADY_DUPLICATES } from './loto/rules-handyman.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Source files stay outside this (publishable) project: the Brady-range extract holds producer names and part codes.
const rawDir = path.resolve(root, process.argv[2] ?? '../LOTO');
const raw = file => fs.readFileSync(path.join(rawDir, file), 'utf8').replace(/^﻿/, '');
const reportDir = path.join(rawDir, 'reports');
const USD_RATE_VND = 26000; // same placeholder rate as the Calibration Gas site

function parseCsv(text) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c; }
    else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); field = ''; if (row.length > 1 || row[0] !== '') rows.push(row); row = []; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

const report = [];
const log = (source, ref, result, detail = '') => report.push({ source, ref, result, detail });

// ---------- Handyman: Odoo ----------
const odooRows = parseCsv(raw('Odoo_all_merged.csv'));
const odooByRef = new Map();
for (const row of odooRows) { const ref = row['Internal Reference']; if (!odooByRef.has(ref)) odooByRef.set(ref, row); }
// Customer-visible product codes must not carry a producer name.
const publicId = ref => ({ '4400‐L': 'HM-4400-L', 'ELOCK-FA': 'HM-FA-01' })[ref] ?? ref.replace(/^SOFAMEL./, 'HM-').replace(/^Brandy./, 'HM-');
const items = []; // in priority order
const priceByRef = new Map(); // ref or PDF model -> VND, used as analogs
for (const [ref, row] of odooByRef) {
  const tuple = odooItem(ref);
  const price = Number(row['Sales Price']);
  if (!tuple) { log('odoo', ref, 'UNMAPPED', row.Name); continue; }
  if (!(price > 0)) { log('odoo', ref, 'NO PRICE', row.Name); continue; }
  priceByRef.set(ref, price / Math.max(tuple.qty, 1)); // per piece, so pack prices scale correctly
  items.push({ ...tuple, id: publicId(ref), iref: ref, source: 'odoo', price, basis: 'Odoo sales price' });
}

// ---------- Handyman: price-list PDF ----------
const pdfRows = parseCsv(raw('Handyman_vs_Brady_Comparison.csv'));
const ratios = [];
for (const row of pdfRows) {
  const odoo = PDF_DUPLICATES[row['Handyman Model']];
  if (odoo && odooByRef.has(odoo)) ratios.push(Number(odooByRef.get(odoo)['Sales Price']) / Number(row.Price));
}
ratios.sort((a, b) => a - b);
const ratio = ratios[Math.floor(ratios.length / 2)];
for (const row of pdfRows) {
  const model = row['Handyman Model'], usd = Number(row.Price);
  const duplicate = PDF_DUPLICATES[model];
  if (duplicate && priceByRef.has(duplicate)) { log('pdf', model, `DUPLICATE of ${duplicate}`, 'Odoo product kept'); continue; }
  const tuple = pdfItem(model, row['Handyman Description']);
  if (!tuple) { log('pdf', model, 'UNMAPPED', row['Handyman Description']); continue; }
  const price = Math.round(usd * ratio / 1000) * 1000;
  priceByRef.set(model, price / Math.max(tuple.qty, 1));
  items.push({ ...tuple, id: model, iref: model, source: 'pdf', price, basis: `Price list ${usd} (USD, assumed) × ${Math.round(ratio)} VND (median Odoo ÷ list ratio)`, estimate: true });
}

// ---------- Brady-range catalogue ----------
const brady = parseCsv(raw('Brady_Catalog_All_SKUs.csv')).map(r => ({ cat: r.Category, sub: r.Subcategory, sku: r['Brady SKU / Catalog #'], desc: r['Description / Notes'] }));
const tags = standardTags(brady);
const bradyItems = [];
for (const row of brady) {
  if (row.sub === 'Standard Lockout Tags') { bradyItems.push({ ...tags.get(row.sku), sku: row.sku, row }); continue; }
  if (row.sku === 'USSC2') { log('range', row.sku, 'SKIPPED', 'Heading row, not a product'); continue; }
  const tuple = bradyItem(row);
  if (!tuple) { log('range', row.sku, 'UNMAPPED', `${row.sub}: ${row.desc}`); continue; }
  if (tuple.skip) { log('range', row.sku, 'SKIPPED', tuple.skip); continue; }
  bradyItems.push({ ...tuple, sku: row.sku, row });
}
// Two rows in the catalogue extract were missed because their description sat on the next line.
for (const [sku, desc] of [['43753', 'Danger Confined Space Entry Can Be Fatal Follow All Confined Space Entry Procedures Sign 21" x 30"'], ['43760', 'Caution Confined Space Do Not Enter Without Obtaining Permit Sign 21" x 30"']]) {
  const row = { sub: 'Covers & Signs', sku, desc };
  bradyItems.push({ ...bradyItem(row), sku, row });
}

// ---------- dedupe ----------
const key = i => [i.concept, i.fam.en, i.dim.en, i.ed.en].join('|');
const seen = new Map();
const keep = [];
const claim = (i, ref, source) => {
  const k = key(i);
  if (seen.has(k)) return seen.get(k);
  seen.set(k, ref); return null;
};
for (const i of items) {
  const clash = claim(i, i.id, i.source);
  if (clash) { i.ed = { en: `${i.ed.en} (${i.id.replace('GS ', '')})`, vi: `${i.ed.vi} (${i.id.replace('GS ', '')})` }; log(i.source, i.id, 'LABEL CLASH', `renamed edition; same options as ${clash}`); seen.set(key(i), i.id); }
  keep.push(i);
}
const counters = new Map();
for (const b of bradyItems) {
  const concept = CONCEPT_BY_ID.get(b.concept);
  if (!concept) throw new Error(`Unknown concept ${b.concept} for ${b.sku}`);
  if (BRADY_DUPLICATES[b.sku]) { log('range', b.sku, `DUPLICATE of ${BRADY_DUPLICATES[b.sku]}`, 'Handyman product kept'); continue; }
  const clash = claim(b, b.sku, 'range');
  if (clash) { log('range', b.sku, `DUPLICATE of ${clash}`, `${b.concept} | ${b.fam.en} | ${b.dim.en} | ${b.ed.en}`); continue; }
  const code = CATEGORY_CODE.get(concept.category_id);
  const n = (counters.get(code) ?? 0) + 1; counters.set(code, n);
  keep.push({ ...b, id: `LOTO-${code}-${String(n).padStart(3, '0')}`, iref: b.sku, source: 'range' });
}

// ---------- pricing ----------
const median = values => { const s = [...values].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const numbers = text => (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
const SIZED = new Set(['vlv-gate', 'vlv-gate-collapsible', 'vlv-ball-std', 'vlv-ball-4leg', 'vlv-ball-perma', 'vlv-flange', 'vlv-plug', 'vlv-ball-tee']);
const priced = keep.filter(i => i.price);
for (const i of keep) {
  if (i.price) continue;
  const concept = CONCEPT_BY_ID.get(i.concept);
  const unitOf = p => p.price / Math.max(p.qty, 1);
  const sibling = SIZED.has(i.concept) && i.dim.en !== STD.en ? priced.find(p => p.concept === i.concept && p.dim.en === i.dim.en && p.source !== 'range') : null;
  let unit, basis;
  if (sibling) { unit = unitOf(sibling); basis = `Same size as ${sibling.id} (colour / pack variants priced alike)`; }
  else {
    const bases = concept.analog.map(ref => priceByRef.get(ref)).filter(Boolean);
    if (!bases.length) throw new Error(`No analog price for ${i.concept}`);
    unit = median(bases) * concept.factor * (/ties|fastener/i.test(i.fam.en) ? 0.1 : 1);
    basis = `Median of ${concept.analog.join(', ')} × ${concept.factor}`;
    if (SIZED.has(i.concept)) { const top = Math.max(...numbers(i.dim.en), 1); const f = Math.min(2.2, Math.max(0.7, (top / 6) ** 0.45)); unit *= f; basis += ` × size ${f.toFixed(2)}`; }
  }
  const bulk = i.qty >= 100 ? 0.5 : i.qty >= 25 ? 0.7 : i.qty >= 12 ? 0.85 : i.qty >= 5 ? 0.92 : 1;
  i.price = Math.max(1000, Math.round(unit * i.qty * bulk / 1000) * 1000);
  i.basis = basis + (i.qty > 1 ? ` × ${i.qty} pcs${bulk < 1 ? ` × bulk ${bulk}` : ''}` : '');
  i.estimate = true;
}

// ---------- output ----------
const famId = i => `${i.concept}:${i.fam.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'standard'}`;
const conceptOrder = new Map(CONCEPTS.map((c, index) => [c.id, index]));
const colourOrder = ['Red', 'Yellow', 'Green', 'Blue', 'Orange', 'Black', 'White', 'Brown', 'Purple', 'Silver', 'Gold', 'Transparent', '5-colour set'];
keep.sort((a, b) => conceptOrder.get(a.concept) - conceptOrder.get(b.concept)
  || (colourOrder.indexOf(a.fam.en) + 1 || 99) - (colourOrder.indexOf(b.fam.en) + 1 || 99) || (a.source === 'range') - (b.source === 'range')
  || a.fam.en.localeCompare(b.fam.en, 'en', { numeric: true }) || (numbers(a.dim.en)[0] ?? 0) - (numbers(b.dim.en)[0] ?? 0) || a.dim.en.localeCompare(b.dim.en, 'en', { numeric: true })
  || a.qty - b.qty || (/different/.test(b.ed.en) - /different/.test(a.ed.en)) || a.ed.en.localeCompare(b.ed.en, 'en', { numeric: true }));
const products = keep.map(i => ({
  id: i.id, source: i.source, concept_id: i.concept, family_id: famId(i), fam: i.fam, dim: i.dim, ed: i.ed, qty: i.qty,
  price_vnd: i.price, price_basis: i.basis, price_estimate: Boolean(i.estimate),
}));
const usedConcepts = CONCEPTS.filter(c => products.some(p => p.concept_id === c.id));
const output = {
  generated_by: 'scripts/merge-loto-sources.mjs', usd_rate_vnd: USD_RATE_VND, pdf_vnd_per_list_unit: Math.round(ratio),
  categories: CATEGORIES.map(([id, en, vi, code]) => ({ id, en, vi, code })),
  concepts: usedConcepts.map(({ id, category_id, en, vi }) => ({ id, category_id, en, vi })), products,
};
fs.writeFileSync(path.join(root, 'data-source/loto.json'), JSON.stringify(output, null, 1));
// Where every website SKU comes from (internal: holds catalogue numbers, used by scripts/odoo/make-import.mjs).
fs.writeFileSync(path.join(root, 'data-source/loto-refs.json'), JSON.stringify(Object.fromEntries(keep.map(i => [i.id, { source: i.source, iref: i.iref }])), null, 1));

const csv = rows => rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/price-estimates-loto.csv'), '﻿' + csv([
  ['ID', 'Category', 'Product type', 'Design / colour', 'Size / option', 'Edition / pack', 'List price VND', 'USD (÷26,000)', 'Basis', 'Confirmed price VND (fill in)'],
  ...products.filter(p => p.price_estimate).map(p => { const c = CONCEPT_BY_ID.get(p.concept_id); return [p.id, CATEGORIES.find(x => x[0] === c.category_id)[1], c.en, p.fam.en, p.dim.en, p.ed.en, p.price_vnd, (p.price_vnd / USD_RATE_VND).toFixed(2), p.price_basis, '']; }),
]));
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'merge-report-loto.csv'), '﻿' + csv([['Source', 'Reference', 'Result', 'Detail'], ...report.map(r => [r.source, r.ref, r.result, r.detail])]));

const bySource = products.reduce((m, p) => (m[p.source] = (m[p.source] ?? 0) + 1, m), {});
const results = report.reduce((m, r) => { const k = r.result.replace(/ of .*/, ''); m[k] = (m[k] ?? 0) + 1; return m; }, {});
console.log('products', products.length, bySource, 'estimates', products.filter(p => p.price_estimate).length, 'pdf ratio', Math.round(ratio));
console.log('report', results);
console.log('concepts used', usedConcepts.length, 'of', CONCEPTS.length, 'unused:', CONCEPTS.filter(c => !usedConcepts.includes(c)).map(c => c.id).join(', '));
for (const r of report.filter(r => /UNMAPPED|NO PRICE/.test(r.result))) console.log('!!', r.source, r.ref, r.result, r.detail);
