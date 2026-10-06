import { element, icon, productImage } from '../lib/dom.js';
import { language, t } from '../lib/locale.js';
import { formatPrice, getProductName, getProductPrice } from '../lib/storefront.js';
import { createQuantityStepper } from './quantity-stepper.js';
import { productCode, productSpec } from '../lib/product-profile.js';

// One persistent final card: edition changes update fields, not the purchase DOM.
export function createEditionPurchase({ number, catalogue, cart, announce, onSelect, getState }) {
  const root = element('fieldset', 'configuration-step edition-purchase');
  root.dataset.field = 'edition';
  const legend = element('legend'); legend.tabIndex = -1;
  legend.append(element('span', 'step-number', String(number)), element('span', '', t('Choose a pack')));
  const identity = element('div', 'edition-identity');
  const imageSlot = element('div', 'edition-preview');
  const details = element('div', 'edition-details');
  const copy = element('div', 'result-copy');
  const title = element('h3', 'result-title');
  const impa = element('p', 'result-impa');
  const reference = element('p', 'result-reference');
  copy.append(title, impa, reference); identity.append(imageSlot, details);
  const choices = element('div', 'step-choices attribute-options');
  const form = element('form', 'edition-controls');
  const price = element('div', 'result-price');
  const priceValue = element('strong'); price.append(element('span', 'price-label', t('Unit price')), priceValue);
  const add = element('button', 'button button-primary add-to-cart', t('Add to order')); add.type = 'submit';
  let product = null, imageKey = null;
  const quantity = createQuantityStepper('', { onChange() { clearFeedback(); updateAmounts(); } });
  const quantityGroup = element('div', 'edition-quantity'); quantityGroup.append(element('span', 'price-label', t('Quantity')), quantity.element);
  const feedback = element('p', 'edition-feedback');
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  feedback.setAttribute('aria-atomic', 'true');
  let feedbackTimer;
  function clearFeedback() { clearTimeout(feedbackTimer); feedback.replaceChildren(); }
  form.append(price, quantityGroup, add, feedback);
  details.append(copy, choices, form);
  root.append(legend, identity);
  const optionButtons = new Map();
  function updateAmounts() {
    const valid = quantity.element.querySelector('input').validity.valid;
    const source = product && getProductPrice(product, language);
    priceValue.textContent = source ? formatPrice(source.amount, source.currency) : '—';
    add.disabled = !product || !valid;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    clearFeedback();
    try {
      if (!product || getState().resolvedSku?.id !== product.id) throw Error(t('Choose an exact product before adding it to your order.'));
      cart.add(product.id, quantity.getValue());
      quantity.setValue(1);
      updateAmounts();
      feedback.append(icon('check'), element('span', '', t('Added to order')));
      feedbackTimer = setTimeout(clearFeedback, 1200);
    } catch (error) { announce(error.message); }
  });
  function update(state) {
    root.disabled = false; root.removeAttribute('aria-disabled');
    const step = state.visibleSteps.find(step => step.field === 'edition');
    if (product?.id !== state.resolvedSku?.id) clearFeedback();
    product = state.resolvedSku;
    const current = product ?? catalogue.getById(state.currentCandidates[0]?.id);
    root.dataset.state = product ? 'complete' : 'current';
    if (product) identity.dataset.sku = product.id; else delete identity.dataset.sku;
    title.textContent = getProductName(current, language);
    impa.textContent = productSpec(current); impa.hidden = !impa.textContent;
    reference.textContent = productCode(current);
    const key = `${current.image_url}:${title.textContent}`;
    if (key !== imageKey) { imageSlot.replaceChildren(productImage(current, { eager: true })); imageKey = key; }
    choices.hidden = step.options.length < 2; // one pack only: nothing to choose
    const values = new Set(step.options.map(o => o.value));
    for (const [value, button] of optionButtons) if (!values.has(value)) { button.remove(); optionButtons.delete(value); }
    for (const option of step.options) {
      let button = optionButtons.get(option.value);
      if (!button) {
        button = element('button', 'attribute-option'); button.type = 'button'; button.dataset.value = option.value;
        button.append(element('span', 'option-check', '✓'), element('span', 'option-label', t(option.value)));
        button.addEventListener('click', () => onSelect('edition', option.value));
        optionButtons.set(option.value, button); choices.append(button);
      }
      button.setAttribute('aria-pressed', String(step.selected === option.value));
      button.querySelector('.option-check').style.visibility = step.selected === option.value ? 'visible' : 'hidden';
    }
    const controls = quantity.element.querySelectorAll('button, input');
    quantity.setValue(quantity.getValue());
    controls[0].setAttribute('aria-label', `${t('Decrease quantity for')} ${current.id}`);
    controls[1].setAttribute('aria-label', `${t('Quantity for')} ${current.id}`);
    controls[2].setAttribute('aria-label', `${t('Increase quantity for')} ${current.id}`);
    for (const control of controls) if (!product) control.disabled = true;
    if (product) { controls[1].disabled = false; quantity.setValue(quantity.getValue()); }
    add.setAttribute('aria-label', `${t('Add to order')}: ${product?.barcode ?? title.textContent}`);
    updateAmounts();
  }
  return { element: root, update };
}
