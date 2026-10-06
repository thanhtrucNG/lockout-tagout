import { element } from '../lib/dom.js';
import { t } from '../lib/locale.js';
import { corporate } from '../data/corporate.js';

// The three direct ways to reach sales: phone call, WhatsApp message, Zalo chat.
export function contactOptionLinks(baseURL = './') {
  const digits = corporate.phone_href.replace(/\D/g, '');
  return [
    { key: 'phone', icon: 'phone.png', title: t('Call us'), detail: corporate.phone, href: corporate.phone_href },
    { key: 'whatsapp', icon: 'whatsapp.png', title: 'WhatsApp', detail: t('Chat on WhatsApp'), href: `https://wa.me/${digits}`, external: true },
    { key: 'zalo', icon: 'zalo.png', title: 'Zalo', detail: t('Chat on Zalo'), href: corporate.zalo_href, external: true },
  ].map(option => {
    const link = element('a', `contact-option contact-option-${option.key}`);
    link.href = option.href;
    if (option.external) { link.target = '_blank'; link.rel = 'noopener'; }
    const icon = element('img', 'contact-option-icon');
    icon.src = `${baseURL}assets/icons/${option.icon}`; icon.alt = ''; icon.width = 40; icon.height = 40;
    const copy = element('span', 'contact-option-copy');
    copy.append(element('strong', '', option.title), element('span', '', option.detail));
    link.append(icon, copy);
    return link;
  });
}

/** A CONTACT SALES button that reveals the three contact options (dropdown on desktop, inline in the mobile menu). */
export function createContactSales({ id, variant, baseURL, onPick = () => {} }) {
  const root = element('div', `contact-sales contact-sales--${variant}`);
  const button = element('button', `header-contact-sales header-contact-sales--${variant}`, t('Contact sales'));
  button.type = 'button';
  const panel = element('div', 'contact-options');
  panel.id = id; panel.hidden = true;
  button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', id);
  const links = contactOptionLinks(baseURL);
  panel.append(...links);
  root.append(button, panel);

  function setOpen(open, { returnFocus = false } = {}) {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open) {
      document.addEventListener('pointerdown', outside, true);
      document.addEventListener('keydown', escape);
    } else {
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('keydown', escape);
      if (returnFocus) button.focus();
    }
  }
  const outside = event => { if (!root.contains(event.target)) setOpen(false); };
  const escape = event => { if (event.key === 'Escape') { event.stopPropagation(); setOpen(false, { returnFocus: true }); } };
  button.addEventListener('click', () => setOpen(panel.hidden));
  for (const link of links) link.addEventListener('click', () => { setOpen(false); onPick(); });
  return { element: root, button, close: () => setOpen(false) };
}
