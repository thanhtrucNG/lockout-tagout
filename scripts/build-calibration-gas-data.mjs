// Generates src/data/{products,families,taxonomy,configurator}.json from data-source/calibration-gas.json.
// Usage: node scripts/build-calibration-gas-data.mjs [--dry-run]
// The generated files are never hand-edited (template §12); change the source file and re-run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'data-source/calibration-gas.json'), 'utf8'));
const dryRun = process.argv.includes('--dry-run');

const mixtures = new Map(source.mixtures.map(mixture => [mixture.id, mixture]));
const categories = new Map(source.categories.map(category => [category.id, category]));
const problems = [];
const seen = new Set();

const familyId = mixture => `CG-${mixture.id}`;
const conceptId = mixture => `${mixture.category_id}:${mixture.id}`;

const products = source.skus.map(sku => {
  const mixture = mixtures.get(sku.mixture_id);
  const cylinder = source.cylinders[sku.cylinder];
  const basis = source.bases[sku.basis];
  if (!mixture) problems.push(`${sku.reference}: unknown mixture ${sku.mixture_id}`);
  if (!cylinder) problems.push(`${sku.reference}: unknown cylinder ${sku.cylinder}`);
  if (!basis) problems.push(`${sku.reference}: unknown cylinder basis ${sku.basis}`);
  if (!Number.isSafeInteger(sku.price_vnd) || sku.price_vnd <= 0) problems.push(`${sku.reference}: missing VND price`);
  if (seen.has(sku.reference)) problems.push(`${sku.reference}: duplicate reference`);
  seen.add(sku.reference);
  if (!mixture || !cylinder || !basis) return null;
  const displayEn = `Calibration gas ${mixture.label_en}, balance N₂`;
  const displayVi = `Khí chuẩn ${mixture.label_vi}, nền N₂`;
  return {
    id: sku.reference,
    barcode: sku.reference,
    internal_reference: sku.reference,
    product_family_id: familyId(mixture),
    customer_category_id: mixture.category_id,
    display_name_en: displayEn,
    display_name_vi: displayVi,
    original_name_en: sku.original_name.replace(/\s+/g, ' '),
    original_name_vi: `${displayVi} ${cylinder.name_vi}`,
    composition_en: mixture.label_en,
    composition_vi: mixture.label_vi,
    cylinder_en: cylinder.name_en,
    cylinder_vi: cylinder.name_vi,
    impa_code: null,
    issa_code: null,
    direction: '',
    size: cylinder.size,
    dimensions_display: cylinder.size,
    edition: basis.label_en,
    currency: 'VND',
    prices: { VND: sku.price_vnd, USD: Math.round(sku.price_vnd / source.usd_rate_vnd) },
    price_usd_estimate: true,
    unit: 'cylinder',
    origin: '',
    image_url: source.image_url,
  };
}).filter(Boolean);

if (problems.length) {
  console.error('Not written:\n' + problems.map(problem => `  - ${problem}`).join('\n'));
  process.exit(1);
}

const families = source.mixtures.map(mixture => {
  const members = products.filter(product => product.product_family_id === familyId(mixture));
  return {
    id: familyId(mixture),
    product_family_id: familyId(mixture),
    customer_category_id: mixture.category_id,
    display_name_en: members[0].display_name_en,
    display_name_vi: members[0].display_name_vi,
    impa_code: null,
    direction: '',
    dimensions_display: members[0].dimensions_display,
    sku_ids: members.map(product => product.id),
    image_url: source.image_url,
  };
});

const taxonomy = {
  source: 'data-source/calibration-gas.json',
  groups: source.categories.map(category => ({
    id: category.id, label_en: category.label_en, label_vi: category.label_vi, order: category.order,
    family_count: families.filter(family => family.customer_category_id === category.id).length,
    sku_count: products.filter(product => product.customer_category_id === category.id).length,
  })),
};

const configurator = {
  source: 'data-source/calibration-gas.json',
  branches: Object.fromEntries([...categories.keys()].map(id => [id, ['customer_category_id', 'config_concept', 'dimensions_display', 'edition']])),
  concepts: source.mixtures.map(mixture => ({
    id: conceptId(mixture), category_id: mixture.category_id,
    label_en: mixture.label_en, label_vi: mixture.label_vi, labels_vi: [mixture.label_vi],
    detail_en: mixture.detail_en, detail_vi: mixture.detail_vi,
    family_ids: [familyId(mixture)],
  })),
  directions: [{ id: 'unspecified', label_en: 'Not applicable', label_vi: 'Không áp dụng' }],
  families: source.mixtures.map(mixture => ({ product_family_id: familyId(mixture), config_concept: conceptId(mixture), config_direction: 'unspecified' })),
};

const outputs = { 'products.json': products, 'families.json': families, 'taxonomy.json': taxonomy, 'configurator.json': configurator };
for (const [name, data] of Object.entries(outputs)) {
  const file = path.join(root, 'src/data', name);
  if (dryRun) console.log(`${name}: ${JSON.stringify(data).length} bytes`);
  else fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}
console.log(`${products.length} SKUs, ${families.length} mixtures, ${taxonomy.groups.length} categories${dryRun ? ' (dry run)' : ''}.`);
for (const product of products) console.log(`  ${product.id}  ${product.dimensions_display.padEnd(5)} ${String(product.prices.VND).padStart(9)} VND  US$${product.prices.USD} (ESTIMATE)`);
