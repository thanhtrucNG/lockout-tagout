import { createFooter } from './components/footer.js';

const productsURL = './src/data/products.json';
const familiesURL = './src/data/families.json';
const taxonomyURL = './src/data/taxonomy.json';
const configuratorURL = './src/data/configurator.json';
// Every price shown is the list price in products.json × PRICE_FACTOR (template §12.2: 10% off from 2026-10-03).
// The data keeps the list prices; ending or changing the discount = changing this one number.
const PRICE_FACTOR = 0.9;
const pricePercent = Math.round(PRICE_FACTOR * 100);
// VND to the whole đồng, USD to the cent. Integer maths so a half rounds up reliably (2.85 → 256.5¢ → 2.57).
const discounted = ({ VND, USD }) => ({
  VND: Math.round(VND * pricePercent / 100),
  USD: Math.round(Math.round(USD * 100) * pricePercent / 100) / 100,
});
import { createCatalogue } from './lib/product-catalogue.js';
import { createCartStore } from './cart/cart-store.js';
import { checkoutConfig } from './checkout/config.js';
import { createPaymentService } from './checkout/payment-service.js';
import { createCheckoutStore } from './checkout/checkout-store.js';
import { createHeader } from './components/header.js';
import { createHero } from './components/hero.js';
import { createSignConstructionSection } from './components/sign-construction.js';
import { language, t } from './lib/locale.js';
import { createProductConfigurator } from './components/product-configurator.js';
import { createOrderSummary } from './components/order-summary.js';
import { element } from './lib/dom.js';















const feedback = document.querySelector('#cart-feedback');
let toastTimer;
function positionToast() {
  if (!feedback.classList.contains('is-visible')) return;
  feedback.classList.remove('toast-announcement-only');
  feedback.style.left = ''; feedback.style.top = ''; feedback.style.bottom = ''; feedback.style.right = '';
  const box = feedback.getBoundingClientRect();
  const obstacles = [...document.querySelectorAll('button,input,a,select,.site-header,.mobile-summary-bar')]
    .map(el => el.getBoundingClientRect()).filter(r => r.width && r.height && r.bottom > 0 && r.top < innerHeight);
  const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
  const candidates = [[box.left, box.top], [16, box.top], [innerWidth - box.width - 16, headerBottom + 8], [16, headerBottom + 8]];
  const safe = candidates.find(([x,y]) => y >= 0 && y + box.height <= innerHeight && !obstacles.some(r => x < r.right && x + box.width > r.left && y < r.bottom && y + box.height > r.top));
  if (safe) { feedback.style.left = `${safe[0]}px`; feedback.style.top = `${safe[1]}px`; feedback.style.bottom = 'auto'; feedback.style.right = 'auto'; }
  else feedback.classList.add('toast-announcement-only'); // Keep the live announcement; the shared summary remains visible feedback.
}
window.addEventListener('scroll', positionToast, { passive: true });
window.addEventListener('resize', positionToast);
function announce(message) {
  clearTimeout(toastTimer);
  feedback.textContent = '';
  requestAnimationFrame(() => {
    feedback.textContent = message;
    feedback.classList.add('is-visible');
    positionToast();
    toastTimer = setTimeout(() => feedback.classList.remove('is-visible'), 2200);
  });
}

async function start() {
  const [listProducts, families, taxonomy, mapping] = await Promise.all([productsURL, familiesURL, taxonomyURL, configuratorURL].map(async url => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Catalogue request failed.');
    return response.json();
  }));
  // The one place prices enter the app: search, configurator, cart, summary and checkout all read these.
  const products = listProducts.map(product => product.prices ? { ...product, prices: discounted(product.prices) } : product);
  const catalogue = createCatalogue(products);
  let storage;
  try { storage = window.localStorage; } catch { /* Session-only cart remains usable. */ }
  const cart = createCartStore(catalogue, storage, language);
  const checkout = createCheckoutStore({ cart, storage, currency: language === 'vi' ? 'VND' : 'USD', language, config: checkoutConfig,
    service: createPaymentService(checkoutConfig),
    onEvent: (type, order) => window.dispatchEvent(new CustomEvent(`hyperion:${type}`, { detail: order })),
  });
  document.querySelector('.skip-link').textContent = t('Skip to order');
  document.querySelector('#site-header').replaceWith(createHeader());
  const workflow = element('div', 'shopping-layout container');
  const shopping = element('div', 'shopping-main');
  shopping.append(createProductConfigurator(families, taxonomy, catalogue, mapping, cart, announce, checkout));
  const summary = createOrderSummary({ catalogue, cart, announce, checkout });
  workflow.append(shopping, summary.element);
  document.querySelector('#main').replaceChildren(createHero(products), createSignConstructionSection(), workflow);
  document.querySelector('#main').after(createFooter());
}

start().catch(() => {
  const message = document.createElement('p');
  message.className = 'container startup-message';
  message.textContent = 'The product catalogue could not be loaded. Reload this page to try again.';
  message.setAttribute('role', 'alert');
  document.querySelector('#main').replaceChildren(message);
});
