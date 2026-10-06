import { element, productImage } from '../lib/dom.js';
import { t } from '../lib/locale.js';
import { productProfile } from '../lib/product-profile.js';

// Feature section (template §1.1): eyebrow, H2 (≤ 6 words), intro (≤ 30 words), exactly 4 cards, catalogue link.
const FEATURE_CARDS = [
  { icon: 'lock', title: 'Complete range', body: 'Padlocks, devices, stations and tags in one place.' },
  { icon: 'group', title: 'Group lockout', body: 'Hasps and boxes let many workers lock one point.' },
  { icon: 'valve', title: 'Fits every isolation point', body: 'Valve, breaker, plug and cable devices in many sizes.' },
  { icon: 'tag', title: 'Clear identification', body: 'Tags, labels and stations keep every lockout visible.' },
];

const ICON_PATHS = {
  lock: '<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3M12 15v2"/>',
  group: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2A4.6 4.6 0 0 1 21 18.5"/>',
  valve: '<path d="M9 4h6M12 4v4"/><rect x="8.5" y="8" width="7" height="5" rx="1"/><path d="M3 11.5h5.5M15.5 11.5H21M3 9v5M21 9v5M12 13v3"/><circle cx="12" cy="18" r="2"/>',
  tag: '<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
};

function createFeatureIcon(name) {
  const wrapper = element('span', 'sign-construction-feature-icon');
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`;
  return wrapper;
}

function createFeatureCard(feature) {
  const card = element('article', 'sign-construction-feature');
  const copy = element('div', 'sign-construction-feature-copy');
  copy.append(element('h3', '', t(feature.title)), element('p', '', t(feature.body)));
  card.append(createFeatureIcon(feature.icon), copy);
  return card;
}

export function createSignConstructionSection() {
  const baseURL = import.meta.env?.BASE_URL ?? './';
  const section = element('section', 'sign-construction');
  section.id = 'sign-construction';
  section.setAttribute('aria-labelledby', 'sign-construction-title');
  const inner = element('div', 'container sign-construction-inner');

  const copyColumn = element('div', 'sign-construction-copy');
  const heading = element('div', 'sign-construction-heading');
  const title = element('h2', 'sign-construction-title', t('Built for safe isolation.'));
  title.id = 'sign-construction-title';
  heading.append(
    element('p', 'sign-construction-eyebrow', t('LOCKOUT TAGOUT')), title,
    element('p', 'sign-construction-intro', t('Padlocks, hasps, valve, electrical and cable lockouts, kits and tags to isolate energy and keep every maintenance job safe.')));
  const features = element('div', 'sign-construction-features');
  FEATURE_CARDS.forEach(feature => features.append(createFeatureCard(feature)));
  copyColumn.append(heading, features);
  if (productProfile.catalogueURL) {
    const catalogueLink = element('a', 'sign-construction-catalogue-link');
    catalogueLink.href = `${baseURL}${productProfile.catalogueURL}`;
    catalogueLink.download = productProfile.catalogueFile;
    catalogueLink.append(element('span', '', t('View Catalogue')), element('span', 'sign-construction-link-arrow', '→'));
    copyColumn.append(catalogueLink);
  }

  // One feature visual (template §4.2). Until the file exists the standard "Image unavailable" box shows.
  const visualColumn = element('div', 'sign-construction-visual-column');
  const visualPanel = element('figure', 'sign-construction-visual-panel');
  const alt = t('Handyman lockout tagout padlocks, valve and breaker lockout devices');
  visualPanel.append(productImage({ image_url: productProfile.featureVisual, display_name_en: alt, display_name_vi: alt }, { eager: true }));
  visualColumn.append(visualPanel);

  inner.append(copyColumn, visualColumn);
  section.append(inner);
  return section;
}
