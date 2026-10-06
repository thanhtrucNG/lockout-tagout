import { element } from '../lib/dom.js';
import { t } from '../lib/locale.js';

// Size / option step. Only the options of the chosen product are drawn (the shop has hundreds of different sizes,
// so a matrix of every size with the unavailable ones disabled would be noise). Option order = data order.
export function createSizeMatrix(onSelect) {
  const root = element('div', 'step-choices');
  const grid = element('div', 'size-matrix');
  root.append(grid);
  let signature = '';
  let buttons = [];
  function render(options) {
    buttons = options.map(({ value }) => {
      const button = element('button', 'attribute-option');
      button.type = 'button'; button.dataset.value = value;
      const mark = element('span', 'option-check', '✓');
      mark.setAttribute('aria-hidden', 'true');
      button.append(element('span', 'option-label', t(value)), mark);
      button.addEventListener('click', () => { if (!button.disabled) onSelect('dimensions_display', value); });
      return button;
    });
    grid.replaceChildren(...buttons);
  }
  return { element: root, update(step) {
    const options = step.locked ? [] : step.options.filter(option => option.available !== false);
    const next = options.map(option => option.value).join('|');
    if (next !== signature) { signature = next; render(options); }
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(step.selected === button.dataset.value));
    }
  } };
}
