// Builds ../LOTO/LOTO_Odoo_Import.xlsx: every LOTO SKU (website list + existing Odoo items) in the Odoo product.template import layout.
// Usage: node scripts/odoo/make-import.mjs [--ids <Odoo export xlsx/csv with "External ID" + "Internal Reference">]
// Internal tool: holds Brady catalogue numbers. Do not publish.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readXlsx, rowsToObjects } from './xlsx-read.mjs';
import { writeXlsx } from '../catalog/xlsx.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const downloads = path.resolve(root, '..');
const loto = path.join(downloads, 'LOTO');
const TEMPLATE = path.join(downloads, 'Product (product.template).xlsx');
const OFFICIAL = path.join(downloads, 'Official Product Category - DLV - Name to ID.xlsx');
const idsArg = process.argv.includes('--ids') ? process.argv[process.argv.indexOf('--ids') + 1] : null;
const clean = s => String(s ?? '').replace(/\s+/g, ' ').trim();

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
  const [h, ...b] = rows; return b.map(r => Object.fromEntries(h.map((k, i) => [k, r[i] ?? ''])));
}
const readCsv = file => parseCsv(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));

// ---------- official categories ----------
const official = rowsToObjects(readXlsx(OFFICIAL));
const byCode = new Map(), byName = new Map(), byId = new Map();
for (const r of official) {
  const m = r.Name.match(/^([\d.]+)\s+(.*)$/);
  byId.set(r.ID, r.Name);
  if (!m) continue;
  const [, code, name] = m;
  if (code.startsWith('23.') || code === '23') { byCode.set(code, { id: r.ID, name: r.Name }); if (code.startsWith('23.7.4')) byName.set(name, code); }
}
const CAT = code => { const c = byCode.get(code); if (!c) throw new Error(`Official category ${code} not found`); return { code, ...c }; };

// ---------- product type -> official category code ----------
const T = (code, ...types) => types.map(t => [t, code]);
const TYPE_CATEGORY = new Map([
  ...T('23.7.4.8', 'pad-nylon-steel', 'pad-nylon-nylon', 'pad-alu', 'pad-compact-nylon', 'pad-compact-alu', 'pad-jacket', 'pad-cable'),
  ...T('23.7.4.4', 'pad-labels', 'kit-tag-holder', 'cab-parts', 'vlv-universal-parts', 'vlv-ball-arm', 'ele-cleats', 'ele-ez-rail', 'plg-steering'),
  ...T('23.7.4.3', 'grp-permit', 'grp-box-ultra', 'grp-box-lock', 'grp-box-key', 'grp-box-portable', 'grp-box-storage', 'grp-box-slim'),
  ...T('23.7.4.7', 'grp-hasp', 'grp-hasp-labeled'),
  ...T('23.7.4.11', 'kit-loto'),
  ...T('23.7.4.5', 'kit-station-filled', 'kit-station-padlock', 'kit-station-lockout', 'kit-storage-cabinet', 'kit-storage-box', 'kit-carrier', 'kit-storage-module'),
  ...T('23.7.4.6', 'kit-storage-bag'),
  ...T('23.7.4.1', 'cab-handyman', 'cab-allpurpose', 'cab-mini', 'cab-economy', 'cab-spin'),
  ...T('23.7.4.12', 'vlv-gate', 'vlv-gate-adj', 'vlv-gate-collapsible', 'vlv-ball-tee', 'vlv-ball-std', 'vlv-ball', 'vlv-ball-4leg', 'vlv-ball-perma', 'vlv-nohandle', 'vlv-universal', 'vlv-flange', 'vlv-plug', 'vlv-butterfly', 'vlv-combo'),
  ...T('23.7.4.10', 'vlv-cylinder', 'sga-pneumatic', 'sga-gas-cap', 'sga-regulator', 'sga-cylinder', 'plg-gladhand'),
  ...T('23.7.4.2', 'ele-panel-cable', 'ele-clamp', 'ele-oversized', 'ele-snap120', 'ele-multipole', 'ele-holed', 'ele-low', 'ele-ez-clamp', 'ele-ez-snap', 'ele-blocker', 'ele-mcb', 'ele-breaker-hm', 'ele-breaker-set', 'ele-panel', 'ele-fire',
    'sga-pendant', 'sga-pb-base', 'sga-pb-cover', 'sga-wall-switch', 'fus-lockout', 'fus-blockout', 'fus-universal', 'fus-block',
    'plg-forklift', 'plg-ev', 'plg-batterycable', 'plg-iec', 'plg-heavy', 'plg-electrical', 'plg-3in1', 'plg-elec-pneu', 'plg-pinsleeve', 'plg-powercord'),
  ...T('23.2.8', 'csp-cover-elastic', 'csp-cover-magnetic'), ...T('23.7.8.5', 'csp-sign'),
  ...T('23.7.4.9', 'tag-standard', 'tag-handyman', 'tag-custom', 'tag-hasp', 'tag-energy', 'tag-photo', 'tag-padlock', 'tag-mini', 'tag-twopart', 'tag-legend', 'tag-specialty'),
]);

