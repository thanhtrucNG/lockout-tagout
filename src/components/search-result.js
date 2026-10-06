import { element, icon, productImage } from '../lib/dom.js';
import { formatPrice, getProductPrice, getProductName } from '../lib/storefront.js';
import { language, t } from '../lib/locale.js';
import { productCode, productSpec } from '../lib/product-profile.js';
import { createQuantityStepper } from './quantity-stepper.js';

export function createSearchResult(product, cart, announce) {
  const card = element('article', 'result-card');
  card.dataset.sku = product.id;
  const top = element('div', 'result-main');
  const copy = element('div', 'result-copy');
  const name = getProductName(product, language);
  const title = element('h3', 'result-title', name);
  const metadata = element('div', 'result-metadata');
  const spec = productSpec(product);
  if (spec) metadata.append(element('span', 'dimensions', spec));
  if (product.edition) metadata.append(element('span', 'edition', t(product.edition)));
  const reference = element('p', 'result-reference', productCode(product));
  copy.append(title, metadata, reference);
  top.append(productImage(product), copy);

  const purchase = element('form', 'result-purchase');
  purchase.setAttribute('aria-label', `${t('Add to order')}: ${product.barcode}`);
  const price = element('div', 'result-price');
  const sourcePrice = getProductPrice(product, language);
  price.append(element('span', 'price-label', t('Unit price')),
    element('strong', '', formatPrice(sourcePrice.amount, sourcePrice.currency)));
  const add = element('button', 'button button-primary add-to-cart');
  add.type = 'submit';
  add.append(icon('cart'), element('span', '', t('Add to order')));
  add.setAttribute('aria-label', `${t('Add to order')}: ${product.barcode}`);
  const quantity = createQuantityStepper(product.id, {
    onChange(_value, valid) { add.disabled = !valid; },
  });
  purchase.append(price, quantity.element, add);
  purchase.addEventListener('submit', event => {
    event.preventDefault();
    try {
      cart.add(product.id, quantity.getValue());
      announce(`${t('Added to order')}: ${quantity.getValue()} × ${name} · ${product.barcode}`);
    } catch (error) { announce(t(error.message)); }
  });
  card.append(top, purchase);
  return card;
}
