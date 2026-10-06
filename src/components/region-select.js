import { element } from '../lib/dom.js';
import { t } from '../lib/locale.js';
import { regionsFor, regionName } from '../checkout/regions.js';

// City / Province field. For countries with a region list it is a searchable combobox (same keyboard
// model as the country picker); for other countries it is a plain text input; with no country it is disabled.
export function createRegionSelect({ language, onInput, onSelect, onBlur }) {
  const root = element('div', 'country-select region-select');
  const input = element('input'); input.type = 'text';
  const list = element('div', 'country-options'); list.id = 'region-options'; list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', t('City / Province')); list.hidden = true;
  let regions = [], options = [], active = -1, country = null;
  const normalize = text => text.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const label = region => regionName(region, language);
  function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; }
  function select(region) { input.value = label(region); close(); onSelect(region.code); }
  function highlight(index) {
    active = index;
    [...list.children].forEach((option, i) => option.setAttribute('aria-selected', String(i === active)));
    if (list.children[active]) { input.setAttribute('aria-activedescendant', list.children[active].id); list.children[active].scrollIntoView({ block: 'nearest' }); }
  }
  function open(all = false) {
    if (!regions.length) return;
    const query = normalize(input.value.trim());
    options = regions.filter(region => all || normalize(label(region)).includes(query));
    list.replaceChildren(); active = -1; input.removeAttribute('aria-activedescendant');
    for (const region of options) {
      const row = element('div', 'country-option', label(region)); row.id = `region-${region.code}`; row.setAttribute('role', 'option'); row.setAttribute('aria-selected', 'false');
      row.addEventListener('mousedown', event => { event.preventDefault(); select(region); }); list.append(row);
    }
    if (!options.length) list.append(element('div', 'country-empty', t('No provinces found')));
    list.hidden = false; input.setAttribute('aria-expanded', 'true');
  }
  /** Switch between list / free-text / disabled for the selected country code ('' = none). */
  function setCountry(code) {
    if (code === country) return;
    country = code; regions = code ? regionsFor(code, language) : []; close();
    input.disabled = !code;
    input.placeholder = code ? '' : t('Select a country first');
    input.autocomplete = regions.length ? 'off' : 'address-level1';
    if (regions.length) {
      input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-controls', list.id);
    } else {
      for (const name of ['role', 'aria-autocomplete', 'aria-expanded', 'aria-controls', 'aria-activedescendant']) input.removeAttribute(name);
    }
  }
  input.addEventListener('focus', () => open(regions.some(region => label(region) === input.value)));
  input.addEventListener('click', () => { if (list.hidden) open(true); });
  input.addEventListener('input', () => { onInput(input.value); open(); });
  input.addEventListener('blur', () => {
    // An exact typed (or autofilled) name counts as picking that region.
    const exact = regions.find(region => normalize(label(region)) === normalize(input.value.trim()));
    close();
    if (exact) onSelect(exact.code);
    onBlur();
  });
  input.addEventListener('keydown', event => {
    if (!regions.length) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); if (list.hidden) open(true);
      if (options.length) highlight(active < 0 ? (event.key === 'ArrowDown' ? 0 : options.length - 1) : (active + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    }
    if (event.key === 'Enter' && !list.hidden) { event.preventDefault(); const pick = options[active] ?? (options.length === 1 ? options[0] : null); if (pick) select(pick); }
  });
  setCountry('');
  root.append(input, list);
  return { root, input, setCountry };
}
