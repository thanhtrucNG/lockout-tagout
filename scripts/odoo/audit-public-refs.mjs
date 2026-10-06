// Lists every SKU whose Public Reference looks wrong: in LOTO_Odoo_Import_v2.xlsx (Import + "Odoo items not in catalogue" sheets).
// Output: ../LOTO/LOTO_Public_Reference_Issues.xlsx   (internal tool: holds Brady numbers, do not publish)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readXlsx, rowsToObjects } from './xlsx-read.mjs';
import { writeXlsx } from '../catalog/xlsx.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const downloads = path.resolve(root, '..');
const book = path.join(downloads, 'LOTO/LOTO_Odoo_Import_v2.xlsx');
const official = new Map(rowsToObjects(readXlsx(path.join(downloads, 'Official Product Category - DLV - Name to ID.xlsx'))).map(r => [r.ID, r.Name]));
const codeOfCat = id => (official.get(id)?.match(/^([\d.]+)\s/) ?? [])[1] ?? '';
const importRows = rowsToObjects(readXlsx(book, { sheet: 1 }));
const leftOut = rowsToObjects(readXlsx(book, { sheet: 2 }));          // not in catalogue: Internal Reference | Name | Public Reference | Sales Price | Category | Source file
const cross = rowsToObjects(readXlsx(book, { sheet: 4 }));
const siteByRef = new Map(cross.map(r => [r['Internal Reference'], r['Website / PDF code']]));
const lotoData = JSON.parse(fs.readFileSync(path.join(root, 'data-source/loto.json'), 'utf8'));
const typeOfSite = new Map(lotoData.products.map(p => [p.id, p.concept_id]));
// expected branch per product type = TYPE_CATEGORY of the builder
const src = fs.readFileSync(path.join(root, 'scripts/odoo/make-import-v2.mjs'), 'utf8');
const mapSrc = src.slice(src.indexOf('const TYPE_CATEGORY = new Map(['), src.indexOf(']);', src.indexOf('const TYPE_CATEGORY = new Map([')) + 3);
const TYPE_CATEGORY = new Function(`const T = (code, ...types) => types.map(t => [t, code]); ${mapSrc}; return TYPE_CATEGORY;`)();

const NOT_LOTO = /daihatsu|klaxon|jobird|phc\.|chemical storage refrigerator|medical trolley|lucky ?line|outboard engine lock|lifejacket|immersion suit|fire hose|fire fighting|breathing apparatus|zener|galvanic|ELOCK/i;
const pubCount = new Map(); for (const r of [...importRows, ...leftOut]) pubCount.set(r['Public Reference'], (pubCount.get(r['Public Reference']) ?? 0) + 1);

const out = [];
const check = (r, where, catId, catName, ref, name) => {
  const pub = r['Public Reference'], parts = pub.split('.'), prefix = parts.slice(0, -1).join('.'), cat = catId ? codeOfCat(catId) : '';
  const issues = [], advice = [];
  if (parts.length !== 5) { issues.push(`${parts.length} numbers instead of 5`); }
  if (cat && prefix !== cat) { issues.push(`prefix ${prefix} does not match its category ${cat}`); }
  if (pubCount.get(pub) > 1) issues.push('Public Reference used more than once');
  const site = siteByRef.get(ref), wanted = site ? TYPE_CATEGORY.get(typeOfSite.get(site)) : null;
  if (wanted && cat && wanted !== cat && !(wanted === '23.7.4.1' && cat === '23.7.4')) { issues.push(`product type belongs in ${wanted}, filed under ${cat}`); advice.push(`move to ${wanted}`); }
  if (wanted === '23.7.4.1' && cat === '23.7.4') { issues.push('cable lockout filed directly under the parent 23.7.4'); advice.push('move to 23.7.4.1 Cable Lockouts'); }
  if (NOT_LOTO.test(`${ref} ${name}`)) { issues.push('not a lockout product but sits in a lockout branch'); advice.push('move to its own branch (marine / fire / medical / spare parts)'); }
  if (/^32\.5|^23\.9|^23\.5\.8/.test(pub)) advice.push('renumber inside the correct 23.7.4.x branch');
  if (issues.length) out.push([ref, name, pub, catName, where, issues.join('; '), advice.join('; ') || 'renumber to <branch>.<n> (five numbers)']);
};
for (const r of importRows) { const catId = r['Product Category/ID']; check(r, 'Import sheet', catId, official.get(catId) ?? catId, r['Internal Reference'], r.Name); }
for (const r of leftOut) {
  const name = r.Name, catName = r.Category, catId = [...official].find(([, n]) => n === catName)?.[0];
  check(r, 'Odoo item not in catalogue', catId, catName, r['Internal Reference'], name);
}
out.sort((a, b) => a[2].localeCompare(b[2], 'en', { numeric: true }));
const summary = [];
const bump = k => { const row = summary.find(s => s[0] === k); row ? row[1]++ : summary.push([k, 1]); };
for (const r of out) for (const i of r[5].split('; ')) bump(i.replace(/\d+\.[\d.]*\d/g, 'X').replace(/^\d numbers/, 'N numbers'));
writeXlsx(path.join(downloads, 'LOTO/LOTO_Public_Reference_Issues.xlsx'), [
  { name: 'SKUs to fix', headers: ['Internal Reference', 'Name', 'Public Reference now', 'Category now', 'Where', 'Problem', 'Suggested fix'], rows: out, widths: [22, 70, 20, 44, 26, 70, 52] },
  { name: 'Summary', headers: ['Problem', 'SKUs'], rows: [['SKUs checked', importRows.length + leftOut.length], ['SKUs with a problem', out.length], ...summary], widths: [70, 12] },
]);
console.log('checked', importRows.length + leftOut.length, 'flagged', out.length); console.log(summary.map(s => s.join(': ')).join('\n'));
