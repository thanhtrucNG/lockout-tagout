// Reads LOTO_Odoo_Import.xlsx back and checks it against the template, the official categories and the source lists.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readXlsx, rowsToObjects } from './xlsx-read.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const downloads = path.resolve(root, '..');
const book = path.join(downloads, 'LOTO/LOTO_Odoo_Import.xlsx');
const sheet = n => readXlsx(book, { sheet: n });
const problems = [], info = [];
const check = (ok, msg) => { if (!ok) problems.push(msg); };

const importRows = sheet(1), headers = importRows[0], rows = rowsToObjects(importRows);
const templateHeaders = readXlsx(path.join(downloads, 'Product (product.template).xlsx'))[0];
check(JSON.stringify(headers) === JSON.stringify(['ID', ...templateHeaders]), `headers differ: ${headers}`);

const official = new Map(rowsToObjects(readXlsx(path.join(downloads, 'Official Product Category - DLV - Name to ID.xlsx'))).map(r => [r.ID, r.Name]));
const refs = JSON.parse(fs.readFileSync(path.join(root, 'data-source/loto-refs.json'), 'utf8'));
const loto = JSON.parse(fs.readFileSync(path.join(root, 'data-source/loto.json'), 'utf8'));
const summary = JSON.parse(fs.readFileSync(path.join(root, 'data-source/odoo-import-summary.json'), 'utf8'));

// blanks, uniqueness, categories
const seenRef = new Map(), seenPub = new Map(), seenId = new Map();
for (const [i, r] of rows.entries()) {
  const at = `row ${i + 2} (${r['Internal Reference']})`;
  for (const k of ['Name', 'Internal Reference', 'Public Reference', 'Product Category/ID', 'Producer']) check(r[k] !== '', `${at}: blank ${k}`);
  check(official.has(r['Product Category/ID']), `${at}: category ID not in the official file: ${r['Product Category/ID']}`);
  if (r['Sales Price'] !== '') check(/^\d+$/.test(r['Sales Price']), `${at}: price not an integer: ${r['Sales Price']}`);
  seenRef.set(r['Internal Reference'], (seenRef.get(r['Internal Reference']) ?? 0) + 1);
  seenPub.set(r['Public Reference'], (seenPub.get(r['Public Reference']) ?? 0) + 1);
  if (r.ID) seenId.set(r.ID, (seenId.get(r.ID) ?? 0) + 1);
}
const dupRef = [...seenRef].filter(([, n]) => n > 1), dupPub = [...seenPub].filter(([, n]) => n > 1), dupId = [...seenId].filter(([, n]) => n > 1);
check(!dupRef.length, `duplicate Internal Reference: ${dupRef.map(d => d[0])}`);
check(!dupPub.length, `duplicate Public Reference: ${dupPub.map(d => d[0])}`);
check(!dupId.length, `duplicate ID: ${dupId.map(d => d[0])}`);

// new rows: price blank, public ref above the category maximum, name pattern, producer / origin
const newRows = rows.filter(r => r.ID);
info.push(`rows ${rows.length}: ${newRows.length} new (with generated ID), ${rows.length - newRows.length} existing (ID empty)`);
check(newRows.every(r => r['Sales Price'] === ''), 'a new SKU has a price');
check(newRows.every(r => r.Producer === 'Handyman' && r.Origin === 'China'), 'new SKU producer/origin differ');
const perCat = new Map();
for (const r of newRows) {
  const parts = r['Public Reference'].split('.'), prefix = parts.slice(0, -1).join('.'), seq = Number(parts.at(-1));
  check(seq > (summary.startSeq[prefix] ?? 0), `${r['Internal Reference']}: public ref ${r['Public Reference']} not above existing max ${summary.startSeq[prefix] ?? 0}`);
  const o = perCat.get(prefix) ?? []; o.push(seq); perCat.set(prefix, o);
  check(official.get(r['Product Category/ID'])?.startsWith(prefix + ' '), `${r['Internal Reference']}: category ${official.get(r['Product Category/ID'])} vs public ref ${prefix}`);
}
for (const [prefix, list] of perCat) { const s = [...list].sort((a, b) => a - b); check(s.every((v, i) => v === (summary.startSeq[prefix] ?? 0) + i + 1), `${prefix}: running numbers not consecutive`); info.push(`${prefix}: ${list.length} new, ${(summary.startSeq[prefix] ?? 0) + 1}..${(summary.startSeq[prefix] ?? 0) + list.length}`); }

// every website SKU is covered: by its own row, by an existing row, or listed on the cross-reference sheet
const cross = rowsToObjects(sheet(3));
const crossIds = new Set(cross.map(r => r['Website / PDF code']));
const missingSite = loto.products.filter(p => !crossIds.has(p.id)).map(p => p.id);
check(!missingSite.length, `website SKUs missing from the cross-reference: ${missingSite.slice(0, 8)}`);
check(cross.length === loto.products.length, `cross-reference rows ${cross.length} vs website SKUs ${loto.products.length}`);
const importRefs = new Set(rows.map(r => r['Internal Reference']));
for (const r of cross) check(importRefs.has(r['Internal Reference']), `cross-reference ref not in Import: ${r['Internal Reference']}`);
// Brady catalogue lines: in the Import by number, or absorbed
const bradyCsv = fs.readFileSync(path.join(downloads, 'LOTO/Brady_Catalog_All_SKUs.csv'), 'utf8').replace(/^﻿/, '').split(/\r?\n/).slice(1).filter(Boolean).map(l => l.match(/"((?:[^"]|"")*)"/g).map(x => x.slice(1, -1))[2]);
const notes = rowsToObjects(sheet(4)); const noteText = JSON.stringify(notes);
const lost = [...new Set(bradyCsv)].filter(sku => !importRefs.has(sku) && !noteText.includes(`"${sku}"`));
check(lost.length === 0, `Brady catalogue numbers neither imported nor listed: ${lost.slice(0, 12)}`);

// the 11 template rows
const template = rowsToObjects(readXlsx(path.join(downloads, 'Product (product.template).xlsx')));
for (const t of template) {
  const want = t['Internal Reference'] === 'Brandy.153452' ? 'SDPL-RED-38ST-KD' : t['Internal Reference'];
  const got = rows.find(r => r['Internal Reference'] === want);
  check(got && got.Name === t.Name && String(got['Sales Price']) === String(t['Sales Price']) && got['Public Reference'] === t['Public Reference'], `template row ${t['Internal Reference']} not reproduced (${got?.Name})`);
  if (got) check(!/^32\.5/.test(official.get(got['Product Category/ID']) ?? ''), `template row ${want} still in a 32.5 category`);
}
console.log(info.join('\n'));
console.log(problems.length ? `PROBLEMS (${problems.length}):\n` + problems.slice(0, 40).join('\n') : 'ALL CHECKS PASSED');
process.exitCode = problems.length ? 1 : 0;