// ---------- existing Odoo items ----------
const existing = new Map(); // Internal Reference (as in Odoo today) -> row
for (const r of readCsv(path.join(loto, 'Odoo_all_merged.csv'))) {
  const ref = clean(r['Internal Reference']); if (!ref || existing.has(ref)) continue;
  const segment = clean((r['Website Product Category'] ?? '').split(' / ').pop());
  existing.set(ref, { oldRef: ref, name: clean(r.Name), pub: clean(r['Public Reference']), price: Number(r['Sales Price']) || '', producer: clean(r.Producer), origin: clean(r.Origin), oldCategory: segment, catCode: byName.get(segment) ?? (segment.startsWith('Lockout\\Tagout Tags') ? '23.7.4' : null), from: 'Odoo export' });
}
const template = rowsToObjects(readXlsx(TEMPLATE));
const TEMPLATE_HEADERS = readXlsx(TEMPLATE)[0];
for (const r of template) {
  const ref = clean(r['Internal Reference']);
  const old = byId.get(clean(r['Product Category/ID'])) ?? clean(r['Product Category/ID']);
  const row = { oldRef: ref, name: clean(r.Name), pub: clean(r['Public Reference']), price: Number(r['Sales Price']) || '', producer: clean(r.Producer), origin: clean(r.Origin), oldCategory: old, catCode: (old.match(/^([\d.]+)\s/) ?? [])[1] ?? null, origCatId: clean(r['Product Category/ID']), from: 'Product (product.template).xlsx' };
  if (!existing.has(ref) || ref === 'Brandy.153452') existing.set(ref, row);   // the template carries the category ID
}
// v2: the per-branch exports in Downloads/23.7.4 are the current Odoo state and win over the older exports.
const BRANCH_DIR = path.join(downloads, '23.7.4');
for (const f of fs.readdirSync(BRANCH_DIR).filter(f => /\.xlsx$/i.test(f) && !f.startsWith('.'))) {
  for (const r of rowsToObjects(readXlsx(path.join(BRANCH_DIR, f)))) {
    const ref = clean(r['Internal Reference']); if (!ref) continue;
    const catId = clean(r['Product Category/ID']), catName = byId.get(catId) ?? catId;
    existing.set(ref, { oldRef: ref, name: clean(r.Name), pub: clean(r['Public Reference']), price: Number(r['Sales Price']) || '', producer: clean(r.Producer), origin: clean(r.Origin), oldCategory: catName, catCode: (catName.match(/^([\d.]+)\s/) ?? [])[1] ?? null, origCatId: catId, from: `23.7.4/${f}` });
  }
}
// Catalogue code for existing items; categories are corrected only for rows that are not in the branch folder.
const NEW_REF = { 'Brandy.153452': 'SDPL-RED-38ST-KD' };
const CATEGORY_FIX = { 65396: '23.7.4.2', 65397: '23.7.4.2', 66321: '23.7.4.2', 65392: '23.7.4.2', 102723: '23.7.4.2', 102724: '23.7.4.2', 50940: '23.7.4.1', 'HANDYMAN.65564': '23.7.4.12', 65564: '23.7.4.12', 65387: '23.7.4.2', 'Brandy.153452': '23.7.4.8', '4400‐L': '23.7.4.5', 'ELOCK-FA': '23.7.4.2' };
const existingRows = [];
for (const [oldRef, e] of existing) {
  const fixed = undefined; // v2: existing products keep category, name, price and Public Reference; only the Internal Reference changes
  const code = fixed ?? e.catCode ?? '23.7.4';
  const cat = e.origCatId ? { id: e.origCatId, name: e.oldCategory } : CAT(code);
  existingRows.push({ ...e, ref: NEW_REF[oldRef] ?? oldRef, catCode: code, catId: cat.id, catName: cat.name, categoryChanged: Boolean(fixed) && fixed !== e.catCode, refChanged: Boolean(NEW_REF[oldRef]) });
}
const takenRefs = new Set(existingRows.map(r => r.ref));

