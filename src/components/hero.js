import { element, icon } from '../lib/dom.js';
import { t } from '../lib/locale.js';
import { scrollToElement } from '../lib/scroll.js';
import { productProfile } from '../lib/product-profile.js';

// Template §1.1 hero: eyebrow, two-line H1, two buttons. The hero photo is optional until supplied; without it the
// designed navy motif stays (see marine-theme.css).
export function createHero() {
  const hero = element('section', 'hero');
  hero.setAttribute('aria-labelledby', 'hero-title');
  const probe = new Image();
  probe.addEventListener('load', () => {
    // Absolute URL: a relative url() inside a custom property resolves against the stylesheet, not the page.
    hero.style.setProperty('--hero-photo', `url('${new URL(productProfile.heroPhoto, document.baseURI).href}')`);
    hero.classList.add('hero-has-photo');
  });
  probe.src = productProfile.heroPhoto;

  const inner = element('div', 'container hero-inner');
  const copy = element('div', 'hero-copy');
  const eyebrow = element('p', 'eyebrow');
  eyebrow.append(`${productProfile.brand} `, element('span', 'eyebrow-accent', 'BY HANDYMAN'));
  const title = element('h1', '', t('Lockout tagout equipment'));
  title.id = 'hero-title';
  title.append(element('span', 'hero-title-second', t('for safe, compliant maintenance.')));

  const actions = element('div', 'hero-actions');
  const order = element('a', 'button button-primary hero-action');
  order.append(element('span', '', t('Find your product')), icon('arrow'));
  order.href = '#find-your-sign';
  order.addEventListener('click', event => {
    const target = document.querySelector('#find-your-sign');
    if (!target) return;
    event.preventDefault();
    scrollToElement(target, { focus: true });
    history.replaceState(null, '', '#find-your-sign');
  });
  actions.append(order);
  if (productProfile.catalogueURL) {
    const catalogue = element('a', 'button hero-action hero-action-secondary');
    catalogue.append(element('span', '', t('Download catalogue')), icon('download'));
    catalogue.href = `./${productProfile.catalogueURL}`;
    catalogue.download = productProfile.catalogueFile;
    actions.append(catalogue);
  }
  copy.append(eyebrow, title, actions);
  inner.append(copy);
  hero.append(inner);
  return hero;
}
