import { element, icon, productImage } from '../lib/dom.js';
import { createSearchResult } from './search-result.js';
import { language, t, tn } from '../lib/locale.js';
import { getProductName } from '../lib/storefront.js';
import { productSpec } from '../lib/product-profile.js';
import { groupSearchResults } from '../lib/search-presentation.js';

const PAGE_SIZE = 8;

export function createProductSearch(catalogue, cart, announce) {
  const section = element('section', 'lookup');
  section.id = 'product-lookup';
  section.setAttribute('aria-labelledby', 'lookup-title');
  const panel = element('div', 'lookup-panel');
  const heading = element('div', 'lookup-heading');
  const title = element('h2', '', t('Product search / lookup'));
  title.id = 'lookup-title';
  heading.append(title);
  const form = element('form', 'search-form');
  form.setAttribute('role', 'search');
  const label = element('label', 'sr-only', t('Search by product code or name'));
  label.htmlFor = 'product-query';
  const field = element('div', 'search-field');
  const input = element('input');
  input.id = 'product-query';
  input.name = 'q';
  input.type = 'search';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.placeholder = t('Search code or product name');
  input.setAttribute('aria-description', t('Search product code or name — English/Vietnamese, partial search supported'));
  input.setAttribute('aria-controls', 'search-results');
  const clear = element('button', 'search-clear', '×');
  clear.type = 'button';
  clear.setAttribute('aria-label', t('Clear search'));
  clear.hidden = true;
  field.append(icon('search'), input, clear);
  const submit = element('button', 'button button-primary search-submit', t('Find products'));
  submit.type = 'submit';
  submit.append(icon('arrow'));
  form.append(label, field, submit);
  panel.append(heading, form);

  const results = element('div', 'search-results');
  results.id = 'search-results';
  const resultHeading = element('div', 'results-heading');
  const status = element('p', 'results-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  resultHeading.append(status);
  const empty = element('div', 'search-empty');
  empty.append(icon('search'), element('h3', '', t('No matching lockout tagout product found')),
    element('p', '', t('Check the code or try another English or Vietnamese product name.')));
  const grid = element('div', 'results-grid');
  grid.setAttribute('role', 'region');
  grid.setAttribute('aria-label', t('Matching products'));
  grid.tabIndex = 0;
  const more = element('button', 'button load-more', t('Show more results'));
  more.type = 'button';
  more.hidden = true;
  results.append(resultHeading, empty, grid, more);
  section.append(panel, results);
  let matches = [];
  let shown = 0;
  let timer;
  const cards = new Map();

  function showNext() {
    const next = matches.slice(shown, shown + PAGE_SIZE);
    for (const product of next) cards.set(product.id, createSearchResult(product, cart, announce));
    shown += next.length;
    const scrollTop = grid.scrollTop;
    const contents = groupSearchResults(matches.slice(0, shown)).map(group => {
      if (!group.shared) return cards.get(group.products[0].id);
      const family = element('section', 'search-family');
      const first = group.products[0];
      family.dataset.family = first.product_family_id;
      const header = element('div', 'search-family-heading');
      const copy = element('div');
      copy.append(element('h3', '', getProductName(first, language)));
      const spec = productSpec(first);
      if (spec) copy.append(element('p', '', spec));
      header.append(productImage(first), copy);
      const variants = element('div', 'search-family-variants');
      for (const product of group.products) {
        const card = cards.get(product.id);
        card.classList.add('grouped-result');
        variants.append(card);
      }
      family.append(header, variants);
      return family;
    });
    grid.replaceChildren(...contents);
    grid.scrollTop = scrollTop;
    grid.hidden = !matches.length;
    more.hidden = shown >= matches.length;
    status.textContent = tn(matches.length, '{n} matching SKU', '{n} matching SKUs')
      + (shown < matches.length ? t(' · showing {n}').replaceAll('{n}', String(shown)) : '');
  }

  function runSearch(updateURL = true) {
    clearTimeout(timer);
    const query = input.value.trim();
    clear.hidden = !input.value;
    if (updateURL) {
      const url = new URL(location.href);
      if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
    }
    matches = catalogue.search(query);
    shown = 0;
    cards.clear();
    grid.replaceChildren();
    empty.hidden = !query || matches.length > 0;
    results.hidden = !query;
    showNext();
    if (!query) status.textContent = '';
  }

  input.addEventListener('input', () => {
    clear.hidden = !input.value;
    clearTimeout(timer);
    timer = setTimeout(runSearch, 180);
  });
  form.addEventListener('submit', event => { event.preventDefault(); runSearch(); });
  clear.addEventListener('click', () => { input.value = ''; runSearch(); input.focus(); });
  more.addEventListener('click', () => {
    const firstNew = shown;
    showNext();
    const card = cards.get(matches[firstNew]?.id);
    if (card) {
      card.tabIndex = -1;
      card.focus({ preventScroll: true });
      card.scrollIntoView({ block: 'nearest' });
    }
  });
  window.addEventListener('popstate', () => {
    input.value = new URLSearchParams(location.search).get('q') ?? '';
    runSearch(false);
  });
  input.value = new URLSearchParams(location.search).get('q') ?? '';
  runSearch(false);
  return section;
}