// ---------- running numbers per category ----------
const maxSeq = new Map();
for (const r of existingRows) {
  const parts = r.pub.split('.'); if (parts.length < 2 || !/^\d+$/.test(parts.at(-1))) continue;
  const prefix = parts.slice(0, -1).join('.'); maxSeq.set(prefix, Math.max(maxSeq.get(prefix) ?? 0, Number(parts.at(-1))));
}
maxSeq.set('23.2.8', 105); // user: 23.2.8 continues from 23.2.8.106
const startSeq = new Map(maxSeq);

// ---------- new rows from the website list ----------
const lotoData = JSON.parse(fs.readFileSync(path.join(root, 'data-source/loto.json'), 'utf8'));
const refs = JSON.parse(fs.readFileSync(path.join(root, 'data-source/loto-refs.json'), 'utf8'));
const site = new Map(JSON.parse(fs.readFileSync(path.join(root, 'src/data/products.json'), 'utf8')).map(p => [p.id, p]));
const newRows = [], crossRef = [], notes = [];
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const usedIds = new Set(), usedNames = new Set();
// v2: new Brady-range SKUs take the catalogue description (brand-free) so the name keeps its detail; the number stays in Internal Reference only.
const bradyDesc = new Map(readCsv(path.join(loto, 'Brady_Catalog_All_SKUs.csv')).map(r => [clean(r['Brady SKU / Catalog #']), clean(r['Description / Notes'])]));
for (const p of lotoData.products) {
  const meta = refs[p.id]; const iref = meta.iref; const s = site.get(p.id);
  const cat = TYPE_CATEGORY.get(p.concept_id);
  if (!cat) throw new Error(`No category for type ${p.concept_id}`);
  if (meta.source === 'odoo') {
    const match = existingRows.find(r => r.oldRef === iref);
    if (!match) notes.push(['MISSING', `${p.id}: Odoo reference ${iref} not found in the existing Odoo files`]);
    crossRef.push([match?.ref ?? iref, p.id, 'Existing Odoo item', '', 'Yes', match?.catName ?? '', match?.pub ?? '', '']);
    continue;
  }
  if (takenRefs.has(iref)) {
    const match = existingRows.find(r => r.ref === iref);
    crossRef.push([iref, p.id, meta.source === 'range' ? 'Brady-range SKU' : 'Price-list SKU', meta.source === 'range' ? iref : '', 'Yes (existing row used)', match.catName, match.pub, '']);
    continue;
  }
  takenRefs.add(iref);
  const c = CAT(cat);
  const seq = (maxSeq.get(cat) ?? 0) + 1; maxSeq.set(cat, seq);
  const dim = s.dimensions_display !== 'Standard' ? `, ${s.dimensions_display}` : '';
  const pack = s.edition !== 'Single' ? `, ${s.edition}` : '';
  const desc = meta.source === 'range' ? bradyDesc.get(iref) : null;
  const head = s.display_name_en.split(',')[0].replace(/\s*\(.*?\)/g, '').trim(), key = head.split(' ').pop().toLowerCase().replace(/s$/, '');
  const cleanDesc = desc ? desc.replace(/\s*\(ref \d+\)/gi, '').replace(/\s*\bB-\d{3,4}\b/g, '').replace(/\s+-?\s*(\d+)$/, ', $1/pk').replace(/\s+/g, ' ').trim() : null; // drop "(ref 123)" / part codes; trailing bare number = pack quantity
  let name = cleanDesc ? ((cleanDesc.toLowerCase().includes(key) || (/^confined space/i.test(head) && /confined space/i.test(cleanDesc))) ? `Handyman ${cleanDesc}` : `Handyman ${head}, ${cleanDesc}`) : `Handyman ${s.display_name_en}${dim}${pack}`;
  if (usedNames.has(name)) name += `${dim}${pack}` || ` (${iref})`;
  usedNames.add(name);
  let id = `loto.${slug(iref)}`; for (let k = 2; usedIds.has(id); k++) id = `loto.${slug(iref)}_${k}`; usedIds.add(id);
  const row = { id, name, ref: iref, pub: `${cat}.${seq}`, price: '', producer: 'Handyman', origin: 'China', catId: c.id, catName: c.name, catCode: cat, siteId: p.id, source: meta.source };
  newRows.push(row);
  crossRef.push([iref, p.id, meta.source === 'range' ? 'Brady-range SKU' : 'Price-list SKU', meta.source === 'range' ? iref : '', 'No (new)', c.name, row.pub, '']);
}

