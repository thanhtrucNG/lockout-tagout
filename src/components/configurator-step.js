import { element, productImage } from '../lib/dom.js';
import { language, t, tn } from '../lib/locale.js';

const textKey = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/đ/g, 'd');
export function createConfiguratorStep({ field, title, number, options, selected, visual, onSelect, uiState = {} }) {
  const root = element('fieldset', 'configuration-step');
  root.dataset.field = field;
  root.dataset.state = selected ? 'complete' : 'current';
  const legend = element('legend');
  legend.tabIndex = -1;
  legend.append(element('span', 'step-number', String(number)), element('span', '', title));
  if (!selected) legend.setAttribute('aria-current', 'step');
  root.append(legend);
  const choices = element('div', 'step-choices');
  // Mixture choices scroll inside a fixed-height box, so long categories never stretch the page.
  const grid = element('div', visual ? `sign-option-grid${field === 'product_family_id' ? ' design-option-grid' : ' scroll-option-grid'}` : 'attribute-options');
  const nodes = [];
  // Keep the current option visible even when the inline filter excludes it.
  const sorted = options;
  for (const option of sorted) {
    const button = element('button', visual ? 'sign-option' : 'attribute-option');
    button.type = 'button';
    { const mark = element('span', 'option-check', '✓'); mark.setAttribute('aria-hidden', 'true'); mark.hidden = option.value !== selected; button.append(mark); }
    button.dataset.value = option.value;
    button.setAttribute('aria-pressed', String(option.value === selected));
    if (visual) button.append(productImage(option.product));
    if (option.arrow) { const arrow = element('span', 'direction-arrow', option.arrow); arrow.setAttribute('aria-hidden', 'true'); button.append(arrow); }
    button.append(element('span', 'option-label', option.label));
    if (option.detail) button.append(element('span', 'option-detail', option.detail));
    button.addEventListener('click', () => onSelect(field, option.value));
    nodes.push({ button, option });
    grid.append(button);
  }
  const status = element('p', 'filter-status');
  status.setAttribute('role', 'status');
  function renderOptions() {
    const query = textKey((uiState.query ?? '').trim());
    const matches = nodes.filter(({ option }) => textKey(option.searchText).includes(query));
    const shown = new Set(matches.map(({ option }) => option.value));
    if (selected) shown.add(selected);
    for (const { button, option } of nodes) button.hidden = !shown.has(option.value);
    status.textContent = matches.length || selected ? '' : t('No matching products. Try another name or code.');
  }
  // Keep the chosen card in view inside the scroll box (the page itself does not move).
  const revealSelected = () => {
    const chosen = nodes.find(({ option }) => option.value === selected)?.button;
    // The grid is position: relative, so offsetTop is already measured from the top of the scroll box.
    if (chosen && grid.scrollHeight > grid.clientHeight) grid.scrollTop = Math.max(0, chosen.offsetTop - 8);
  };
  if (options.length > 8) {
    const label = element('label', 'concept-filter-label', t('Filter these products'));
    const input = element('input', 'concept-filter');
    input.type = 'search';
    input.id = `filter-${field}`;
    input.placeholder = t('Type a product name or code');
    label.htmlFor = input.id;
    input.value = uiState.query ?? '';
    const filter = () => {
      uiState.query = input.value;
      renderOptions();
      grid.scrollTop = 0;
    };
    input.addEventListener('input', filter);
    choices.append(label, input, status);
  }
  renderOptions();
  choices.append(grid);
  root.append(choices);
  requestAnimationFrame(revealSelected);
  root.updateSelection = value => {
    selected = value;
    if (selected) legend.removeAttribute('aria-current');
    else legend.setAttribute('aria-current', 'step');
    for (const { button, option } of nodes) {
      button.setAttribute('aria-pressed', String(option.value === selected));
      button.querySelector('.option-check').hidden = option.value !== selected;
    }
    renderOptions();
  };
  return root;
}

export function describeOption(field, option, { mapping, families, catalogue }) {
  let label, detail, arrow;
  let members;
  if (field === 'config_concept') {
    const concept = mapping.concepts.find(concept => concept.id === option.value);
    label = concept[`label_${language}`]; detail = concept[`detail_${language}`];
    members = families.filter(family => concept.family_ids.includes(family.id));
  } else if (field === 'config_direction') {
    const direction = mapping.directions.find(direction => direction.id === option.value);
    label = direction[`label_${language}`]; arrow = direction.arrow;
    const ids = new Set(mapping.families.filter(family => family.config_direction === option.value).map(family => family.product_family_id));
    members = families.filter(family => ids.has(family.id));
  } else if (field === 'product_family_id') {
    members = families.filter(family => family.id === option.value);
    label = members[0][`design_${language}`] ?? members[0][`display_name_${language}`];
    detail = tn(members[0].sku_ids.length, '{n} option', '{n} options');
  } else { label = t(option.value); members = []; }
  const product = members[0] ? catalogue.getById(members[0].sku_ids[0]) : null;
  return { ...option, label, detail, arrow, product,
    searchText: [label, ...members.flatMap(family => [family.display_name_en, family.display_name_vi, ...family.sku_ids.map(id => catalogue.getById(id).internal_reference)])].join(' ') };
}
