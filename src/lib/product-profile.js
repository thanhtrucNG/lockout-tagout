import { language, t } from './locale.js';

// Product-specific facts for this landing page. Shared components read these instead of hard-coding a brand.
// The catalogue PDF follows the page language (template §8): -en.pdf or -vi.pdf, built by ../lockout-tagout-catalogue.
// Set catalogueURL to null to hide the CATALOGUE / DOWNLOAD links again.
export const productProfile = Object.freeze({
  brand: 'LOCKOUT TAGOUT',
  catalogueURL: `assets/lockout-tagout-catalogue-${language}.pdf`,
  catalogueFile: `Handyman-Lockout-Tagout-Catalogue-${language}.pdf`,
  heroPhoto: './src/assets/products/loto/hero.webp',
  featureVisual: './src/assets/products/loto/feature-visual.webp',
});

/** Size / option line shown under a product name, e.g. "2.5–5 in." */
// Empty for the silent "Standard" size, so no meaningless line is shown.
export const productSpec = product => product.dimensions_display === 'Standard' ? '' : t(product.dimensions_display);

/** Product code line, e.g. "Product code GS GVL-04". */
export const productCode = product => `${t('Product code')} ${product.barcode}`;