// Brady catalogue lines the website merged into a Handyman product (they have no row of their own).
const mergeReport = readCsv(path.join(loto, 'reports/merge-report-loto.csv'));
const absorbed = mergeReport.filter(r => r.Source === 'range' && r.Result.startsWith('DUPLICATE')).map(r => [r.Reference, r.Result.replace('DUPLICATE of ', ''), r.Detail]);
const skipped = mergeReport.filter(r => r.Result === 'SKIPPED' || r.Result === 'UNMAPPED').map(r => [r.Reference, r.Result, r.Detail]);

// ---------- optional: external IDs of existing items from a fresh Odoo export ----------
const externalIds = new Map();
if (idsArg) {
  const rows = /\.csv$/i.test(idsArg) ? readCsv(idsArg) : rowsToObjects(readXlsx(idsArg));
  for (const r of rows) { const ref = clean(r['Internal Reference']); const id = clean(r['External ID'] ?? r.ID); if (ref && id) externalIds.set(ref, id); }
}
for (const r of existingRows) r.id = externalIds.get(r.oldRef) ?? externalIds.get(r.ref) ?? '';

// ---------- assemble ----------
const siteRefSet = new Set(Object.values(refs).map(x => x.iref));
const inCatalogue = existingRows.filter(r => siteRefSet.has(r.ref) || siteRefSet.has(r.oldRef) || r.from.startsWith('Product (product.template)'));
const notInCatalogue = existingRows.filter(r => !inCatalogue.includes(r));
const all = [...inCatalogue.map(r => ({ ...r, kind: 'existing' })), ...newRows.map(r => ({ ...r, kind: 'new' }))];
const codeNum = r => r.catCode.split('.').map(n => String(n).padStart(3, '0')).join('.');
all.sort((a, b) => codeNum(a).localeCompare(codeNum(b)) || (Number(a.pub.split('.').at(-1)) || 0) - (Number(b.pub.split('.').at(-1)) || 0) || a.ref.localeCompare(b.ref, 'en', { numeric: true }));
const importHeaders = idsArg ? ['ID', ...TEMPLATE_HEADERS] : [...TEMPLATE_HEADERS];
const importRows = all.map(r => [...(idsArg ? [r.id ?? ''] : []), r.name, r.ref, r.pub, typeof r.price === 'number' ? r.price : '', r.producer, r.origin, r.catId]);
const existingSheet = inCatalogue.map(r => [r.oldRef, r.ref, r.name, r.pub, r.price === '' ? '' : r.price, r.producer, r.origin, r.oldCategory, r.catName, r.catId, [r.oldRef !== r.ref ? 'Internal Reference updated to the catalogue code' : 'Internal Reference already the catalogue code', r.categoryChanged ? 'Category corrected' : '', r.pubChanged ? `Public Reference changed from ${r.pubOld} (five-number rule)` : '', /^32\.5/.test(r.pub) ? 'Public Reference still uses a 32.5.x number (kept)' : ''].filter(Boolean).join('; '), r.from]);
const leftOut = notInCatalogue.map(r => [r.oldRef, r.name, r.pub, r.price === '' ? '' : r.price, r.catName, r.from]);
const counts = { total: all.length, existing: inCatalogue.length, notInCatalogue: notInCatalogue.length, new: newRows.length, site: lotoData.products.length };
const catCounts = [...new Map(all.map(r => [r.catId, 0])).keys()].map(id => [byId.get(id), all.filter(r => r.catId === id).length]).sort();
const dups = [...all.reduce((m, r) => m.set(r.ref, (m.get(r.ref) ?? 0) + 1), new Map())].filter(([, n]) => n > 1);
const noteRows = [
  ['Rows in the Import sheet', counts.total, `${counts.existing} existing Odoo items + ${counts.new} new SKUs`],
  ['Website SKUs (landing page / PDF)', counts.site, `${refsOdooCount()} are existing Handyman Odoo items, ${counts.site - newRows.length - refsOdooCount()} already exist in Odoo under their Brady number, ${newRows.length} are new rows (see the Cross-reference sheet)`],
  ['Sales Price filled', importRows.filter(r => r[4] !== '').length, 'Existing Odoo items only (their current price, VND). New SKUs: blank'],
  ['Existing items left out of the Import sheet', notInCatalogue.length, 'Odoo items in the 23.7.4 folder that are not in the catalogue / website list (DAIHATSU parts, key cabinets, Sofamel, Klaxon, ...): nothing to change, listed on the sheet "Odoo items not in catalogue". Their Public References still count for the next-number rule'],
  ['Matching existing rows on import', '', 'The file has the 7 template columns only, as asked. Odoo matches an existing product only through an External ID ("id" column): without it, rows with an existing Internal Reference are created again. Send an export with "External ID" and run this builder with --ids <file> to add the ID column'],
  ['Brady catalogue lines merged into another row', absorbed.length, 'Listed below: no row of their own, covered by the Handyman / existing item named'],
  ['Duplicate Internal Reference (flagged)', dups.length, dups.map(([r, n]) => `${r} x${n}`).join('; ') || 'none'],
  ...notes,
  ['Possible duplicate product in Odoo', 2, '65564 and HANDYMAN.65564 are the same Brady XL gate valve lockout (red, 10-13 in.) at two prices (2,179,000 and 1,740,000 VND); both kept as they are in Odoo'],
  ['Category corrected on existing items', existingRows.filter(r => r.categoryChanged).length, 'Brady-numbered items that sat under 32.5.x Marine Engines, the wall case 4400-L (SCBA accessories) and the fire alarm kit ELOCK-FA (Fire detection) moved to Lockout categories. Their Public Reference was left unchanged'],
  ['Existing items filed under the parent 23.7.4', existingRows.filter(r => r.catCode === '23.7.4').length, 'Cable lockouts, tags etc. that Odoo files directly under Lockout/Tagout Tags & Devices; left as they are (new cable SKUs use 23.7.4.1 Cable Lockouts)'],
  ['Catalogue number printed twice', 1, '105673 (CP-5 x25 imported; G-5 x5 not imported because the catalogue gives it the same number: please confirm the real one)'],
  ['', '', ''], ['Rows per category', '', ''], ...catCounts.map(([n, c]) => [n, c, '']),
  ['', '', ''], ['Brady catalogue lines absorbed (Brady number, absorbed by, detail)', '', ''], ...absorbed.map(a => [a[0], a[1], a[2]]),
  ['', '', ''], ['Catalogue lines not imported', '', ''], ...skipped.map(a => [a[0], a[1], a[2]]),
  ['', '', ''], ['Rules', '', ''],
  ['Internal Reference', '', 'Brady-range SKU = Brady catalogue number; price-list SKU = its model code (V-..., CBL SET...); existing Handyman Odoo item = its Odoo reference; Brandy.153452 -> SDPL-RED-38ST-KD'],
  ['Public Reference', '', 'Category code + running number, continuing after the biggest number in that category (existing items keep theirs)'],
  ['Product Category/ID', '', 'Official ID from "Official Product Category - DLV - Name to ID.xlsx"'],
  ['Name / Producer / Origin', '', 'New: "Handyman <product> Brady <number>" (price-list SKUs without "Brady"), Producer Handyman, Origin China. Existing: as in Odoo'],
];
function refsOdooCount() { return lotoData.products.filter(p => refs[p.id].source === 'odoo').length; }
const sheets = [
  { name: 'Import', headers: importHeaders, rows: importRows, widths: [80, 24, 18, 12, 14, 12, 44] },
  { name: 'Odoo items not in catalogue', headers: ['Internal Reference', 'Name', 'Public Reference', 'Sales Price', 'Category', 'Source file'], rows: leftOut, widths: [24, 80, 18, 12, 44, 26] },
  { name: 'Existing in Odoo', headers: ['Internal Reference (now)', 'Internal Reference (import)', 'Name', 'Public Reference', 'Sales Price', 'Producer', 'Origin', 'Category now', 'Category (import)', 'Product Category/ID', 'Change', 'Source'], rows: existingSheet, widths: [24, 24, 70, 18, 12, 14, 12, 44, 44, 44, 50, 26] },
  { name: 'Cross-reference', headers: ['Internal Reference', 'Website / PDF code', 'Origin of the SKU', 'Brady catalogue number', 'In Odoo already', 'Category', 'Public Reference', 'Note'], rows: crossRef, widths: [24, 18, 22, 22, 22, 40, 18, 30] },
  { name: 'Notes', headers: ['Item', 'Count / value', 'Detail'], rows: noteRows, widths: [60, 16, 120] },
];
const out = path.join(loto, 'LOTO_Odoo_Import_v2.xlsx');
writeXlsx(out, sheets);
console.log('wrote', out); console.log(counts, 'duplicates', dups, 'notes', notes);
console.log('first new public refs per category:', [...startSeq.keys()].length, 'categories had existing numbers; new categories start at 1');
fs.writeFileSync(path.join(root, 'data-source/odoo-import-summary-v2.json'), JSON.stringify({ counts, startSeq: Object.fromEntries(startSeq), endSeq: Object.fromEntries(maxSeq) }, null, 1));
