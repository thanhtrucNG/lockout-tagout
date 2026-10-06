import { element } from '../lib/dom.js';
import { language, t } from '../lib/locale.js';
import { createContactSales } from './contact-options.js';
import { scrollToElement } from '../lib/scroll.js';
import { productProfile } from '../lib/product-profile.js';

function scrollToSection(href) {
  scrollToElement(document.querySelector(href), { focus: true });
}

export function createHeader() {
  const baseURL = import.meta.env?.BASE_URL ?? './';
  const header = element('header', 'site-header');
  const inner = element('div', 'container header-inner');
  const brand = element('a', 'brand');
  brand.href = './';
  brand.setAttribute('aria-label', t('Handyman home'));

  const logo = element('img', 'brand-logo');
  logo.src = `${baseURL}assets/handyman-logo.png`;
  logo.alt = 'Handyman — Where jobs get done';
  logo.width = 584;
  logo.height = 143;
  brand.append(logo);

  const nav = element('nav', 'header-actions');
  nav.setAttribute('aria-label', t('Menu'));

  const links = element('div', 'header-nav-links');
  links.id = 'header-section-links';

  const sectionLinks = [
    ['ORDER', '#find-your-sign'],
  ];

  for (const [label, href] of sectionLinks) {
    const link = element('a', 'header-section-link', t(label));
    link.href = href;
    link.addEventListener('click', event => {
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      close();
      scrollToSection(href);
      history.replaceState(null, '', href);
    });
    links.append(link);
  }

  if (productProfile.catalogueURL) {
    const catalogue = element('a', 'header-section-link header-catalogue-link', t('CATALOGUE'));
    catalogue.href = `${baseURL}${productProfile.catalogueURL}`;
    catalogue.download = productProfile.catalogueFile;
    links.append(catalogue);
  }

  // Contact sales opens the three direct contact options (phone, WhatsApp, Zalo) — no form.
  const mobileSales = createContactSales({ id: 'contact-options-menu', variant: 'menu', baseURL, onPick: () => close() });
  links.append(mobileSales.element);

  const locales = element('div', 'language-switch');
  locales.setAttribute('aria-label', 'Language / Ngôn ngữ');
  locales.setAttribute('role', 'group');

  for (const code of ['en', 'vi']) {
    const button = element('button', 'language-option', code.toUpperCase());
    button.type = 'button';
    button.dataset.locale = code;
    button.setAttribute('aria-label', code === 'en' ? 'English' : 'Tiếng Việt');
    button.setAttribute('aria-pressed', String(code === language));
    button.addEventListener('click', () => {
      if (code === language) return;
      const url = new URL(location.href);
      url.searchParams.set('lang', code);
      // q/group are already represented by URL state; configurator/contact drafts use session storage.
      location.assign(url);
    });
    locales.append(button);
  }

  const desktopSales = createContactSales({ id: 'contact-options-desktop', variant: 'desktop', baseURL });

  const toggle = element('button', 'header-menu', t('Menu'));
  toggle.type = 'button';
  toggle.setAttribute('aria-controls', links.id);
  toggle.setAttribute('aria-expanded', 'false');

  const narrow = matchMedia('(max-width: 1023.98px)');

  function close() {
    mobileSales.close();
    links.hidden = narrow.matches;
    toggle.hidden = !narrow.matches;
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    links.hidden = !links.hidden;
    toggle.setAttribute('aria-expanded', String(!links.hidden));
  });

  links.addEventListener('click', event => {
    if (event.target.closest('a')) close();
  });

  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && narrow.matches) {
      close();
      toggle.focus();
    }
  });

  narrow.addEventListener('change', close);
  close();

  nav.append(links, locales, desktopSales.element, toggle);
  inner.append(brand, nav);
  header.append(inner);
  return header;
}
