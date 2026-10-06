// Generates src/data/{products,families,taxonomy,configurator}.json and src/data/labels-vi.js from data-source/loto.json.
// Usage: node scripts/build-loto-data.mjs [--dry-run]
// The generated files are never hand-edited (template §12); change the source (or the merge script) and re-run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'data-source/loto.json'), 'utf8'));
const dryRun = process.argv.includes('--dry-run');
const problems = [];

const concepts = new Map(source.concepts.map(concept => [concept.id, concept]));
const categories = new Map(source.categories.map(category => [category.id, category]));
const ids = new Set();
const labelsVi = new Map(); // English label -> Vietnamese, for sizes / editions shown through t()
const addLabel = ({ en, vi }) => {
  if (!en || !vi) problems.push(`missing label ${en}`);
  if (labelsVi.has(en) && labelsVi.get(en) !== vi) problems.push(`label "${en}" has two Vietnamese texts: "${labelsVi.get(en)}" / "${vi}"`);
  labelsVi.set(en, vi);
};
// Product photos: drop <id>.webp (or .jpg/.png) into src/assets/products/loto/items/ and re-run this script.
const itemsDir = path.join(root, 'src/assets/products/loto/items');
const imageFor = id => { const stem = id.replace(/[^A-Za-z0-9-]+/g, '_'); for (const ext of ['webp', 'jpg', 'png']) if (fs.existsSync(path.join(itemsDir, `${stem}.${ext}`))) return `./src/assets/products/loto/items/${stem}.${ext}`; return ''; };
const withFamily = (concept, fam, language) => fam.en === 'Standard' ? concept[language] : `${concept[language]}, ${fam[language]}`;

const products = source.products.map(item => {
  const concept = concepts.get(item.concept_id);
  const category = categories.get(concept.category_id);
  if (!concept || !category) { problems.push(`${item.id}: unknown concept`); return null; }
  if (ids.has(item.id)) problems.push(`${item.id}: duplicate id`);
  ids.add(item.id);
  if (!Number.isSafeInteger(item.price_vnd) || item.price_vnd <= 0) problems.push(`${item.id}: missing price`);
  for (const label of [item.fam, item.dim, item.ed]) addLabel(label);
  const nameEn = withFamily(concept, item.fam, 'en'), nameVi = withFamily(concept, item.fam, 'vi');
  return {
    id: item.id, barcode: item.id, internal_reference: item.id,
    product_family_id: item.family_id, customer_category_id: concept.category_id,
    display_name_en: nameEn, display_name_vi: nameVi,
    original_name_en: `${nameEn} ${item.dim.en}`, original_name_vi: `${nameVi} ${item.dim.vi}`,
    impa_code: null, issa_code: null, direction: '',
    size: item.dim.en, dimensions_display: item.dim.en, edition: item.ed.en,
    currency: 'VND', prices: { VND: item.price_vnd, USD: Math.round(item.price_vnd / source.usd_rate_vnd * 100) / 100 },
    price_estimate: item.price_estimate, unit: 'pcs', origin: '', image_url: imageFor(item.id),
  };
}).filter(Boolean);

const byFamily = new Map();
source.products.forEach((item, index) => { if (!byFamily.has(item.family_id)) byFamily.set(item.family_id, { item, skus: [] }); byFamily.get(item.family_id).skus.push(products[index].id); });
const families = [...byFamily.values()].map(({ item, skus }) => {
  const concept = concepts.get(item.concept_id);
  const first = products.find(product => product.id === skus[0]);
  return {
    id: item.family_id, product_family_id: item.family_id, customer_category_id: concept.category_id,
    display_name_en: withFamily(concept, item.fam, 'en'), display_name_vi: withFamily(concept, item.fam, 'vi'),
    design_en: item.fam.en, design_vi: item.fam.vi,
    impa_code: null, direction: '', dimensions_display: first.dimensions_display, sku_ids: skus, image_url: skus.map(id => products.find(product => product.id === id).image_url).find(Boolean) ?? '',
  };
});

const usedCategories = source.categories.filter(category => products.some(product => product.customer_category_id === category.id));
const taxonomy = {
  source: 'data-source/loto.json',
  groups: usedCategories.map((category, index) => ({
    id: category.id, label_en: category.en, label_vi: category.vi, order: index + 1,
    family_count: families.filter(family => family.customer_category_id === category.id).length,
    sku_count: products.filter(product => product.customer_category_id === category.id).length,
  })),
};

const configurator = {
  source: 'data-source/loto.json',
  branches: Object.fromEntries(usedCategories.map(category => [category.id, ['customer_category_id', 'config_concept', 'product_family_id', 'dimensions_display', 'edition']])),
  concepts: source.concepts.map(concept => {
    const familyIds = families.filter(family => family.id.startsWith(`${concept.id}:`)).map(family => family.id);
    const count = products.filter(product => familyIds.includes(product.product_family_id)).length;
    return {
      id: `${concept.category_id}:${concept.id}`, category_id: concept.category_id,
      label_en: concept.en, label_vi: concept.vi, labels_vi: [concept.vi],
      detail_en: `${familyIds.length > 1 ? `${familyIds.length} designs · ` : ''}${count} option${count === 1 ? '' : 's'}`,
      detail_vi: `${familyIds.length > 1 ? `${familyIds.length} kiểu · ` : ''}${count} lựa chọn`,
      family_ids: familyIds,
    };
  }),
  families: families.map(family => ({ product_family_id: family.id, config_concept: `${family.customer_category_id}:${family.id.split(':')[0]}`, config_direction: '' })),
  directions: [],
};

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
const out = {
  'products.json': JSON.stringify(products), 'families.json': JSON.stringify(families), 'taxonomy.json': JSON.stringify(taxonomy, null, 2),
  'configurator.json': JSON.stringify(configurator),
  'labels-vi.js': `// Generated by scripts/build-loto-data.mjs: Vietnamese for size / edition labels. Do not edit.\nexport default ${JSON.stringify(Object.fromEntries(labelsVi), null, 1)};\n`,
};
console.log(`products ${products.length} · families ${families.length} · concepts ${configurator.concepts.length} · categories ${taxonomy.groups.length} · labels ${labelsVi.size}`);
if (dryRun) process.exit(0);
for (const [name, body] of Object.entries(out)) fs.writeFileSync(path.join(root, 'src/data', name), body);
const gz = (await import('node:zlib')).gzipSync(Buffer.from(out['products.json'] + out['families.json'] + out['configurator.json'])).length;
console.log(`data written; products+families+configurator = ${Math.round(gz / 1024)} KB gzip (budget 400 KB)`);
